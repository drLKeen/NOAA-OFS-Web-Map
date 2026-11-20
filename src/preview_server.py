"""Serve the NOAA proof of concept: python preview_server.py [--port 8000]."""
import argparse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import re
import json
from vector_data import read_vectors
from ofs_data import MODELS, AGGREGATED, resolve, read_native_vectors, read_mesh
from urllib.error import HTTPError, URLError
from urllib.request import urlopen
from urllib.parse import urlsplit, parse_qs

ROOT = Path(__file__).resolve().parent.parent / 'web'
HOST = 'https://opendap.co-ops.nos.noaa.gov'
ROUTE = re.compile(r'^/thredds/(?:catalog/(?:CBOFS|CIOFS|DBOFS|GOMOFS|TBOFS)/fmrc/catalog\.xml|wms/(?:CBOFS|CIOFS|DBOFS|GOMOFS|TBOFS)/fmrc/[A-Za-z0-9_]+\.ncd)$')


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        path = urlsplit(self.path)
        if path.path in ('/api/vectors','/api/mesh','/api/dataset'):
            try:
                params = parse_qs(path.query)
                model=params.get('model',[''])[0];field=params.get('field',[''])[0];requested=params.get('time',[''])[0]
                if model not in MODELS: raise ValueError('Unknown OFS model')
                if path.path == '/api/dataset': result={'path':resolve(model,requested)}
                elif path.path == '/api/mesh': result=read_mesh(model,field,requested)
                elif model in AGGREGATED or model=='WCOFS': result=read_vectors(model,field,requested)
                else: result=read_native_vectors(model,field,requested)
                data = json.dumps(result, allow_nan=False).encode('utf-8')
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', str(len(data)))
                self.send_header('Cache-Control', 'no-store')
                self.end_headers()
                self.wfile.write(data)
            except ValueError as error:
                data=json.dumps({'error':str(error)}).encode();self.send_response(400);self.send_header('Content-Type','application/json');self.send_header('Content-Length',str(len(data)));self.end_headers();self.wfile.write(data)
            except (HTTPError, URLError, TimeoutError):
                self.send_error(502, 'NOAA vector request failed or timed out')
            except (BrokenPipeError, ConnectionResetError):
                pass
            return
        if path.path.startswith('/thredds/'):
            dated = re.fullmatch(r'/thredds/wms/NOAA/WCOFS/MODELS/\d{4}/\d{2}/\d{2}/wcofs\.t\d{2}z\.\d{8}\.fields\.f\d{3}\.nc',path.path)
            if not ROUTE.fullmatch(path.path) and not dated:
                self.send_error(404, 'Unsupported NOAA resource')
                return
            try:
                with urlopen(HOST + self.path, timeout=40) as response:
                    data = response.read()
                    self.send_response(response.status)
                    self.send_header('Content-Type', response.headers.get('Content-Type', 'application/octet-stream'))
                    self.send_header('Content-Length', str(len(data)))
                    self.send_header('Cache-Control', 'no-store')
                    self.end_headers()
                    self.wfile.write(data)
            except HTTPError as error:
                self.send_error(error.code, 'NOAA returned an HTTP error')
            except (URLError, TimeoutError):
                self.send_error(502, 'NOAA request failed or timed out')
            except (BrokenPipeError, ConnectionResetError):
                pass
            return
        if path.path == '/':
            self.path = '/models-preview.html'
        # Serve only browser assets; source, tests, and references are outside this root.
        if '/' in urlsplit(self.path).path.strip('/') or not (ROOT / urlsplit(self.path).path.lstrip('/')).is_file():
            self.send_error(404)
            return
        super().do_GET()

    def do_HEAD(self):
        self.send_error(405)


def make_server(port=8000):
    return ThreadingHTTPServer(('127.0.0.1', port), Handler)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=8000)
    args = parser.parse_args()
    with make_server(args.port) as server:
        print(f'Preview: http://127.0.0.1:{server.server_port}/models-preview.html', flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass
