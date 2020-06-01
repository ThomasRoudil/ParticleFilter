import os
from config import Config
from flask import Flask, render_template

app = Flask(__name__, template_folder=os.path.abspath('../ui/templates'))


@app.route('/')
def home():
    return render_template('home.html')


app.run(host='127.0.0.1', port=3000, debug=True)
