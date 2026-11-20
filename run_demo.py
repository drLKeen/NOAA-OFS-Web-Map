"""Start the local NOAA web map: python run_demo.py [--port 8000]."""
from pathlib import Path
import runpy
import sys

if __name__ == '__main__':
    source = Path(__file__).resolve().parent / 'src'
    sys.path.insert(0, str(source))
    runpy.run_path(str(source / 'preview_server.py'), run_name='__main__')
