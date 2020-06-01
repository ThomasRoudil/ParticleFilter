import numpy as np
import os
from config import Config


def generate_trajectory(filename):
    dem = os.path.join(Config.DB_PATH, 'filename')
    z = np.loadtxt(dem)

    I, J = np.shape(Z)  # map dimensions

    X = np.arange(1, 1001)
    Y = np.arange(1, 1001)
    grid_X, grid_Y = np.meshgrid(X, Y)

    # plt.pcolor(X, Y, Z)
    # plt.colorbar()
    # plt.show()

    N = 50  # numbers of time steps
    t = np.arange(1, N)  # time
    v0 = 10  # initial speed along x0
    x = np.ones((N, 2), dtype=float)
    y = np.ones((N, 2), dtype=float)
    x[0, 0] = 10
    x[0, 1] = 500

    Rr = 100  # measurement noise real variance
    R = Rr  # measurement noise variance used for estimation
    Qr = np.array([[10, 0], [0, 10]])  # process noise real variance
    Q = Qr  # process noise variance used for estimation
    initVar = np.array([[0, 0], [0, 0]])  # initial variance of the state
    numSamples = 100  # number of particles per time step

    # generation de la trajectoire
    for t in t:
        x[t, :] = x[t - 1, :] + [v0, 0]  # vitesse reelle = v0 multipliee par l'espacement entre les points du MNT (75m)

    return x
