import os
import json
from NFP import core
from config import Config
from flask import Flask, render_template, send_file

app = Flask(__name__, template_folder=os.path.abspath('../ui/templates'))


@app.route('/')
def home():
    return render_template('home.html')


@app.route('/get-dem-paths')
def get_dem_paths():
    return json.dumps(Config.DEM_PATHS)


@app.route('/get-trajectory')
def get_trajectory():
    trajectory = core.generate_trajectory()
    return json.dumps([(d[0], d[1]) for d in trajectory])


@app.route('/get-dem/<filename>')
def get_dem(filename):
    dem_path = os.path.join(Config.DB_PATH, filename)
    return send_file(dem_path)


app.run(host='127.0.0.1', port=3000, debug=True)
