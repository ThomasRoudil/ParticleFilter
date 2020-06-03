import cv2
import numpy as np
import os
from config import Config
from scipy.ndimage.interpolation import map_coordinates

TIME_STEPS = 50


def _generate_trajectory(p1, p2):
    speed = (p2[0] - p1[0], p2[1] - p1[1])
    trajectory = [tuple(p1[index] + time * speed[index] / TIME_STEPS for index in range(2)) for time in range(TIME_STEPS + 1)]
    return trajectory


def _get_altitude_from_point(point, heightmap):
    return round(map_coordinates(heightmap, list([element] for element in point), order=3)[0], 2)


def generate_heightmaps():
    if not os.path.exists(Config.HEIGHTMAPS_PATH):
        os.makedirs(Config.HEIGHTMAPS_PATH)
        for filename in os.listdir(Config.DB_PATH):
            if filename.endswith('.asc'):
                dem_path = os.path.join(Config.DB_PATH, filename)
                img = np.loadtxt(dem_path)
                filename = filename.replace('.asc', Config.IMAGE_EXTENSION)
                cv2.imwrite(os.path.join(Config.HEIGHTMAPS_PATH, filename), img)


def generate_altitude_profile(positions, filename):
    p1 = positions[0]
    p2 = positions[1]
    trajectory = _generate_trajectory(p1, p2)

    dem_path = os.path.join(Config.DB_PATH, filename)
    heightmap = np.loadtxt(dem_path)

    altitude_profile = [_get_altitude_from_point(point, heightmap) for point in trajectory]
    return altitude_profile


if __name__ == '__main__':
    positions = [(0, 100), (100, 950)]
    generate_altitude_profile(positions, filename="BDALTIV2_75M_FXX_0375_6225_MNT_LAMB93_IGN69.asc")

