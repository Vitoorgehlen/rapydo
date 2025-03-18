from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from database import SessionLocal
from schemas import CategoryCreate, CategoryUpdate, CategoryResponse
import crud
import os

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/categories", response_model=list[CategoryResponse])
def get_categories_tree(db: Session = Depends(get_db)):
    return crud.get_categories_tree(db)

@router.post("/categories", response_model=CategoryResponse)
async def create_category(
    name: str = Form(...),
    parent_id: str = Form(""),
    image: str = Form(...),
    db: Session = Depends(get_db)
):
    parent_id_int = int(parent_id) if parent_id.strip() != "" else None

    image_url = f"/img/{image}"

    category_data = CategoryCreate(name=name, parent_id=parent_id_int, image_url=image_url)
    new_category = crud.create_category(db, category_data, image_url)
    return new_category

@router.put("/categories/{category_id}")
def update_category(category_id: int, category_data: CategoryUpdate, db: Session = Depends(get_db)):
    category = crud.update_category(db, category_id, category_data)
    if not category:
        raise HTTPException(status_code=404, detail="Categoria não encontrado")
    return category

@router.delete("/categories/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db)):
    category = crud.delete_category(db, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")
    return {"message": "Categoria excluída com sucesso"}
