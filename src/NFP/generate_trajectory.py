import numpy as np
import os
from config import Config
from scipy.ndimage.interpolation import map_coordinates

index = 0
dem_path = os.path.join(Config.DB_PATH, Config.DEM_FILES[index])
Z = np.loadtxt(dem_path)

I, J = np.shape(Z)                      # map dimensions

X = np.arange(1, 1001)
Y = np.arange(1, 1001)
grid_X, grid_Y = np.meshgrid(X, Y)

# plt.pcolor(X, Y, Z)
# plt.colorbar()
# plt.show()

N = 50                                  # numbers of time steps
t = np.arange(1, N)                     # time
v0 = 10                                 # initial speed along x0
x = np.ones((N, 2), dtype=float)
y = np.ones((N, 2), dtype=float)
x[0, 0] = 10
x[0, 1] = 500

Rr = 100                                # measurement noise real variance
R = Rr                                  # measurement noise variance used for estimation
Qr = np.array([[10, 0], [0, 10]])       # process noise real variance
Q = Qr                                  # process noise variance used for estimation
initVar = np.array([[0, 0], [0, 0]])    # initial variance of the state
numSamples = 100                        # number of particles per time step

# generation de la trajectoire
for t in t:
    x[t, :] = x[t-1, :] + [v0, 0]       # vitesse reelle = v0 multipliee par l'espacement entre les points du MNT (75m)
print(x)

# mesures
for k in range(N):
    y[k, 1] = map_coordinates(Z, [[x[k, 1]], [x[k, 0]]], order=3)

print(y)

# particules initiales (prior)
# xu = sqrt(initVar)*random(2, numSamples)
# q = np.ones(numSamples)
# xu[0, :] = xu[0, :] + x[0, 0]
# xu[1, :] = xu[1, :] + x[0, 1]
