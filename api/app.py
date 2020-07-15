import cv2
import json
import numpy as np
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
    return int(map_coordinates(heightmap, list(reversed(list([element] for element in point))), order=0)[0])


@app.route('/filenames', methods=['GET'])
def get_heightmap_filenames():
    return json.dumps(os.listdir(NPF.HEIGHTMAPS_PATH))


@app.route('/get-heightmap/<filename>', methods=['GET'])
def get_heightmap_file(filename):
    heightmap_path = os.path.join(NPF.HEIGHTMAPS_PATH, filename)
    return send_file(heightmap_path)


@app.route('/get-colormap/<filename>', methods=['GET'])
def get_colormap_file(filename):
    colormap_path = os.path.join(NPF.COLORMAPS_PATH, filename)
    return send_file(colormap_path)


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


@app.route('/particle-filter', methods=['POST'])
@use_args({
    'altitude_profile': fields.List(fields.Int, required=True)
})
def compute_particle_filter(args):
    altitude_profile = args['altitude_profile']

    N = 200
    particles = np.random.uniform(0, TIME_STEPS, N)

    tensor_particles = []
    for plane_altitude in altitude_profile:
        measures = np.array(list(map(lambda x: altitude_profile[int(x)], particles)))
        weights = 1 / len(measures) * np.ones(len(measures))
        weights = weights * ((1 / np.sqrt(2 * np.pi)) * np.exp(-((plane_altitude - measures) / max(altitude_profile)) ** 2 / 4))
        weights = weights / np.sum(weights)

        # Resample
        weights_cumulative = np.cumsum(weights)
        u = np.random.uniform(0, 1, N)
        ind1 = np.argsort(np.append(u, weights_cumulative))
        ind = np.array([i for i, x in enumerate(ind1) if x < N]) - np.arange(0, N)
        particles = particles[ind]

        # Save particles in tensor
        tensor_particles.append([int(particle) for particle in particles])

        # Dynamics
        speed = 1
        speed_noise = 1 * np.random.uniform(-1, 1, len(particles))
        particles = particles + speed_noise + speed
        particles = np.array([min(particle, 499) for particle in particles])

    return json.dumps(tensor_particles)


@app.errorhandler(errors.APIError)
def handle_api_error(error):
    return error.flask_response()


if __name__ == '__main__':
    app.run(debug=True, threaded=True, host='localhost', port=9000)
