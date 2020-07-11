from flask import Flask
from flask_cors import CORS
import os

from api import errors

app = Flask(__name__)
CORS(app)

config_name = os.getenv('FLASK_UI_CONFIGURATION', 'development')
app.secret_key = app.config['SECRET_KEY']


@app.errorhandler(errors.APIError)
def handle_api_error(error):
    return error.flask_response()


if __name__ == '__main__':
    app.run(debug=True, threaded=True, host='localhost', port=9000)
