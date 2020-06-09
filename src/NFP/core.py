import cv2
import heapq
import random
import os
from config import Config
from scipy.ndimage.interpolation import map_coordinates

TIME_STEPS = 50


def _generate_trajectory(p1, p2):
    speed = (p2[0] - p1[0], p2[1] - p1[1])
    trajectory = [tuple(p1[index] + time * speed[index] / TIME_STEPS for index in range(2)) for time in
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
        self['x'] = x or random.randint(1, 1000)
        self['y'] = y or random.randint(1, 1000)

        if filename:
            heightmap = _get_heightmap(filename)
            self['h'] = _get_altitude_from_point(point=(self['x'], self['y']), heightmap=heightmap)

            if isinstance(position, tuple):
                altitude = _get_altitude_from_point(point=position, heightmap=heightmap)
                self['delta_height'] = self.get_delta_height(altitude)

    def get_delta_height(self, altitude):
        return abs(altitude - self['h'])


def generate_altitude_profile(positions, filename):
    p1 = (positions[0]['y'], positions[0]['x'])
    p2 = (positions[1]['y'], positions[1]['x'])
    trajectory = _generate_trajectory(p1, p2)
    heightmap = _get_heightmap(filename)
    altitude_profile = [_get_altitude_from_point(point, heightmap) for point in trajectory]
    return altitude_profile


def get_particles_cloud_move(filename):
    p1 = (1, 2)
    p2 = (488, 950)
    trajectory = _generate_trajectory(p1, p2)

    particles = [Particle(filename=filename, position=p1) for _ in range(50)]  # Initial particles
    for k in range(TIME_STEPS):
        particles = update_particles(particles, filename, position=p1)
    # TODO : finish this function (add move)


def update_particles(particles, filename, position):
    split_ratio = 0.2
    split_index = int(split_ratio * len(particles))

    delta_heights = list(map(lambda x: x['delta_height'], particles))
    smallest_delta_heights = heapq.nsmallest(split_index, delta_heights)
    weighted_particles = [particle for particle in particles
                          if particle['delta_height'] in smallest_delta_heights]
    weighted_particles = weighted_particles[:split_index]
    new_particles = [random.choice(weighted_particles) for _ in particles[split_index:]]
    new_particles = [
        Particle(
            x=particle['x'] + random.randint(-20, 20),
            y=particle['y'] + random.randint(-20, 20),
            filename=filename,
            position=position
        ) for particle in new_particles]
    return weighted_particles + new_particles


if __name__ == '__main__':
    filename = "BDALTIV2_75M_FXX_0675_6750_MNT_LAMB93_IGN69.png"
    get_particles_cloud_move(filename)
