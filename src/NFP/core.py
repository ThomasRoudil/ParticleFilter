import cv2
import numpy as np
import os
from config import Config
from scipy.ndimage.interpolation import map_coordinates

TIME_STEPS = 100


def _generate_trajectory(p1, p2):
    speed = (p2[0] - p1[0], p2[1] - p1[1])
    trajectory = [tuple(p1[index] + time * speed[index] / TIME_STEPS for index in range(2)) for time in range(TIME_STEPS + 1)]
    return trajectory


def _get_altitude_from_point(point, heightmap):
    return int(round(map_coordinates(heightmap, list([element] for element in point), order=3)[0], 2))


def generate_heightmaps():
    if not os.path.exists(Config.HEIGHTMAPS_PATH):
        os.makedirs(Config.HEIGHTMAPS_PATH)
        for filename in os.listdir(Config.DB_PATH):
            if filename.endswith('.asc'):
                dem_path = os.path.join(Config.DB_PATH, filename)
                img = np.loadtxt(dem_path, skiprows=7)
                filename = filename.replace('.asc', Config.IMAGE_EXTENSION)
                cv2.imwrite(os.path.join(Config.HEIGHTMAPS_PATH, filename), img)
                print(f"Generated heightmap for file {filename}")


def generate_altitude_profile(positions, filename):
    p1 = (positions[0]['y'], positions[0]['x'])
    p2 = (positions[1]['y'], positions[1]['x'])
    trajectory = _generate_trajectory(p1, p2)

    heightmap_path = os.path.join(Config.HEIGHTMAPS_PATH, filename)
    heightmap = cv2.imread(heightmap_path, cv2.IMREAD_GRAYSCALE)

    altitude_profile = [_get_altitude_from_point(point, heightmap) for point in trajectory]
    return altitude_profile


if __name__ == '__main__':
    positions = [(0, 100), (100, 950)]
    generate_altitude_profile(positions, filename="BDALTIV2_75M_FXX_1050_6900_MNT_LAMB93_IGN69.png")

