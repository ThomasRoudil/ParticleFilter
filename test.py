from scipy.stats import norm, gamma, uniform
from pfilter import (
    ParticleFilter,
    gaussian_noise,
    squared_error,
    independent_sample,
)
import numpy as np
import skimage.draw
import cv2

img_size = 48


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



def example_filter(n_particles):
    # create the filter
    pf = ParticleFilter(
        prior_fn=prior_fn,
        observe_fn=blob,
        n_particles=n_particles,
        dynamics_fn=velocity,
        weight_fn=lambda x, y: squared_error(x, y, sigma=2),
        resample_proportion=0.2,
        column_names=columns,
    )
    s = np.random.uniform(2, 8)
    x = img_size // 2
    y = img_size // 2
    scale_factor = 20

    cv2.namedWindow("samples", cv2.WINDOW_NORMAL)

    for i in range(100):
        dx = np.random.uniform(-0.25, 0.25)
        dy = np.random.uniform(-0.25, 0.25)

        low_res_img = blob(np.array([[x, y, s]]))
        pf.update(low_res_img)

        print(np.argmax(pf.weights))

        img = cv2.resize(
            np.squeeze(low_res_img), (0, 0), fx=scale_factor, fy=scale_factor
        )
        color = cv2.cvtColor(img.astype(np.float32), cv2.COLOR_GRAY2RGB)

        x_hat, y_hat, s_hat, dx_hat, dy_hat = pf.mean_state

        for particle in pf.original_particles:
            xa, ya, sa, _, _ = particle
            sa = np.clip(sa, 1, 100)
            cv2.circle(
                color,
                (int(ya * scale_factor), int(xa * scale_factor)),
                max(int(sa * scale_factor), 1),
                (1, 0, 0),
                1,
            )
        cv2.circle(
            color,
            (int(y_hat * scale_factor), int(x_hat * scale_factor)),
            max(int(sa * scale_factor), 1),
            (0, 1, 0),
            1,
            lineType=cv2.LINE_AA,
        )
        cv2.line(
            color,
            (int(y_hat * scale_factor), int(x_hat * scale_factor)),
            (
                int(y_hat * scale_factor + 5 * dy_hat * scale_factor),
                int(x_hat * scale_factor + 5 * dx_hat * scale_factor),
            ),
            (0, 0, 1),
            lineType=cv2.LINE_AA,
        )

        cv2.imshow("samples", color)
        result = cv2.waitKey(20)
        if result == 27:
            cv2.waitKey(0)
        x += dx
        y += dy


if __name__ == "__main__":
    example_filter(300)