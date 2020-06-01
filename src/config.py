import os


class Config:
    NFP_PATH = os.path.abspath(os.path.join(os.path.dirname(os.path.realpath(__file__)), os.pardir))
    DB_PATH = os.path.join(NFP_PATH, 'db')
    UI_PATH = os.path.join(NFP_PATH, 'ui')

    DEM_FILENAMES = os.listdir(DB_PATH)

    IMAGE_EXTENSION = '.jpg'