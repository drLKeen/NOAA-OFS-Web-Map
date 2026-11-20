"""Forecast file selection and native FVCOM/POM mesh adapters."""
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone, timedelta
from urllib.error import HTTPError
import math
import re
import xml.etree.ElementTree as ET
from vector_data import HOST, fetch, dimensions, attributes, query, clean

MODELS = ['CBOFS','CIOFS','DBOFS','GOMOFS','LEOFS','LMHOFS','LOOFS','LSOFS',
          'NGOFS2','NYOFS','SFBOFS','SJROFS','SSCOFS','TBOFS','WCOFS']
AGGREGATED = {'CBOFS','CIOFS','DBOFS','GOMOFS','TBOFS'}
FVCOM = {'LEOFS','LMHOFS','LOOFS','LSOFS','NGOFS2','SFBOFS','SSCOFS'}


def target_time(requested=''):
    dt = datetime.fromisoformat(requested.replace('Z','+00:00')) if requested else datetime.now(timezone.utc).replace(minute=0,second=0,microsecond=0)
    if dt.tzinfo is None:
        raise ValueError('Use a time with UTC timezone')
    return dt.astimezone(timezone.utc)


def resolve(model, requested=''):
    if model not in MODELS:
        raise ValueError('Unknown OFS model')
    if model in AGGREGATED:
        doc = ET.fromstring(fetch(f'{HOST}/thredds/catalog/{model}/fmrc/catalog.xml'))
        paths = [d.attrib['urlPath'] for d in doc.iter() if d.attrib.get('urlPath','').endswith('_best.ncd')]
        if len(paths)!=1: raise ValueError('No unique rolling forecast dataset')
        return paths[0]
    target = target_time(requested)
    def list_day(offset):
        date=target-timedelta(days=offset)
        url=f'{HOST}/thredds/catalog/NOAA/{model}/MODELS/{date:%Y/%m/%d}/catalog.xml'
        try:
            doc=ET.fromstring(fetch(url))
        except HTTPError as error:
            if error.code==404: return []
            raise
        return [d.attrib['urlPath'] for d in doc.iter() if 'urlPath' in d.attrib]
    with ThreadPoolExecutor(max_workers=3) as pool:
        paths=sum(pool.map(list_day,range(3)),[])
    candidates=[]
    for path in paths:
        match=re.search(r'/'+model.lower()+r'\.t(\d{2})z\.(\d{8})\.fields\.(f(\d{3})|forecast)\.nc$',path)
        if not match: continue
        cycle=datetime.strptime(match[2]+match[1],'%Y%m%d%H').replace(tzinfo=timezone.utc)
        if cycle>target: continue
        if match[4]:
            valid=cycle+timedelta(hours=int(match[4]))
            distance=abs((valid-target).total_seconds())
            if distance>5400: continue
        else:
            # Multi-time POM forecast: choose the newest cycle preceding target.
            distance=0
        candidates.append((distance,-cycle.timestamp(),path))
    if not candidates: raise ValueError('No forecast file near the requested UTC time in retained catalogs')
    return min(candidates)[2]


def times_from(values, attrs):
    match=re.fullmatch(r'(seconds|hours|days) since (.+)',attrs['units'])
    if not match: raise ValueError('Unknown time units')
    numbers=re.findall(r'\d+',match[2])
    # These OFS products explicitly use UTC, including legacy "00:00" suffix.
    if len(numbers)<3: raise ValueError('Invalid time origin')
    numbers=[int(v) for v in numbers[:6]]
    origin=datetime(*(numbers+[0]*(6-len(numbers))),tzinfo=timezone.utc)
    seconds={'seconds':1,'hours':3600,'days':86400}[match[1]]
    return [origin+timedelta(seconds=v*seconds) for v in values]


def metadata(model, requested=''):
    path=resolve(model,requested);base=HOST+'/thredds/dodsC/'+path
    with ThreadPoolExecutor(max_workers=2) as pool:
        d=pool.submit(fetch,base+'.dds');a=pool.submit(fetch,base+'.das')
        dims,das=dimensions(d.result()),a.result()
    return base,dims,das


def selected_axes(base,dims,das,requested,model):
    vertical='siglay' if model in FVCOM else 'sigma'
    expr=vertical+'[0:1:'+str(dims[vertical][0][1]-1)+'][0]' if model in FVCOM else vertical
    axes=query(base,['time',expr]);times=times_from(axes['time'],attributes(das,'time'))
    target=target_time(requested);ti=min(range(len(times)),key=lambda i:abs(times[i]-target))
    # File products may be spaced every three hours; selected timestamp is shown.
    if abs((times[ti]-target).total_seconds())>5400:raise ValueError('No model time within 90 minutes of requested time')
    levels=axes[vertical]
    if not levels or not all(math.isfinite(v) and -1.001<=v<=1.001 for v in levels):raise ValueError('Unknown sigma coordinate')
    # Both negative up and positive down sigma place the surface closest to zero.
    zi=min(range(len(levels)),key=lambda i:abs(levels[i]))
    return ti,zi,times[ti].isoformat().replace('+00:00','Z'),levels[zi]


def read_native_vectors(model,field,requested=''):
    if field not in ('currents','wind'):raise ValueError('Unsupported vector field')
    base,dims,das=metadata(model,requested)
    ti,zi,time,surface=selected_axes(base,dims,das,requested,model)
    fv=model in FVCOM
    a,b=('u','v') if field=='currents' else (('uwind_speed','vwind_speed') if fv else ('air_u','air_v'))
    attrs=[attributes(das,k) for k in (a,b)]
    expected=('eastward_sea_water_velocity','northward_sea_water_velocity') if field=='currents' else ('eastward_wind','northward_wind')
    if tuple(a.get('standard_name','').lower().replace(' ','_') for a in attrs)!=expected:raise ValueError('Unsupported vector directions')
    if any(a.get('units') not in ('meters s-1','m/s','meter second-1','m s-1') for a in attrs):raise ValueError('Unsupported vector units')
    prefix=f'[{ti}]'+(f'[{zi}]' if field=='currents' else '')
    if fv:
        count=dims['lonc'][0][1];step=max(1,math.ceil(count/6500));section=f'[0:{step}:{count-1}]'
        expr=['lonc'+section,'latc'+section,'wet_cells'+f'[{ti}]'+section,a+prefix+section,b+prefix+section]
        lon,lat,mask='lonc','latc','wet_cells'
    else:
        nr,nc=[n for _,n in dims['lon']];step=max(1,math.ceil(max(nr,nc)/100));section=f'[0:{step}:{nr-1}][0:{step}:{nc-1}]'
        expr=['lon'+section,'lat'+section,'mask'+section,a+prefix+section,b+prefix+section]
        lon,lat,mask='lon','lat','mask'
    data=query(base,expr);u,v=clean(data[a],attrs[0]),clean(data[b],attrs[1])
    points=[]
    for x,y,e,n,wet in zip(data[lon],data[lat],u,v,data[mask]):
        if (wet!=1 if fv else wet<=0) or not all(math.isfinite(z) for z in (x,y,e,n)):continue
        points.append([y,((x+180)%360)-180,e,n,math.hypot(e,n)])
    if not points:raise ValueError('No valid wet vectors')
    return {'model':model,'field':field,'time':time,'surface':surface if field=='currents' else None,
            'source':base,'points':points,'maxSpeed':max(p[4] for p in points),'units':'m/s','stride':step,'direction':'toward'}


def read_mesh(model,field,requested=''):
    if field not in ('salt','temp','zeta'):raise ValueError('Unsupported scalar field')
    base,dims,das=metadata(model,requested)
    variable='salinity' if field=='salt' and model in FVCOM else field
    if variable not in dims:raise ValueError('This model does not provide '+field)
    ti,zi,time,surface=selected_axes(base,dims,das,requested,model)
    prefix=f'[{ti}]'+(f'[{zi}]' if field!='zeta' else '')
    fv=model in FVCOM
    expr=['lon','lat',variable+prefix]
    expr+=['nv','wet_nodes'+f'[{ti}]','wet_cells'+f'[{ti}]'] if fv else ['mask']
    data=query(base,expr);attrs=attributes(das,variable)
    units=attrs.get('units','')
    if field=='zeta' and units not in ('m','meter','meters'):raise ValueError('Unexpected water-level units')
    if field=='temp' and units.lower() not in ('celsius','degrees_c','degrees_celsius','degree_celsius','degc'):raise ValueError('Unexpected temperature units: '+units)
    values=clean(data[variable],attrs);wet=data['wet_nodes' if fv else 'mask']
    good=[(w==1 if fv else w>0) and all(math.isfinite(x) for x in (v,lat,lon)) for v,w,lat,lon in zip(values,wet,data['lat'],data['lon'])]
    nodes=[[(lon+180)%360-180,lat,v if ok else 0] for lon,lat,v,ok in zip(data['lon'],data['lat'],values,good)]
    triangles=[]
    if fv:
        count=dims['nv'][1][1];nv=data['nv']
        for i in range(count):
            tri=[int(nv[i+j*count])-1 for j in range(3)]
            if not all(0<=n<len(nodes) for n in tri):raise ValueError('Invalid mesh connectivity')
            if data['wet_cells'][i]==1 and all(good[n] for n in tri):triangles.extend(tri)
    else:
        nr,nc=[n for _,n in dims['lon']]
        for r in range(nr-1):
            for c in range(nc-1):
                a=r*nc+c;b=a+1;d=a+nc;e=d+1
                for tri in ((a,b,e),(a,e,d)):
                    if all(good[n] for n in tri):triangles.extend(tri)
    if not triangles:raise ValueError('No wet mesh triangles')
    return {'model':model,'field':field,'time':time,'surface':surface if field!='zeta' else None,
            'source':base,'nodes':nodes,'triangles':triangles,'units':units}


if __name__=='__main__':
    import sys,json
    m,f=sys.argv[1:3]
    result=read_native_vectors(m,f) if f in ('wind','currents') else read_mesh(m,f)
    print(json.dumps({k:(len(v) if k in ('nodes','triangles','points') else v) for k,v in result.items()},indent=2))
