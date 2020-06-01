import os
import json
from NFP import core
from config import Config
from flask import Flask, render_template

app = Flask(__name__, template_folder=os.path.abspath('../ui/templates'))


@app.route('/')
def home():
    return render_template('home.html')


@app.route('/get-dem-paths')
def get_dem_paths():
    return json.dumps(Config.DEM_PATHS)


@app.route('/get-trajectory/<dem_path>')
def get_trajectory(dem_path):
    try:
        trajectory = core.generate_trajectory(dem_path)
    except OSError:
        return f'Path {dem_path} cannot be found'
    return json.dumps(trajectory)


app.run(host='127.0.0.1', port=3000, debug=True)
