import json
import os

import cv2
import numpy as np
from flask import Flask, send_file
from flask_cors import CORS
from numpy.random import random
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
    'altitude_profile': fields.List(fields.Int, required=True),
    'particles_count': fields.Int(required=True),
    'resampling_method': fields.Str(required=True)
})
def compute_particle_filter(args):
    altitude_profile = args['altitude_profile']

    N = args['particles_count']
    particles = np.random.uniform(0, TIME_STEPS, N)

    resampling_method = args['resampling_method']

    tensor_particles = []
    for plane_altitude in altitude_profile:
        measures = np.array(list(map(lambda x: altitude_profile[int(x)], particles)))
        weights = 1 / len(measures) * np.ones(len(measures))
        weights = weights * (
                (1 / np.sqrt(2 * np.pi)) * np.exp(-((plane_altitude - measures) / max(altitude_profile)) ** 2 / 4))
        weights = weights / np.sum(weights)

        # Resample
        weights_cumulative = np.cumsum(weights)
        weights_cumulative[-1] = 1

        if resampling_method == 'normal':
            u = np.random.uniform(0, 1, N)
            ind = np.argsort(np.append(u, weights_cumulative))
            indexes = np.array([i for i, x in enumerate(ind) if x < N]) - np.arange(0, N)

        elif resampling_method == 'multinomial':
            indexes = np.searchsorted(weights_cumulative, random(len(weights)))

        elif resampling_method == 'residual':
            N = len(weights)
            indexes = np.zeros(N, 'i')

            # take int(N*w) copies of each weight
            num_copies = (N * np.asarray(weights)).astype(int)
            k = 0
            for i in range(N):
                for _ in range(num_copies[i]):  # make n copies
                    indexes[k] = i
                    k += 1

            # use multinormial resample on the residual to fill up the rest.
            residual = weights - num_copies  # get fractional part
            residual /= sum(residual)  # normalize
            cumulative_sum = np.cumsum(residual)
            cumulative_sum[-1] = 1.  # avoid round-off errors: ensures sum is exactly one
            indexes[k:N] = np.searchsorted(cumulative_sum, random(N - k))

        elif resampling_method == 'stratified':
            N = len(weights)
            # make N subdivisions, and chose a random position within each one
            positions = (random(N) + range(N)) / N

            indexes = np.zeros(N, 'i')
            cumulative_sum = np.cumsum(weights)
            i, j = 0, 0
            while i < N:
                if positions[i] < cumulative_sum[j]:
                    indexes[i] = j
                    i += 1
                else:
                    j += 1

        elif resampling_method == 'systematic':
            N = len(weights)

            # make N subdivisions, choose positions with a consistent random offset
            positions = (np.arange(N) + random()) / N

            indexes = np.zeros(N, 'i')
            cumulative_sum = np.cumsum(weights)
            i, j = 0, 0
            while i < N:
                if positions[i] < cumulative_sum[j]:
                    indexes[i] = j
                    i += 1
                else:
                    j += 1

        particles = particles[indexes]

        # Save particles in tensor
        tensor_particles.append([int(particle) for particle in particles])

        # Dynamics
        speed = 1
        speed_noise = 0.5 * np.random.uniform(-1, 1, len(particles))
        particles = particles + speed_noise + speed
        particles = np.array([particle if particle < TIME_STEPS else np.random.uniform(0, TIME_STEPS)
                              for particle in particles])

    return json.dumps(tensor_particles)


@app.errorhandler(errors.APIError)
def handle_api_error(error):
    return error.flask_response()


if __name__ == '__main__':
    app.run(debug=True, threaded=True, host='localhost', port=9000)
