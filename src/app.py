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


@app.route('/get-heightmap-paths')
def get_dem_paths():
    try:
        paths = [random.choice(os.listdir(Config.HEIGHTMAPS_PATH)) for i in range(10)]
    except IndexError:
        return f"Please provide heightmap models in {Config.HEIGHTMAPS_PATH} folder", 400
    return json.dumps(paths)


@app.route('/get-altitude-profile', methods=['POST'])
def get_altitude_profile():
    payload = request.get_json()
    altitude_profile = core.generate_altitude_profile(payload['filename'],
                                                      payload['positions'])
    return json.dumps(altitude_profile)


@app.route('/get-heightmap/<filename>')
def get_dem(filename):
    heightmap_path = os.path.join(Config.HEIGHTMAPS_PATH, filename)
    return send_file(heightmap_path)


@app.route('/get-colormap/<filename>')
def get_colormap(filename):
    colormap_path = os.path.join(Config.COLORMAPS_PATH, filename)
    return send_file(colormap_path)


@app.route('/get-tensor-particles', methods=['POST'])
def get_tensor_particles():
    payload = request.get_json()
    tensor_particles = core.get_tensor_particles(payload['filename'],
                                                 payload['positions'])
    return json.dumps(tensor_particles)
