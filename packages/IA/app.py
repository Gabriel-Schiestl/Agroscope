from flask import request, Flask, jsonify
from flask_cors import CORS
from PIL import Image
from tensorflow.keras.models import load_model
import numpy as np
from tensorflow.keras.preprocessing import image

app = Flask(__name__)
CORS(app)

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({"error": "Nenhuma imagem enviada"}), 400

    file = request.files['image']
    
    test_image = Image.open(file.stream).convert('RGB')

    test_image = test_image.resize((300, 300))

    test_image = image.img_to_array(test_image)

    test_image = np.expand_dims(test_image, axis = 0)

    model = load_model('SicknessMinder_V3_4_1.keras')
    prediction = model.predict(test_image)
    print(prediction)
    prediction_list = prediction.tolist()

    predicted_class = getProbability(prediction)

    return jsonify({'prediction': predicted_class.lower(), 'raw_prediction': prediction_list}), 200

def getProbability(result):
    class_names = ['Cercosporiose', 'Ferrugem', 'Saudavel']

    probabilities = np.exp(result) / np.sum(np.exp(result), axis=1, keepdims=True)    

    predicted_index = np.argmax(probabilities)
    
    predicted_class_name = class_names[predicted_index]

    return predicted_class_name


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)