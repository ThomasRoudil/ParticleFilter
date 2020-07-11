import os
from flask import Flask
from pymongo import MongoClient


class Config:
    ROOT_PATH = os.path.abspath(os.path.join(Flask(__name__).root_path, os.pardir))

    UI_URL = 'https://127.0.0.1:3000/'
    API_URI = 'http://127.0.0.1:9000/'

    DB_HOST = 'localhost:27017'
    DB_NAME = 'npf'
    db = MongoClient(host=[DB_HOST])[DB_NAME]

    MONGO_URI = 'mongodb://127.0.0.1:27017/npf'
    MONGO_DBNAME = 'npf'

    SECRET_KEY = 'zeLMdlwUaPOslxUUed!dZd'
