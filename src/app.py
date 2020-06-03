import json
import os
import random
from NFP import core
from config import Config
from flask import Flask, render_template, send_file

app = Flask(__name__, template_folder=os.path.abspath('../ui/templates'))
app._static_folder = os.path.join(Config.UI_PATH, "static/")


@app.route('/')
def home():
    return render_template('home.html')


@app.route('/get-dem-paths')
def get_dem_paths():
    paths = [random.choice(os.listdir(Config.HEIGHTMAPS_PATH)) for i in range(10)]
    return json.dumps(paths)


@app.route('/get-trajectory')
def get_trajectory():
    trajectory = core.generate_trajectory()
    return json.dumps([(d[0], d[1]) for d in trajectory])


@app.route('/get-altitude-profile')
def get_altitude_profile(positions, filename):
    altitude_profile = core.generate_altitude_profile(positions, filename)
    return json.dumps(altitude_profile)


@app.route('/get-dem/<filename>')
def get_dem(filename):
    dem_path = os.path.join(Config.HEIGHTMAPS_PATH, filename)
    return send_file(dem_path)
