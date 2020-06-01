import cv2
import numpy as np
import os
from config import Config


def generate_heightmaps():
    if not os.path.exists(Config.HEIGHTMAPS_PATH):
        os.makedirs(Config.HEIGHTMAPS_PATH)
        for filename in Config.HEIGHTMAPS_FILENAMES:
            if filename.endswith('.asc'):
                dem_path = os.path.join(Config.DB_PATH, filename)
                img = np.loadtxt(dem_path)
                filename = filename.replace('.asc', Config.IMAGE_EXTENSION)
                cv2.imwrite(os.path.join(Config.HEIGHTMAPS_PATH, filename), img)


def generate_trajectory():
    time_steps = 50
    time = np.arange(1, time_steps)
    v0 = 10
    x = np.ones((time_steps, 2), dtype=float)
    x[0, 0] = 10
    x[0, 1] = 500
    for t in time:
        x[t, :] = x[t - 1, :] + [v0, 0]
    return list(x)

