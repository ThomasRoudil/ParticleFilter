import numpy as np


def generate_trajectory():
    time_steps = 50
    time = np.arange(1, time_steps)
    v0 = 10
    x = np.ones((time_steps, 2), dtype=float)
    x[0, 0] = 10
    x[0, 1] = 500
    for t in time:
        x[t, :] = x[t - 1, :] + [v0, 0]
    return x
