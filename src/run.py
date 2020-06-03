from app import app
from NFP import core

core.generate_heightmaps_from_raw()
core.generate_colormap_from_heightmaps()

app.run(host='127.0.0.1', port=3000, debug=True, threaded=True)
