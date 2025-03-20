from fastapi import APIRouter
from ..database import get_rankings

router = APIRouter()

@router.get("/ranking")
async def read_rankings():
    """ Rota para obter os rankings """
    return {"rankings": get_rankings()}
