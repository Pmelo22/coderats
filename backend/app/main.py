from fastapi import FastAPI
from app.routes import ranking

app = FastAPI()

app.include_router(ranking.router)
