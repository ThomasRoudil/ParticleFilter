import json
import os
import random
from NFP import core
from config import Config
from flask import Flask, render_template, request, send_file

app = Flask(__name__, template_folder=os.path.abspath('../ui/templates'))
app._static_folder = os.path.join(Config.UI_PATH, "static/")


@app.route('/')
def home():
    return render_template('home.html')


@app.route('/get-dem-paths')
def get_dem_paths():
    try:
        paths = [random.choice(os.listdir(Config.HEIGHTMAPS_PATH)) for i in range(10)]
    except IndexError:
        return f"Please provide DEM models in {Config.HEIGHTMAPS_PATH} folder", 400
    return json.dumps(paths)


@app.route('/get-altitude-profile', methods=['POST'])
def get_altitude_profile():
    payload = request.get_json()
    altitude_profile = core.generate_altitude_profile(payload['positions'], payload['filename'])
    return json.dumps(altitude_profile)


@app.route('/get-dem/<filename>')
def get_dem(filename):
    dem_path = os.path.join(Config.HEIGHTMAPS_PATH, filename)
    return send_file(dem_path)
