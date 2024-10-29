from flask import Flask, request
import os
import json
from PIL import Image


app = Flask(__name__)

@app.route('/', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return 'Nenhuma imagem enviada', 400
    image_file = request.files['image']
    image = Image.open(image_file)
    image = image.resize((224, 224))
    


if __name__ == '__main__':
    app.run(debug=True)