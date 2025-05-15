# main.py
from fastapi import FastAPI, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import tensorflow as tf
from PIL import Image
import numpy as np
import base64
from io import BytesIO

model = tf.keras.models.load_model('model/mnist_cnn_model.keras')

app = FastAPI()

# CORS (optional)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve React static files
app.mount("/static", StaticFiles(directory="static/static"), name="static")

@app.get("/")
async def serve_index():
    return FileResponse("static/index.html")

# API to receive doodle image
class ImageData(BaseModel):
    image: str  # Base64 image string

class PredictionResult(BaseModel):
    predicted_number: int
    score: float

@app.post("/api/predict")
async def process_image(data: ImageData):
    try:
        header, encoded = data.image.split(",", 1)
        image_bytes = base64.b64decode(encoded)
        img = Image.open(BytesIO(image_bytes)).convert("L").resize((28, 28))
        ##
        # Convert to NumPy and find bounding box of white-ish content
        np_image = np.array(img)
        coords = np.argwhere(np_image > 10)  # threshold to ignore black background

        if coords.size == 0:
            raise ValueError("blackboard")

        y_min, x_min = coords.min(axis=0)
        y_max, x_max = coords.max(axis=0)

        # Crop and pad
        cropped = img.crop((x_min, y_min, x_max + 1, y_max + 1))

        # Resize to 20x20 (MNIST digits are ~20x20 within 28x28 box)
        digit = cropped.resize((20, 20), Image.Resampling.LANCZOS)

        # Paste into a 28x28 black canvas, centered
        final_image = Image.new("L", (28, 28), 0)
        top_left = ((28 - 20) // 2, (28 - 20) // 2)
        final_image.paste(digit, top_left)
        ##
        img = np.array(final_image) / 255.0  # Normalize
        img = img.reshape(1, 28, 28, 1)  # Add batch dimension
        prediction = model.predict(img, verbose=0)
        predicted_class = np.argmax(prediction, axis=1)[0]
        score = round(float(prediction[0, predicted_class]),2)
        return PredictionResult(predicted_number=predicted_class, score=score)
    except Exception as e:
        return {"error": str(e)}
