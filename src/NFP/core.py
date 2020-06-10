import cv2
import heapq
import random
import os
from config import Config
from scipy.ndimage.interpolation import map_coordinates

TIME_STEPS = 15
PARTICLES_COUNT = 40


def _generate_trajectory(p1, p2):
    direction = (p2[0] - p1[0], p2[1] - p1[1])
    trajectory = [tuple(p1[index] + time * direction[index] / TIME_STEPS for index in range(2)) for time in
                  range(TIME_STEPS + 1)]
    return trajectory


def _get_altitude_from_point(point, heightmap):
    return int(map_coordinates(heightmap, list([element] for element in point), order=0)[0])


def _get_heightmap(filename):
    heightmap_path = os.path.join(Config.HEIGHTMAPS_PATH, filename)
    heightmap = cv2.imread(heightmap_path, cv2.IMREAD_GRAYSCALE)
    return heightmap


class Particle(dict):
    def __init__(self, x=None, y=None, filename=None, position=None):
        super().__init__()
        self['x'] = round(x, 2) if x else position[0] + random.randint(0, 50)
        self['y'] = round(y, 2) if y else position[1] + random.randint(0, 50)
        # Constraints between 0, 1000
        self['x'] = min(max(self['x'], 0), 1000)
        self['y'] = min(max(self['y'], 0), 1000)

        if filename:
            heightmap = _get_heightmap(filename)
            self['h'] = _get_altitude_from_point(point=(self['x'], self['y']), heightmap=heightmap)

            if isinstance(position, tuple):
                altitude = _get_altitude_from_point(point=position, heightmap=heightmap)
                self['delta_height'] = self.get_delta_height(altitude)

    def get_delta_height(self, altitude):
        return round(abs(altitude - self['h']), 2)


def generate_altitude_profile(filename, positions):
    p1 = (positions[0]['x'], positions[0]['y'])
    p2 = (positions[1]['x'], positions[1]['y'])
    trajectory = _generate_trajectory(p1, p2)
    heightmap = _get_heightmap(filename)
    altitude_profile = [_get_altitude_from_point(point, heightmap) for point in trajectory]
    return altitude_profile


def get_tensor_particles(filename, positions):
    p1 = (positions[0]['x'], positions[0]['y'])
    p2 = (positions[1]['x'], positions[1]['y'])
    direction = (p2[0] - p1[0], p2[1] - p1[1])
    trajectory = _generate_trajectory(p1, p2)

    # Initial particles
    particles = [Particle(filename=filename, position=p1) for _ in range(PARTICLES_COUNT)]
    tensor_particles = [particles]

    # Update particles and store each step in tensor
    for position in trajectory:
        particles = update_particles(particles, filename, position=position, direction=direction)
        tensor_particles.append(particles)

    return tensor_particles


def update_particles(particles, filename, position, direction):
    def move_particles(particles, direction):
        for particle in particles:
            particle['x'] = round(particle['x'] + direction[0] / TIME_STEPS, 2)
            particle['y'] = round(particle['y'] + direction[1] / TIME_STEPS, 2)

    split_ratio = 0.4
    split_index = int(split_ratio * len(particles))

    delta_heights = list(map(lambda x: x['delta_height'], particles))
    smallest_delta_heights = heapq.nsmallest(split_index, delta_heights)
    weighted_particles = [particle for particle in particles
                          if particle['delta_height'] in smallest_delta_heights]
    weighted_particles = weighted_particles[:split_index]
    new_particles = [random.choice(weighted_particles) for _ in particles[split_index:]]
    new_particles = [
        Particle(
            x=particle['x'] + random.randint(-15, 15),
            y=particle['y'] + random.randint(-15, 15),
            filename=filename,
            position=position
        ) for particle in new_particles]
    particles = weighted_particles + new_particles
    move_particles(particles, direction)
    return particles
