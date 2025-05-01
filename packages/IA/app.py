# Flask
from flask import request, Flask, jsonify
from flask_cors import CORS

# Scripts auxiliares
from imports import CornSetter
from imports import SoybeanSetter
from imports import WheatSetter

# PIL
from PIL import Image

# Torch
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import transforms

# Numpy
import numpy as np

# CV2
import cv2


app = Flask(__name__)
CORS(app)

# Importando os modelos
GeneralPATH = './models/General/generalAI_v2_1.pth'
CornPath = './models/Corn/CornAI_v2_1.pth'
SoybeanPath = './models/Soybean/SoybeanAI_v1_0.pth'
WheatPath = './models/Wheat/WheatAI_v1_0.pth'

# Device
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")


## Rede Neural ##
class NeuralNetwork(nn.Module):
    def __init__(self):
        super().__init__()

        # Construção das hidden layers
        self.conv1 = nn.Conv2d(1, 32, kernel_size=3, padding=1)
        self.bn1 = nn.BatchNorm2d(32)
        self.conv2 = nn.Conv2d(32, 64, kernel_size=3, padding=1)
        self.bn2 = nn.BatchNorm2d(64)
        self.conv3 = nn.Conv2d(64, 128, kernel_size=3)
        self.bn3 = nn.BatchNorm2d(128)

        self.pool = nn.MaxPool2d(2, 2)

        # Flatten
        self.fc1 = nn.Linear(128 * 15 * 15, 120)
        self.bn4 = nn.BatchNorm1d(120)
        self.fc2 = nn.Linear(120, 84)
        self.fc3 = nn.Linear(84, 3)

        # Ativação GeLU
        self.gelu = nn.GELU()
    
    def forward(self, x):
        x = self.pool(F.gelu(self.bn1(self.conv1(x))))
        x = self.pool(F.gelu(self.bn2(self.conv2(x))))
        x = self.pool(F.gelu(self.bn3(self.conv3(x))))

        x = torch.flatten(x, 1)

        x = F.gelu(self.bn4(self.fc1(x)))
        x = F.gelu(self.fc2(x))
        x = self.fc3(x)

        return x

Net = NeuralNetwork()
Net.load_state_dict(torch.load(GeneralPATH, map_location=DEVICE))
Net.to(DEVICE)
Net.eval()


## Função lambda que aplica o filtro Sobel ##
sobel_transform = transforms.Lambda(
    lambda img: Image.fromarray(
        cv2.convertScaleAbs(
            np.hypot(
                cv2.Sobel(np.array(img), cv2.CV_64F, 1, 0, ksize=3),
                cv2.Sobel(np.array(img), cv2.CV_64F, 0, 1, ksize=3)
            )
        )
    )
)


## Transform Geral ##
transform = transforms.Compose([
    transforms.Resize((128, 128)),
    transforms.Grayscale(1),
    sobel_transform,
    transforms.ToTensor(),
    transforms.Normalize((0.5), (0.5)), 
])


## Definindo as variáveis do milho ##
CornClass, Corntransform = CornSetter()
CornNet = CornClass()
CornNet.load_state_dict(torch.load(CornPath, map_location=DEVICE))
CornNet.to(DEVICE)
CornNet.eval()


## Definindo as variáveis do soja ##
SoybeanClass, Soybeantransform = SoybeanSetter()
SoybeanNet = SoybeanClass()
SoybeanNet.load_state_dict(torch.load(SoybeanPath, map_location=DEVICE))
SoybeanNet.to(DEVICE)
SoybeanNet.eval()


## Definindo as variáveis do trigo ##
WheatClass, Wheattransform = WheatSetter()
WheatNet = WheatClass()
WheatNet.load_state_dict(torch.load(WheatPath, map_location=DEVICE))
WheatNet.to(DEVICE)
WheatNet.eval()


## Rodando a aplicação ##
@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({"error": "Nenhuma imagem enviada"}), 400

    file = request.files['image']
    test_image = Image.open(file.stream).convert('RGB')

    # Pré-processar a imagem
    test_image = transform(test_image).unsqueeze(0).to(DEVICE)

    # Previsão
    with torch.no_grad():
        output = Net(test_image)
        generalProbabilities = torch.softmax(output, dim=1).cpu().numpy()
        predicted_index = np.argmax(generalProbabilities)        
        generalPrediction = getGeneralProbabilities(predicted_index)

        generalConfidence = float(generalProbabilities[0][predicted_index])

        match(generalPrediction):
            case "Corn":
                test_image = Image.open(file.stream).convert('RGB')
                test_image = Corntransform(test_image).unsqueeze(0).to(DEVICE)

                output = CornNet(test_image)
                probabilities = torch.softmax(output, dim=1).cpu().numpy()
                predicted_index = np.argmax(probabilities)        
                predicted_class = getCornProbabilities(predicted_index)

                sicknessConfidence = float(probabilities[0][predicted_index])
                
            case "Soybean":
                test_image = Image.open(file.stream).convert('RGB')
                test_image = Soybeantransform(test_image).unsqueeze(0).to(DEVICE)

                output = SoybeanNet(test_image)
                probabilities = torch.softmax(output, dim=1).cpu().numpy()
                predicted_index = np.argmax(probabilities)        
                predicted_class = getSoybeanProbabilities(predicted_index)

                sicknessConfidence = float(probabilities[0][predicted_index])

            case "Wheat":
                test_image = Image.open(file.stream).convert('RGB')
                test_image = Wheattransform(test_image).unsqueeze(0).to(DEVICE)

                output = WheatNet(test_image)
                probabilities = torch.softmax(output, dim=1).cpu().numpy()
                predicted_index = np.argmax(probabilities)        
                predicted_class = getWheatProbabilities(predicted_index)

                sicknessConfidence = float(probabilities[0][predicted_index])

            case _:
                predicted_class = "doença não identificada."

    return jsonify({'plant': generalPrediction.lower(), 
                    'plant_confidence': generalConfidence,
                    'prediction': predicted_class.lower(), 
                    'prediction_confidence': sicknessConfidence}), 200


## Não vai precisar existir no futuro! ##

# Classes gerais
def getGeneralProbabilities(predicted_index):
    class_names = ['Corn', 'Soybean', 'Wheat']
    return class_names[predicted_index]

# Classe Milho
def getCornProbabilities(predicted_index):
    class_names = [
        'Ferrugem Comum', 
        'Ferrugem Polissora', 
        'Cercosporiose', 
        'Saudavel'
    ]
    return class_names[predicted_index]

# Classe Soja
def getSoybeanProbabilities(predicted_index):
    class_names = [
        'Cercosporiose',
        'Ferrugem Comum',
        'Lagarta',
        'Larva Alfinete',
        'Mancha Marrom',
        'Morte Subita',
        'Mosaico Amarelo',
        'Patogeno Bacteriano',
        'Saudavel',
        'Septonia'
    ]
    return class_names[predicted_index]

# Classe Trigo
def getWheatProbabilities(predicted_index):
    class_names = [
        'Ferrugem Amarela',
        'Ferrugem Listrada',
        'Ferrugem Marrom',
        'Ferrugem Preta',
        'Queimadura',
        'Saudavel',
        'Septoria'
    ]
    return class_names[predicted_index]

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

