import os


class Config:
    NFP_PATH = os.path.abspath(os.path.join(os.path.dirname(os.path.realpath(__file__)), os.pardir))
    DB_PATH = os.path.join(NFP_PATH, 'db')
    UI_PATH = os.path.join(NFP_PATH, 'ui')
    HEIGHTMAPS_PATH = os.path.join(DB_PATH, 'heightmaps')
    RAW_PATH = os.path.join(DB_PATH, 'raw')
    IMAGE_EXTENSION = '.png'