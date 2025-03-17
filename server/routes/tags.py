from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
from schemas import TagCreate, TagUpdate, TagResponse
import crud


router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/tags", response_model=list[TagResponse])
def get_tags(db: Session = Depends(get_db)):
    return crud.get_tags(db)

@router.post("/tags", response_model=TagResponse)
def create_tag(tag: TagCreate, db: Session = Depends(get_db)):
    return crud.create_tag(db, tag)

@router.put("/tags/{tag_id}", response_model=TagResponse)
def update_tag(tag_id: int, tag: TagUpdate, db: Session = Depends(get_db)):
    return crud.update_tag(db, tag_id, tag)


@router.delete("/tags/{tag_id}")
def delete_tag(tag_id: int, db: Session = Depends(get_db)):
    return crud.delete_tag(db, tag_id)
