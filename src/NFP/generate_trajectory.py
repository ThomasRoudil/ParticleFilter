import numpy as np
import os
from config import Config
from scipy.ndimage.interpolation import map_coordinates

index = 0
dem_path = os.path.join(Config.DB_PATH, Config.HEIGHTMAPS_FILENAMES[index])


# mesures
for k in range(N):
    y[k, 1] = map_coordinates(Z, [[x[k, 1]], [x[k, 0]]], order=3)

print(y)

# particules initiales (prior)
# xu = sqrt(initVar)*random(2, numSamples)
# q = np.ones(numSamples)
# xu[0, :] = xu[0, :] + x[0, 0]
# xu[1, :] = xu[1, :] + x[0, 1]
