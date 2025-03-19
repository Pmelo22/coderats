from fastapi import APIRouter, Depends
import requests
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import User, Ranking

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/ranking")
def get_ranking(db: Session = Depends(get_db)):
    rankings = db.query(Ranking).order_by(Ranking.commits.desc()).all()
    return [{"username": r.user.username, "commits": r.commits} for r in rankings]
