import cv2
import json
import numpy as np
import os

from collections import namedtuple
from flask import Flask, send_file
from flask_cors import CORS
from scipy.ndimage.interpolation import map_coordinates
from scipy.stats import norm, bernoulli
from webargs import fields
from webargs.flaskparser import use_args

from api import errors
from api.config import NPF
from api.core.pfilter import ParticleFilter, independent_sample, cauchy_noise, squared_error

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


@app.route('/particle-filter/numpy', methods=['POST'])
@use_args({
    'altitude_profile': fields.List(fields.Int, required=True)
})
def compute_particle_filter_numpy(args):
    altitude_profile = args['altitude_profile']

    N = 800
    particles = np.random.uniform(0, TIME_STEPS, N)

    tensor_particles = []
    for plane_altitude in altitude_profile:
        measures = np.array(list(map(lambda x: altitude_profile[int(x)], particles)))
        weights = 1 / len(measures) * np.ones(len(measures))
        weights = weights * (
                    (1 / np.sqrt(2 * np.pi)) * np.exp(-((plane_altitude - measures) / max(altitude_profile)) ** 2 / 4))
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
        speed_noise = 0.5 * np.random.uniform(-1, 1, len(particles))
        particles = particles + speed_noise + speed
        particles = np.array([min(particle, 499) for particle in particles])

    return json.dumps(tensor_particles)


@app.route('/particle-filter/pfilter', methods=['POST'])
@use_args({
    'altitude_profile': fields.List(fields.Int, required=True)
})
def compute_particle_filter_pfilter(args):
    def simulate(state, dt):

        turbulence = np.random.normal(0, 750)
        radar_random = np.random.normal(0, state.radar_noise)

        # new flight level
        if np.random.uniform() < 1 - np.exp(-state.flightiness * dt):
            flight_level = np.random.uniform(1000, 30000)
        else:
            flight_level = state.flight_level

        # random radar fluctuations, using a Gilbert markov model (i.e. switching on and off)
        radar_state = state.radar_state
        if state.radar_state == 0:
            if np.random.uniform() < 1 - np.exp(-state.radar_p * dt):
                radar_state = 1

        if state.radar_state == 1:
            if np.random.uniform() < 1 - np.exp(-state.radar_q * dt):
                radar_state = 0

        drag = 0.9
        # integrate and return
        return PlaneState(
            alt=state.alt + state.d_alt * dt,
            d_alt=(state.d_alt + state.dd_alt * dt + turbulence) * drag,
            dd_alt=np.clip(flight_level - state.alt, -max_dd_alt, max_dd_alt),
            radar_observed=(state.alt + radar_random) * radar_state,
            flight_level=flight_level,
            radar_state=radar_state,
            radar_noise=state.radar_noise,
            radar_p=state.radar_p,
            radar_q=state.radar_q,
            flightiness=state.flightiness,
        )

    altitude_profile = args['altitude_profile']
    PlaneState = namedtuple(
        "PlaneState",
        [
            "alt",  # altitude
            "d_alt",  # velocity
            "dd_alt",  # acceleration
            "flight_level",  # current intended flight level
            "radar_state",  # radar contact or not?
            "flightiness",  # how often plane changes flight levels, avg. changes per second
            "radar_noise",  # noise level in measurement
            "radar_p",  # probability of radar making contact, per sectond
            "radar_q",  # probability of radar losing contact, per second
            "radar_observed",  # observation from radar
        ],
    )
    max_dd_alt = 1000.0

    my_plane = PlaneState(
        alt=5000,
        d_alt=0,
        dd_alt=0,
        flight_level=5000,
        radar_state=1,
        radar_p=0.05,
        radar_q=0.1,
        flightiness=0.01,
        radar_noise=1500,
        radar_observed=0,
    )

    np.random.seed(2026)  # reproducible seed!
    track = [my_plane]

    # simulate time to generate observations
    # we will use radar_observed as our observation variable
    for i in range(500):
        my_plane = simulate(my_plane, 1 / 10.0)
        track.append(my_plane)

    ## Very basic prior
    prior_fn = independent_sample(
        [
            norm(loc=0, scale=20000).rvs,  # altitude
            norm(loc=0, scale=50).rvs,  # velocity
            norm(loc=0, scale=3).rvs,  # acceleration
            bernoulli(0.5).rvs,  # radar state
        ]
    )

    dt = 1 / 10.0

    def dynamics(x):
        # super-simple: just integrate (Euler) acceleration and velocity
        x[:, 0] += x[:, 1] * dt
        x[:, 1] += x[:, 2] * dt
        return x

    # we observe the true altitude, unless the radar is off
    # then we observe 0
    def observe(x):
        return np.where(x[:, 3] < 0.5, 0, x[:, 0])

    def noise_fn(x):
        # random diffusion
        x[:, :3] = cauchy_noise(x[:, :3], sigmas=[0.1, 60, 0.1])
        # occasional switches in expected radar state
        x[:, 3] = np.abs(bernoulli(0.05).rvs(x[:, 3].shape) - x[:, 3])
        return x

    # construct filter
    pf = ParticleFilter(
        prior_fn=prior_fn,
        observe_fn=observe,
        n_particles=100,
        dynamics_fn=dynamics,
        noise_fn=noise_fn,
        weight_fn=lambda x, y: squared_error(x, y, sigma=5000),
        resample_proportion=0.002,
    )

    tensor_particles = []
    for plane_state in track:
        pf.update(np.array([[plane_state.radar_observed]]))
        tensor_particles.append(pf.particles)
    return json.dumps([list(particles[:, 0]) for particles in tensor_particles])


@app.errorhandler(errors.APIError)
def handle_api_error(error):
    return error.flask_response()


if __name__ == '__main__':
    app.run(debug=True, threaded=True, host='localhost', port=9000)
