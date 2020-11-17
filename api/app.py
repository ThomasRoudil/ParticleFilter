import os

from flask import Flask
from flask_cors import CORS

from api import errors

from api.routes.heightmap import heightmap
from api.routes.particle_filter import particle_filter

app = Flask(__name__)
CORS(app)

config_name = os.getenv('FLASK_UI_CONFIGURATION', 'development')
app.secret_key = app.config['SECRET_KEY']

app.register_blueprint(heightmap, url_prefix='/v1/heightmap/')
app.register_blueprint(particle_filter, url_prefix='/v1/particle-filter/')


@app.errorhandler(errors.APIError)
def handle_api_error(error):
    return error.flask_response()


if __name__ == '__main__':
    app.run(debug=True, threaded=True, host='localhost', port=9000)
