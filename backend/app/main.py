from fastapi import FastAPI
from app.routes import auth
from app.routes import ranking
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.include_router(auth.router)
app.include_router(ranking.router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permitir todas as origens (mude para ["http://localhost:3000"] se necessário)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)