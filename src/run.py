from app import app
from NFP import core

core.generate_heightmaps_from_raw()

app.run(host='127.0.0.1', port=3000, debug=True, threaded=True)
