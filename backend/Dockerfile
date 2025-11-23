# backend/Dockerfile
FROM python:3.11-slim

# Répertoire de travail
WORKDIR /app

# Copier requirements si tu en as
COPY requirements.txt .

# Installer les dépendances
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code source
COPY . .

# Exposer le port FastAPI
EXPOSE 8000

# Lancer FastAPI
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
