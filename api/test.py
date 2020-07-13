import cv2
import numpy as np
import skimage.draw
from api.pfilter import (
    ParticleFilter,
    cauchy_noise,
    squared_error,
    independent_sample,
)
from scipy.stats import norm, gamma

img_size = 64


def blob(x):
    """Given an Nx3 matrix of blob positions and size,
    create N img_size x img_size images, each with a blob drawn on
    them given by the value in each row of x

    One row of x = [x,y,radius]."""
    y = np.zeros((x.shape[0], img_size, img_size))
    for i, particle in enumerate(x):
        rr, cc = skimage.draw.circle(
            particle[0], particle[1], max(particle[2], 1), shape=(img_size, img_size)
        )
        y[i, rr, cc] = 1
    return y


# %%

# names (this is just for reference for the moment!)
columns = ["x", "y", "radius", "dx", "dy"]

# prior sampling function for each variable
# (assumes x and y are coordinates in the range 0-img_size)
prior_fn = independent_sample(
    [
        norm(loc=img_size / 2, scale=img_size / 2).rvs,
        norm(loc=img_size / 2, scale=img_size / 2).rvs,
        gamma(a=1, loc=0, scale=10).rvs,
        norm(loc=0, scale=0.5).rvs,
        norm(loc=0, scale=0.5).rvs,
    ]
)


# very simple linear dynamics: x += dx
def velocity(x):
    dt = 1.0
    xp = (
            x
            @ np.array(
        [
            [1, 0, 0, dt, 0],
            [0, 1, 0, 0, dt],
            [0, 0, 1, 0, 0],
            [0, 0, 0, 1, 0],
            [0, 0, 0, 0, 1],
        ]
    ).T
)

    return xp


def example_filter():
    # create the filter
    pf = ParticleFilter(
        prior_fn=prior_fn,
        observe_fn=blob,
        n_particles=100,
        dynamics_fn=velocity,
        noise_fn=lambda x: cauchy_noise(x, sigmas=[0.05, 0.05, 0.01, 0.005, 0.005]),
        weight_fn=lambda x, y: squared_error(x, y, sigma=2),
        resample_proportion=0.15,
        column_names=columns,
    )

    # start in centre, random radius
    s = np.random.uniform(2, 8)

    # random movement direction
    dx = np.random.uniform(-0.25, 0.25)
    dy = np.random.uniform(-0.25, 0.25)

    # appear at centre
    x = img_size // 2
    y = img_size // 2
    scale_factor = 20

    # create window
    cv2.namedWindow("samples", cv2.WINDOW_NORMAL)
    cv2.resizeWindow("samples", scale_factor * img_size, scale_factor * img_size)

    for i in range(100):
        low_res_img = blob(np.array([[x, y, s]]))
        pf.update(low_res_img)
        print(pf.particles)
        x += dx
        y += dy


if __name__ == "__main__":
    example_filter()
