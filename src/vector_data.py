"""Read sparse ROMS forecast vectors through OPeNDAP ASCII (standard library only)."""
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone, timedelta
import json
import math
import re
from urllib.parse import quote
from urllib.request import urlopen
import xml.etree.ElementTree as ET

HOST = 'https://opendap.co-ops.nos.noaa.gov'
MODELS = {'CBOFS', 'CIOFS', 'DBOFS', 'GOMOFS', 'TBOFS', 'WCOFS'}


def fetch(url):
    with urlopen(url, timeout=40) as response:
        return response.read().decode('utf-8')


def dimensions(dds):
    return {name: [(d, int(n)) for d, n in re.findall(r'\[(\w+)\s*=\s*(\d+)\]', dims)]
            for name, dims in re.findall(r'(?:Float\d+|Int\d+)\s+(\w+)((?:\[[^\]]+\])+);', dds)}


def attributes(das, name):
    block = re.search(r'\b' + re.escape(name) + r'\s*\{([^{}]*)\}', das)
    if not block:
        raise ValueError('Missing metadata for ' + name)
    return {k: v.strip().strip('"') for k, v in
            re.findall(r'\w+\s+(\w+)\s+([^;]+);', block.group(1))}


def ascii_arrays(text):
    """Parse flat primitive arrays, validating declared value counts."""
    if '---------------------------------------------' not in text:
        raise ValueError('Invalid OPeNDAP response')
    header, body = text.split('---------------------------------------------', 1)
    shapes = dimensions(header)
    arrays, current = {}, None
    for line in body.splitlines():
        line = line.strip()
        match = re.fullmatch(r'(\w+)(?:\[\d+\])+', line)
        if match:
            current = match.group(1)
            arrays[current] = []
        elif line and current:
            line = re.sub(r'^(?:\[\d+\])+,\s*', '', line)
            arrays[current].extend(float(v.strip()) for v in line.split(',') if v.strip())
    for name, dims in shapes.items():
        if len(arrays.get(name, [])) != math.prod(n for _, n in dims):
            raise ValueError('Unexpected OPeNDAP value count: ' + name)
    return arrays


def query(base, expressions):
    return ascii_arrays(fetch(base + '.ascii?' + quote(','.join(expressions), safe=',:')))


def clean(values, attrs):
    missing = [float(attrs[k]) for k in ('_FillValue', 'missing_value') if k in attrs]
    scale, offset = float(attrs.get('scale_factor', 1)), float(attrs.get('add_offset', 0))
    return [v * scale + offset if math.isfinite(v) and v not in missing else math.nan for v in values]


def rotate(u, v, angle):
    return u * math.cos(angle) - v * math.sin(angle), u * math.sin(angle) + v * math.cos(angle)


def read_vectors(model, field, requested=''):
    if model not in MODELS or field not in ('currents', 'wind'):
        raise ValueError('Unsupported model or vector field')
    from ofs_data import resolve
    base = HOST + '/thredds/dodsC/' + resolve(model,requested)
    time_name = 'ocean_time' if model == 'WCOFS' else 'time'
    with ThreadPoolExecutor(max_workers=3) as pool:
        dds_future = pool.submit(fetch, base + '.dds')
        das_future = pool.submit(fetch, base + '.das')
        axes_future = pool.submit(query, base, [time_name, 's_rho'])
        dims, das, axes = dimensions(dds_future.result()), das_future.result(), axes_future.result()
    units = attributes(das, time_name)['units']
    match = re.fullmatch(r'(seconds|hours|days) since (.+)', units)
    if not match:
        raise ValueError('Unsupported forecast time units')
    origin = datetime.fromisoformat(match[2].replace(' UTC', '+00:00').replace('Z', '+00:00'))
    origin = origin.replace(tzinfo=timezone.utc) if origin.tzinfo is None else origin
    times = [origin + timedelta(seconds=t * {'seconds': 1, 'hours': 3600, 'days': 86400}[match[1]]) for t in axes[time_name]]
    target = datetime.fromisoformat(requested.replace('Z', '+00:00')) if requested else datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0)
    if target.tzinfo is None:
        raise ValueError('Time must include UTC timezone')
    if model != 'WCOFS' and not min(times) <= target <= max(times):
        raise ValueError('Requested time is outside the forecast dataset')
    ti = min(range(len(times)), key=lambda i: abs(times[i] - target))
    if abs((times[ti] - target).total_seconds()) > (5400 if model == 'WCOFS' else 3600):
        raise ValueError('No forecast within one hour of requested time')
    sigma = axes['s_rho']
    if not sigma or not all(math.isfinite(s) and -1 <= s <= 0 for s in sigma):
        raise ValueError('Unsupported surface coordinate')
    zi = sigma.index(max(sigma))
    a, b = ('u', 'v') if field == 'currents' else ('Uwind', 'Vwind')
    aa, ab = attributes(das, a), attributes(das, b)
    expected = ('grid_eastward_sea_water_velocity', 'grid_northward_sea_water_velocity') if field == 'currents' else ('grid_eastward_wind', 'grid_northward_wind')
    alternate = ('sea_water_x_velocity','sea_water_y_velocity') if field == 'currents' else ('surface_x_wind','surface_y_wind')
    if (aa.get('standard_name'), ab.get('standard_name')) not in (expected,alternate):
        raise ValueError('Unsupported vector reference frame')
    if any(attrs.get('units') not in ('meter second-1', 'm/s', 'm s-1') for attrs in (aa, ab)) or attributes(das, 'angle').get('units') != 'radians':
        raise ValueError('Unsupported vector/angle units')
    if [d for d, _ in dims['lon_rho']] != ['eta_rho', 'xi_rho']:
        raise ValueError('Unsupported grid order')
    nr, nc = [n for _, n in dims['lon_rho']]
    expected_a = [(time_name, len(times))] + ([('s_rho', len(sigma)), ('eta_u', nr), ('xi_u', nc-1)] if field == 'currents' else [('eta_rho', nr), ('xi_rho', nc)])
    expected_b = [(time_name, len(times))] + ([('s_rho', len(sigma)), ('eta_v', nr-1), ('xi_v', nc)] if field == 'currents' else [('eta_rho', nr), ('xi_rho', nc)])
    if dims[a] != expected_a or dims[b] != expected_b:
        raise ValueError('Unsupported vector grid dimensions')
    # Sample interior rho locations; read both actual adjacent faces before averaging.
    step = max(1, math.ceil(max(nr, nc) / 80))
    rows, cols = list(range(1, nr-1, step)), list(range(1, nc-1, step))
    def section(rs=0, cs=0):
        return f'[{rows[0]+rs}:{step}:{rows[-1]+rs}][{cols[0]+cs}:{step}:{cols[-1]+cs}]'
    prefix = f'[{ti}]' + (f'[{zi}]' if field == 'currents' else '')
    expressions = [name + section() for name in ('lon_rho', 'lat_rho', 'angle', 'mask_rho')]
    expressions += [a + prefix + section(), b + prefix + section()]
    if field == 'currents':
        expressions += ['mask_u' + section(), 'mask_v' + section()]
    with ThreadPoolExecutor(max_workers=2) as pool:
        first = pool.submit(query, base, expressions)
        second = pool.submit(query, base, [a + prefix + section(cs=-1), b + prefix + section(rs=-1), 'mask_u' + section(cs=-1), 'mask_v' + section(rs=-1)]) if field == 'currents' else None
        data, adjacent = first.result(), second.result() if second else None
    u, v = clean(data[a], aa), clean(data[b], ab)
    if adjacent:
        left, below = clean(adjacent[a], aa), clean(adjacent[b], ab)
        u = [(x+y)/2 if data['mask_u'][i] == adjacent['mask_u'][i] == 1 else math.nan for i, (x,y) in enumerate(zip(u,left))]
        v = [(x+y)/2 if data['mask_v'][i] == adjacent['mask_v'][i] == 1 else math.nan for i, (x,y) in enumerate(zip(v,below))]
    points = []
    for i, (x, y) in enumerate(zip(u, v)):
        lat, lon, angle = data['lat_rho'][i], data['lon_rho'][i], data['angle'][i]
        if data['mask_rho'][i] != 1 or not all(math.isfinite(n) for n in (x,y,lat,lon,angle)):
            continue
        east, north = rotate(x,y,angle)
        points.append([lat, lon, east, north, math.hypot(east,north)])
    if not points:
        raise ValueError('No valid vectors in sampled model grid')
    return {'model': model, 'field': field, 'time': times[ti].isoformat().replace('+00:00', 'Z'),
            'units': 'm/s', 'surface': sigma[zi] if field == 'currents' else None,
            'stride': step, 'points': points, 'source': base,
            'direction': 'toward', 'maxSpeed': max(p[4] for p in points)}


if __name__ == '__main__':
    import sys
    result = read_vectors(sys.argv[1], sys.argv[2])
    print(json.dumps({**result, 'points': result['points'][:3], 'count': len(result['points'])}, indent=2))
