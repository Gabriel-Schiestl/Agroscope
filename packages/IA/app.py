"""
Para rodar a aplicação, você deve estar dentro da pasta /Project/IA
"""

# FastAPI
from fastapi import FastAPI, Form, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

import uvicorn

# Scripts auxiliares
from imports import loadModel

# System
import os
import io
from PIL import Image

# Torch
import torch
from torchvision import transforms
import torch.nn.functional as F

# Numpy
import numpy as np

from dotenv import load_dotenv


# Loading env
# Não é fatal a ausência de um arquivo .env físico: em deploy via Docker as
# envs vêm direto de `docker run -e`, sem .env nenhum na imagem.
if load_dotenv():
    print(".env loaded successfully.") # Apply logging
else:
    print("No .env file found, relying on environment variables already set.")


# Configuração
# Application
APP = FastAPI()

# Device
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")


# CORS
# Lista padrão cobre só os hosts de dev local. Em produção, defina CORS_ORIGINS
# (mesma variável usada pelo backend Node) com os domínios reais, separados por
# vírgula, em vez de abrir para qualquer origem.
_DEFAULT_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

_cors_origins_env = os.getenv("CORS_ORIGINS")
origins = (
    [origin.strip() for origin in _cors_origins_env.split(",") if origin.strip()]
    if _cors_origins_env
    else _DEFAULT_ORIGINS
)

print(f"Origens: {origins}")

APP.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    # Sem cookies/sessão nessa API (chamada server-to-server pelo backend), não
    # há necessidade de credentials nem de refletir qualquer header enviado.
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

# Tamanho máximo aceito para o corpo da requisição. O parser multipart do
# Starlette não limita o tamanho de um arquivo enviado (só de campos de texto),
# então sem essa checagem um upload arbitrariamente grande seria bufferizado
# por completo antes de qualquer validação da rota.
MAX_UPLOAD_BYTES = int(os.getenv("MAX_UPLOAD_BYTES", str(8 * 1024 * 1024)))


@APP.middleware("http")
async def limit_upload_size(request: Request, call_next):
    content_length = request.headers.get("content-length")
    if content_length is not None:
        try:
            if int(content_length) > MAX_UPLOAD_BYTES:
                return JSONResponse(
                    {"detail": "Request body too large."}, status_code=413
                )
        except ValueError:
            pass

    return await call_next(request)


"""
Por conta de usarmos um modelo pré-treinado, temos que então importa-lo e carregar a arquitetura.
Logo após, necessitamos introduzir os pesos próprios nos nós do modelo carregado e então o modelo estará pronto para uso.
"""
## --- Models Loading --- ##
# CNN
## Generalist (Pode ser usado no futuro)
# if  os.path.isfile(os.getenv("GENERALIST")):
#     GENERALIST, LOADED_GENERALIST = loadModel(os.getenv("GENERALIST"), device=DEVICE)
#     print("GENERALIST Model loaded successfully")

print("Começando a carregar os modelos.")
## Experts
if  os.path.isfile(os.getenv("TOMATO")) and \
    os.path.isfile(os.getenv("WHEAT")) and \
    os.path.isfile(os.getenv("SOYBEAN")) and \
    os.path.isfile(os.getenv("COFFEE")):

    TOMATO, LOADED_TOMATO = loadModel(os.getenv("TOMATO"), device=DEVICE)
    print("TOMATO Model loaded successfully")

    WHEAT, LOADED_WHEAT = loadModel(os.getenv("WHEAT"), device=DEVICE)
    print("WHEAT Model loaded successfully")

    SOYBEAN, LOADED_SOYBEAN = loadModel(os.getenv("SOYBEAN"), device=DEVICE)
    print("SOYBEAN Model loaded successfully")

    COFFEE, LOADED_COFFEE = loadModel(os.getenv("COFFEE"), device=DEVICE)
    print("COFFEE Model loaded successfully")

else:
    raise FileNotFoundError("couldn't identify some of the experts in models archive")


# Transform - Apply models.Get_Transform
transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize([0.485,0.456,0.406], [0.229,0.224,0.225]),
])


# Defs
SUPPORTED_CULTURES = {"Tomato", "Wheat", "Soybean", "Coffee"}


def __preprocess_image(image_file: UploadFile):
    try:
        # Tratamento Imagem
        image_data = image_file.file.read()
        image = Image.open(io.BytesIO(image_data)).convert("RGB")

        image_tensor = transform(image).unsqueeze(0)
        return image_tensor

    except Exception as e:
        print(f"Error trying to manipulate the image: {e}")
        # Antes retornava None silenciosamente, o que derrubava a predição
        # mais adiante com um erro não tratado (500 sem contexto pro cliente).
        raise HTTPException(400, "Invalid image file.")


# Pode ser usado no futuro
# def __generalist_predict(image_tensor):

#     try:
#         with torch.no_grad():

#             outputs = GENERALIST(image_tensor.to(DEVICE))
#             probabilities = F.softmax(outputs, dim=1)
#             predicted_class_idx = torch.argmax(probabilities, dim=1).item()

#             confidence = probabilities[0][predicted_class_idx].item()
        
#         predicted_class = LOADED_GENERALIST["class_names"][predicted_class_idx]

#         all_probabilities = {
#             LOADED_GENERALIST["class_names"][i]: float(probabilities[0][i])
#             for i in range(len(LOADED_GENERALIST["class_names"]))
#         }
        
#         return predicted_class, round(confidence * 100, 2), all_probabilities

#     except Exception as e:
#         print(f"Error trying to predict: {e}")


def __expert_predict(image_tensor, type: str):

    try:
        match(type):
            case "Tomato": 
                with torch.no_grad():

                    outputs = TOMATO(image_tensor.to(DEVICE))
                    probabilities = F.softmax(outputs, dim=1)
                    predicted_class_idx = torch.argmax(probabilities, dim=1).item()

                    confidence = probabilities[0][predicted_class_idx].item()
                
                predicted_class = LOADED_TOMATO["class_names"][predicted_class_idx]

                all_probabilities = {
                    LOADED_TOMATO["class_names"][i]: float(probabilities[0][i])
                    for i in range(len(LOADED_TOMATO["class_names"]))
                }
                
                return predicted_class, round(confidence * 100, 2), all_probabilities
            
            case "Wheat": 
                with torch.no_grad():

                    outputs = WHEAT(image_tensor.to(DEVICE))
                    probabilities = F.softmax(outputs, dim=1)
                    predicted_class_idx = torch.argmax(probabilities, dim=1).item()

                    confidence = probabilities[0][predicted_class_idx].item()
                
                predicted_class = LOADED_WHEAT["class_names"][predicted_class_idx]

                all_probabilities = {
                    LOADED_WHEAT["class_names"][i]: float(probabilities[0][i])
                    for i in range(len(LOADED_WHEAT["class_names"]))
                }
                
                return predicted_class, round(confidence * 100, 2), all_probabilities
            
            case "Soybean":
                with torch.no_grad():

                    outputs = SOYBEAN(image_tensor.to(DEVICE))
                    probabilities = F.softmax(outputs, dim=1)
                    predicted_class_idx = torch.argmax(probabilities, dim=1).item()

                    confidence = probabilities[0][predicted_class_idx].item()

                predicted_class = LOADED_SOYBEAN["class_names"][predicted_class_idx]

                all_probabilities = {
                    LOADED_SOYBEAN["class_names"][i]: float(probabilities[0][i])
                    for i in range(len(LOADED_SOYBEAN["class_names"]))
                }

                return predicted_class, round(confidence * 100, 2), all_probabilities

            case "Coffee":
                with torch.no_grad():

                    outputs = COFFEE(image_tensor.to(DEVICE))
                    probabilities = F.softmax(outputs, dim=1)
                    predicted_class_idx = torch.argmax(probabilities, dim=1).item()

                    confidence = probabilities[0][predicted_class_idx].item()

                predicted_class = LOADED_COFFEE["class_names"][predicted_class_idx]

                all_probabilities = {
                    LOADED_COFFEE["class_names"][i]: float(probabilities[0][i])
                    for i in range(len(LOADED_COFFEE["class_names"]))
                }

                return predicted_class, round(confidence * 100, 2), all_probabilities

    except Exception as e:
        print(f"Error trying to predict: {e}")


# Routes
## Debug
@APP.get("/modelinfo")
def ModelInfo():
    return {
        "models": {
            "tomato": {
                "class_names": LOADED_TOMATO["class_names"],
                "num_classes": LOADED_TOMATO["num_classes"],
                "model_info": LOADED_TOMATO["model_info"],
            },
            "wheat": {
                "class_names": LOADED_WHEAT["class_names"],
                "num_classes": LOADED_WHEAT["num_classes"],
                "model_info": LOADED_WHEAT["model_info"],
            },
            "soybean": {
                "class_names": LOADED_SOYBEAN["class_names"],
                "num_classes": LOADED_SOYBEAN["num_classes"],
                "model_info": LOADED_SOYBEAN["model_info"],
            },
            "coffee": {
                "class_names": LOADED_COFFEE["class_names"],
                "num_classes": LOADED_COFFEE["num_classes"],
                "model_info": LOADED_COFFEE["model_info"],
            }
        },
    }

## Predict
@APP.post("/predict")
async def Predict( culture: str = Form(...), file: UploadFile = File(...) ):

    if culture not in SUPPORTED_CULTURES:
        raise HTTPException(
            400, f"Unsupported culture. Must be one of: {sorted(SUPPORTED_CULTURES)}"
        )

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(400, "Only images are acceptable.")

    contents = await file.read()
    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(400, "File too large.")
    
    await file.seek(0)

    image_tensor = __preprocess_image(image_file=file)

    # Prediction
    expert_prediction = __expert_predict(image_tensor, type=culture)


    return {
        "culture": culture,
        "expert": {
            "predict": expert_prediction[0].upper(), 
            "predict_confidence": expert_prediction[1],
        }
        }


if __name__ == '__main__':
    uvicorn.run(APP, host='0.0.0.0', port=5000)