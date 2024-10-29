from flask import Flask, request
import os
import json


app = Flask(__name__)

@app.route('/', methods=['POST'])
def predict():
    data = request.get_json()
    return 'Ola'


if __name__ == '__main__':
    app.run(debug=True)