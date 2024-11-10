from flask import request, Flask, jsonify
from flask_cors import CORS
from PIL import Image

app = Flask(__name__)
CORS(app)

@app.route('/', methods=['GET'])
def hello():
    return 'Ola', 200

@app.route('/predict', methods=['POST'])
def predict():
    print('Ola')
    file = request.files['image']
    img = Image.open(file.stream)
    img = img.resize((224, 224))
    img.save('image.jpg')
    return jsonify({'message': 'success'})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)