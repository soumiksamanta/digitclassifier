FROM node:20-alpine AS frontend-builder
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend .
RUN npm run build

FROM python:3.12-slim-bookworm AS backend

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && rm -rf /root/.cache /tmp/*

COPY main.py .
COPY model/mnist_cnn_model.keras model/mnist_cnn_model.keras

COPY --from=frontend-builder /frontend/build ./static
ENV TF_CPP_MIN_LOG_LEVEL="2"
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--log-level", "warning"]