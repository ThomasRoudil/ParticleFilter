import json
import os
from flask import Flask, send_file
from flask_cors import CORS

from api import errors
from api.config import NPF

app = Flask(__name__)
CORS(app)

config_name = os.getenv('FLASK_UI_CONFIGURATION', 'development')
app.secret_key = app.config['SECRET_KEY']


@app.route('/heightmaps', methods=['GET'])
def get_heightmaps():
    return json.dumps(list(reversed(os.listdir(NPF.HEIGHTMAPS_PATH))))


@app.route('/get-heightmap/<filename>')
def get_dem(filename):
    heightmap_path = os.path.join(NPF.HEIGHTMAPS_PATH, filename)
    return send_file(heightmap_path)


@app.errorhandler(errors.APIError)
def handle_api_error(error):
    return error.flask_response()


if __name__ == '__main__':
    app.run(debug=True, threaded=True, host='localhost', port=9000)
