"""
Carrega app.py com modelos falsos, para os testes não dependerem dos pesos
reais (.pth), que não fazem parte do repositório.
"""
import os
import sys
from pathlib import Path
from unittest.mock import patch

import pytest
import torch

IA_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(IA_DIR))

# load_dotenv() localiza o .env inspecionando a pilha de chamadas, o que
# quebra sob o runner do pytest (acaba resolvendo um caminho fora do projeto).
# Os testes já definem todas as envs necessárias diretamente, então desligamos
# esse auto-load via a flag que a própria lib expõe para isso.
os.environ.setdefault("PYTHON_DOTENV_DISABLED", "1")

os.environ.setdefault("TOMATO", "fake_tomato.pth")
os.environ.setdefault("WHEAT", "fake_wheat.pth")
os.environ.setdefault("SOYBEAN", "fake_soybean.pth")
os.environ.setdefault("COFFEE", "fake_coffee.pth")
# Mantém pequeno para os testes de upload não precisarem gerar arquivos grandes.
os.environ.setdefault("MAX_UPLOAD_BYTES", str(64 * 1024))

CLASS_NAMES = ["Healthy", "Diseased"]


class _FakeModel(torch.nn.Module):
    """Substitui o ConvNeXt real: mesma interface, saída determinística."""

    def forward(self, x):
        batch_size = x.shape[0]
        return torch.tensor([[0.1, 0.9]] * batch_size)


def _fake_load_model(model_path: str, device: str = "cpu"):
    checkpoint = {
        "class_names": CLASS_NAMES,
        "num_classes": len(CLASS_NAMES),
        "model_info": "fake-model-for-tests",
    }
    return _FakeModel().eval().to(device), checkpoint


import imports as imports_module  # noqa: E402

with patch("os.path.isfile", return_value=True), patch.object(
    imports_module, "loadModel", _fake_load_model
):
    import app as app_module  # noqa: E402


@pytest.fixture
def client():
    from fastapi.testclient import TestClient

    with TestClient(app_module.APP) as test_client:
        yield test_client


@pytest.fixture
def app():
    return app_module
