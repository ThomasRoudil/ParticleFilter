import cv2
import json
import os
from flask import Flask, send_file
from flask_cors import CORS
from scipy.ndimage.interpolation import map_coordinates
from webargs import fields
from webargs.flaskparser import use_args

from api import errors
from api.config import NPF

app = Flask(__name__)
CORS(app)

config_name = os.getenv('FLASK_UI_CONFIGURATION', 'development')
app.secret_key = app.config['SECRET_KEY']


TIME_STEPS = 500
PARTICLES_COUNT = 40


def _get_heightmap(filename):
    heightmap_path = os.path.join(NPF.HEIGHTMAPS_PATH, filename)
    heightmap = cv2.imread(heightmap_path, -1)
    return heightmap


def _generate_trajectory(p1, p2):
    direction = (p2[0] - p1[0], p2[1] - p1[1])
    trajectory = [tuple(p1[index] + time * direction[index] / TIME_STEPS for index in range(2)) for time in
                  range(TIME_STEPS + 1)]
    return trajectory


def _get_altitude_from_point(point, heightmap):
    return int(map_coordinates(heightmap, list([element] for element in point), order=0)[0])



@app.route('/filenames', methods=['GET'])
def get_heightmap_filenames():
    return json.dumps(list(reversed(os.listdir(NPF.HEIGHTMAPS_PATH))))


@app.route('/get-heightmap/<filename>', methods=['GET'])
def get_heightmap_file(filename):
    heightmap_path = os.path.join(NPF.HEIGHTMAPS_PATH, filename)
    return send_file(heightmap_path)


@app.route('/altitude-profile', methods=['POST'])
@use_args({
    'filename': fields.Str(required=True),
    'positions': fields.List(fields.Dict, required=True)
})
def compute_altitude_profile(args):
    filename = args['filename']
    positions = args['positions']
    p1 = (positions[0]['x'], positions[0]['y'])
    p2 = (positions[1]['x'], positions[1]['y'])
    trajectory = _generate_trajectory(p1, p2)
    heightmap = _get_heightmap(filename)
    altitude_profile = [_get_altitude_from_point(point, heightmap) for point in trajectory]
    return json.dumps(altitude_profile)


@app.errorhandler(errors.APIError)
def handle_api_error(error):
    return error.flask_response()


if __name__ == '__main__':
    app.run(debug=True, threaded=True, host='localhost', port=9000)
