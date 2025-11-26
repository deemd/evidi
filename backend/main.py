"""
Point d'entrée principal pour Vercel.
Ce fichier importe l'app depuis app/main.py et l'expose pour Vercel.
"""
from app.main import app

# Vercel handler
handler = app

# Local development server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=5001, reload=True)
