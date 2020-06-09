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


def get_heightmap_path(filename):
    heightmap_path = os.path.join(Config.HEIGHTMAPS_PATH, filename)
    heightmap = cv2.imread(heightmap_path, cv2.IMREAD_GRAYSCALE)
    return heightmap


def generate_altitude_profile(positions, filename):
    p1 = (positions[0]['y'], positions[0]['x'])
    p2 = (positions[1]['y'], positions[1]['x'])
    trajectory = _generate_trajectory(p1, p2)
    heightmap = get_heightmap_path(filename)
    altitude_profile = [_get_altitude_from_point(point, heightmap) for point in trajectory]
    return altitude_profile


def get_initial_particles(filename):
    nb_particle = 50
    particles = [
        {
            'x': random.randint(1, 1000),
            'y': random.randint(1, 1000)
        } for _ in range(nb_particle)
    ]
    return particles


def get_particles_cloud_move(filename):
    heightmap = get_heightmap_path(filename)
    trajectory = _generate_trajectory(p1=(1, 2), p2=(488, 950))

    particles = get_initial_particles(filename)
    for k in range(TIME_STEPS):
        particles = compute_plausibility_for_particles(particles, heightmap, trajectory)
        particles = update_particles(particles, heightmap, trajectory)
    # TODO : finish this function


def compute_plausibility_for_particles(particles, heightmap, trajectory):
    for particle in particles:
        particle['h'] = _get_altitude_from_point(point=(particle['x'], particle['y']), heightmap=heightmap)
        trajectory_altitude_point = _get_altitude_from_point((trajectory[0][0], trajectory[0][1]), heightmap)
        particle['delta_height'] = abs(trajectory_altitude_point - particle['h'])
    return particles


def update_particles(particles, heightmap, trajectory):
    split_ratio = 0.2
    split_index = int(split_ratio * len(particles))

    delta_heights = list(map(lambda x: x['delta_height'], particles))
    smallest_delta_heights = heapq.nsmallest(split_index, delta_heights)
    weighted_particles = [particle for particle in particles
                          if particle['delta_height'] in smallest_delta_heights]
    weighted_particles = weighted_particles[:split_index]
    new_particles = [random.choice(weighted_particles) for _ in particles[split_index:]]
    new_particles = [{
        'x': particle['x'] + random.randint(-20, 20),
        'y': particle['y'] + random.randint(-20, 20)
    } for particle in new_particles]
    new_particles = compute_plausibility_for_particles(new_particles, heightmap, trajectory)
    return weighted_particles + new_particles


if __name__ == '__main__':
    filename = "BDALTIV2_75M_FXX_0375_6825_MNT_LAMB93_IGN69.png"
    get_initial_particles(filename)
    get_particles_cloud_move(filename)
