from fastapi import APIRouter, Depends, HTTPException
import requests
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import User

router = APIRouter()

GITHUB_CLIENT_ID = "SEU_CLIENT_ID"
GITHUB_CLIENT_SECRET = "SEU_CLIENT_SECRET"

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/login/github")
def github_login(code: str, db: Session = Depends(get_db)):
    # Trocar código por token de acesso
    token_url = "https://github.com/login/oauth/access_token"
    response = requests.post(token_url, json={
        "client_id": GITHUB_CLIENT_ID,
        "client_secret": GITHUB_CLIENT_SECRET,
        "code": code
    }, headers={"Accept": "application/json"}).json()

    access_token = response.get("access_token")
    if not access_token:
        raise HTTPException(status_code=400, detail="Erro ao autenticar no GitHub")

    # Obter dados do usuário no GitHub
    user_data = requests.get("https://api.github.com/user", headers={
        "Authorization": f"token {access_token}"
    }).json()

    github_id = user_data["id"]
    username = user_data["login"]
    avatar_url = user_data["avatar_url"]

    # Verificar se o usuário já existe
    user = db.query(User).filter(User.github_id == github_id).first()
    if not user:
        user = User(github_id=github_id, username=username, avatar_url=avatar_url)
        db.add(user)
        db.commit()
    
    return {"message": "Login bem-sucedido", "user": {"id": user.id, "username": user.username}}
