import json
import os
import random as rd
import pandas as pd

import cv2
import numpy as np
from flask import Blueprint, jsonify
from numpy.random import random
from webargs import fields
from webargs.flaskparser import use_args

from api.config import NPF

particle_filter = Blueprint('particle_filter', __name__)


def _get_heightmap(filename):
    heightmap_path = os.path.join(NPF.HEIGHTMAPS_PATH, filename)
    heightmap = cv2.imread(heightmap_path, -1)
    return heightmap


@particle_filter.route('/simulation/2D', methods=['POST'])
@use_args({
    'altitude_profile': fields.List(fields.Int, required=True),
    'particles_count': fields.Int(required=True),
    'resampling_method': fields.Str(required=True)
})
def compute_particle_filter_2D(args):
    altitude_profile = args['altitude_profile']

    particles_count = args['particles_count']
    particles = np.random.uniform(0, NPF.TIME_STEPS, particles_count)

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

        if resampling_method == 'none':
            u = np.random.uniform(0, 1, particles_count)
            ind = np.argsort(np.append(u, weights_cumulative))
            indexes = np.array([i for i, x in enumerate(ind) if x < particles_count]) - np.arange(0, particles_count)

        elif resampling_method == 'multinomial':
            indexes = np.searchsorted(weights_cumulative, random(len(weights)))

        elif resampling_method == 'residual':
            particles_count = len(weights)
            indexes = np.zeros(particles_count, 'i')

            # take int(particles_count*w) copies of each weight
            num_copies = (particles_count * np.asarray(weights)).astype(int)
            k = 0
            for i in range(particles_count):
                for _ in range(num_copies[i]):  # make n copies
                    indexes[k] = i
                    k += 1

            # use multinormial resample on the residual to fill up the rest.
            residual = weights - num_copies  # get fractional part
            residual /= sum(residual)  # normalize
            cumulative_sum = np.cumsum(residual)
            cumulative_sum[-1] = 1.  # avoid round-off errors: ensures sum is exactly one
            indexes[k:particles_count] = np.searchsorted(cumulative_sum, random(particles_count - k))

        elif resampling_method == 'stratified':
            particles_count = len(weights)
            # make particles_count subdivisions, and chose a random position within each one
            positions = (random(particles_count) + range(particles_count)) / particles_count

            indexes = np.zeros(particles_count, 'i')
            cumulative_sum = np.cumsum(weights)
            i, j = 0, 0
            while i < particles_count:
                if positions[i] < cumulative_sum[j]:
                    indexes[i] = j
                    i += 1
                else:
                    j += 1

        elif resampling_method == 'systematic':
            particles_count = len(weights)

            # make particles_count subdivisions, choose positions with a consistent random offset
            positions = (np.arange(particles_count) + random()) / particles_count

            indexes = np.zeros(particles_count, 'i')
            cumulative_sum = np.cumsum(weights)
            i, j = 0, 0
            while i < particles_count:
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
        particles = np.array([particle if particle < NPF.TIME_STEPS else np.random.uniform(0, NPF.TIME_STEPS)
                              for particle in particles])

    return json.dumps(tensor_particles)


@particle_filter.route('/simulation/3D', methods=['POST'])
@use_args({
    'filename': fields.Str(required=True),
    'altitude_profile': fields.List(fields.Int, required=True),
    'particles_count': fields.Int(required=True),
})
def compute_particle_filter_3D(args):
    heightmap = _get_heightmap(args['filename'])
    altitude_profile = args['altitude_profile']
    particles_count = args['particles_count']

    particles = np.array([tuple(i) for i in np.random.randint(1081, size=(particles_count, 2))])

    tensor_particles = []
    for plane_altitude in altitude_profile:
        measures = np.array([heightmap[int(x)][int(y)] for x, y in particles])
        weights = 1 / len(measures) * np.ones(len(measures))
        weights = weights * (
                (1 / np.sqrt(2 * np.pi)) * np.exp(-((plane_altitude - measures) / max(altitude_profile)) ** 2 / 4))
        weights = weights / np.sum(weights)

        # Resample (residual)
        weights_cumulative = np.cumsum(weights)
        weights_cumulative[-1] = 1
        particles_count = len(weights)
        indexes = np.zeros(particles_count, 'i')

        num_copies = (particles_count * np.asarray(weights)).astype(int)
        k = 0
        for i in range(particles_count):
            for _ in range(num_copies[i]):
                indexes[k] = i
                k += 1

        residual = weights - num_copies
        residual /= sum(residual)
        cumulative_sum = np.cumsum(residual)
        cumulative_sum[-1] = 1.
        indexes[k:particles_count] = np.searchsorted(cumulative_sum, random(particles_count - k))
        particles = particles[indexes]

        tensor_particles.append(particles)

        # Dynamics
        speed = 1
        speed_noise = 0.5 * np.random.uniform(-1, 1, len(particles))
        particles = particles + np.transpose(np.array([speed_noise, speed_noise])) + speed
        particles = np.array([particle if np.all(particle < 1081)
                              else [int(rd.random() * 1081), int(rd.random() * 1081)]
                              for particle in particles])

    return pd.Series(tensor_particles).to_json(orient='values')

