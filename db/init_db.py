import cv2
import functools
import numpy as np
import os
import shutil
from time import time
from src.NFP import utils
from src.config import Config


# Decorators
def timer(func):

    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        time_start = time()
        result = func(*args, **kwargs)
        time_end = time() - time_start
        message = f"{func.__name__} : {time_end:.2f}s"
        print(message)
        return result

    return wrapper


@timer
def generate_heightmaps_from_raw():
    if os.path.exists(Config.HEIGHTMAPS_PATH):
        shutil.rmtree(Config.HEIGHTMAPS_PATH, ignore_errors=True)
    if not os.path.exists(Config.HEIGHTMAPS_PATH):
        os.makedirs(Config.HEIGHTMAPS_PATH)
        for filename in os.listdir(Config.RAW_PATH):
            if filename.endswith('.asc'):
                heightmap_path = os.path.join(Config.RAW_PATH, filename)
                img = np.loadtxt(heightmap_path, skiprows=6)
                img[img < 0] = 0
                filename = filename.replace('.asc', Config.IMAGE_EXTENSION)
                normalized_img = np.zeros(img.shape)
                normalized_img = cv2.normalize(img, normalized_img, 0, 255, cv2.NORM_MINMAX)
                cv2.imwrite(os.path.join(Config.HEIGHTMAPS_PATH, filename), normalized_img)


@timer
def generate_colormap_from_heightmaps():
    if os.path.exists(Config.COLORMAPS_PATH):
        shutil.rmtree(Config.COLORMAPS_PATH, ignore_errors=True)
    if not os.path.exists(Config.COLORMAPS_PATH):
        os.makedirs(Config.COLORMAPS_PATH)
        for filename in os.listdir(Config.HEIGHTMAPS_PATH):
            if filename.endswith(Config.IMAGE_EXTENSION):
                img = cv2.imread(os.path.join(Config.HEIGHTMAPS_PATH, filename))
                gradient = ['#303fd4'] + \
                           utils.linear_gradient('#bda9a3', '#999287', n=10)['hex'] + \
                           utils.linear_gradient('#999287', '#32610d', n=10)['hex'] + \
                           utils.linear_gradient('#32610d', '#71c370', n=150)['hex'] + \
                           utils.linear_gradient('#71c370', '#ecf1ed', 85)['hex']
                for i, color in enumerate(gradient):
                    img[np.where((img == [i, i, i]).all(axis=2))] = utils.hex_to_rgb(color)
                filename = filename.replace('.asc', Config.IMAGE_EXTENSION)
                cv2.imwrite(os.path.join(Config.COLORMAPS_PATH, filename), img)


if __name__ == '__main__':
    generate_heightmaps_from_raw()
    generate_colormap_from_heightmaps()
