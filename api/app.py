from flask import Flask
from pymongo import MongoClient

app = Flask(__name__)

database_name = "ParticleFilter"

with MongoClient(host=["localhost:27017"]) as db_client:
    db = db_client[database_name]


@app.route("/")
def get():
    return "Hello world !"


app.run(debug=True)
