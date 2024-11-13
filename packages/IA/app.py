from flask import request, Flask, jsonify
from flask_cors import CORS
from PIL import Image

app = Flask(__name__)
CORS(app)

@app.route('/predict', methods=['POST'])
def predict():
    file = request.files['image']
    if not file:
        return jsonify({'message': 'No file uploaded'}), 400

    img = img.resize((224, 224))
    img.save('image.jpg')

    return jsonify({'message': 'success'}), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)