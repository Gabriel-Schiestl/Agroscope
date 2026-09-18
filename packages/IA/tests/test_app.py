import io

from PIL import Image


def _make_image_bytes(size=(32, 32), color=(120, 180, 90), fmt="PNG"):
    buffer = io.BytesIO()
    Image.new("RGB", size, color).save(buffer, format=fmt)
    return buffer.getvalue()


# --- CORS ---------------------------------------------------------------

def test_cors_allows_known_dev_origin(client):
    origin = "http://localhost:3000"
    response = client.get("/modelinfo", headers={"Origin": origin})

    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == origin


def test_cors_does_not_reflect_arbitrary_origin(client):
    response = client.get(
        "/modelinfo", headers={"Origin": "https://evil.example.com"}
    )

    # A rota em si não exige CORS (não é um browser fazendo a chamada), mas o
    # header que autorizaria o browser a ler a resposta não deve aparecer.
    assert "access-control-allow-origin" not in response.headers


def test_cors_preflight_rejects_arbitrary_origin(client):
    response = client.options(
        "/predict",
        headers={
            "Origin": "https://evil.example.com",
            "Access-Control-Request-Method": "POST",
        },
    )

    assert response.status_code == 400
    assert "access-control-allow-origin" not in response.headers


def test_cors_preflight_accepts_known_origin(client):
    origin = "http://localhost:5173"
    response = client.options(
        "/predict",
        headers={
            "Origin": origin,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )

    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == origin


def test_cors_does_not_allow_credentials(client):
    origin = "http://localhost:3000"
    response = client.get("/modelinfo", headers={"Origin": origin})

    assert "access-control-allow-credentials" not in response.headers


def test_cors_preflight_rejects_disallowed_header(client):
    response = client.options(
        "/predict",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "x-custom-header",
        },
    )

    # allow_headers agora é uma lista explícita (não mais "*", que refletia
    # qualquer header pedido de volta) — um header fora da lista é recusado.
    assert response.status_code == 400


def test_cors_origins_configurable_via_env(monkeypatch):
    """CORS_ORIGINS deve poder sobrescrever a lista padrão (usado em produção)."""
    import importlib
    from unittest.mock import patch

    import torch

    import app as app_module
    import imports as imports_module

    class _FakeModel(torch.nn.Module):
        def forward(self, x):
            return torch.tensor([[0.1, 0.9]] * x.shape[0])

    def _fake_load_model(model_path, device="cpu"):
        checkpoint = {
            "class_names": ["Healthy", "Diseased"],
            "num_classes": 2,
            "model_info": "fake-model-for-tests",
        }
        return _FakeModel().eval().to(device), checkpoint

    monkeypatch.setenv("CORS_ORIGINS", "https://agroscope-nu.vercel.app, https://api.example.com")

    def _reload():
        with patch("os.path.isfile", return_value=True), patch.object(
            imports_module, "loadModel", _fake_load_model
        ):
            importlib.reload(app_module)

    _reload()
    try:
        assert app_module.origins == [
            "https://agroscope-nu.vercel.app",
            "https://api.example.com",
        ]
    finally:
        monkeypatch.delenv("CORS_ORIGINS", raising=False)
        _reload()


# --- /modelinfo -----------------------------------------------------------

def test_modelinfo_returns_expected_structure(client):
    response = client.get("/modelinfo")

    assert response.status_code == 200
    body = response.json()
    for culture in ("tomato", "wheat", "soybean", "coffee"):
        assert body["models"][culture]["class_names"] == ["Healthy", "Diseased"]
        assert body["models"][culture]["num_classes"] == 2


# --- /predict: validação de entrada ---------------------------------------

def test_predict_accepts_valid_image(client):
    files = {"file": ("leaf.png", _make_image_bytes(), "image/png")}
    response = client.post("/predict", data={"culture": "Tomato"}, files=files)

    assert response.status_code == 200
    body = response.json()
    assert body["culture"] == "Tomato"
    assert body["expert"]["predict"] == "DISEASED"
    assert body["expert"]["predict_confidence"] > 0


def test_predict_rejects_unsupported_culture(client):
    files = {"file": ("leaf.png", _make_image_bytes(), "image/png")}
    response = client.post("/predict", data={"culture": "Corn"}, files=files)

    assert response.status_code == 400


def test_predict_rejects_non_image_content_type(client):
    files = {"file": ("leaf.txt", b"not an image", "text/plain")}
    response = client.post("/predict", data={"culture": "Tomato"}, files=files)

    assert response.status_code == 400


def test_predict_rejects_corrupted_image(client):
    files = {"file": ("leaf.png", b"\x89PNGnot-a-real-png-body", "image/png")}
    response = client.post("/predict", data={"culture": "Tomato"}, files=files)

    assert response.status_code == 400


def test_predict_rejects_oversized_upload(client):
    import app as app_module

    oversized = b"0" * (app_module.MAX_UPLOAD_BYTES + 1)
    files = {"file": ("leaf.png", oversized, "image/png")}
    response = client.post("/predict", data={"culture": "Tomato"}, files=files)

    assert response.status_code == 413


def test_predict_missing_culture_is_rejected(client):
    files = {"file": ("leaf.png", _make_image_bytes(), "image/png")}
    response = client.post("/predict", files=files)

    assert response.status_code == 422
