from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import SessionLocal
from schemas import PostCreate, PostUpdate
import crud

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/posts")
def get_posts(
    search: Optional[str] = Query(None, description="Termo de busca para filtrar posts por título ou conteúdo"),
    categories: Optional[List[int]] = Query(None, description="Lista de IDs de categorias para filtrar posts"),
    db: Session = Depends(get_db)
):
    if categories:
        # Filtra posts por categorias
        posts = crud.get_posts_by_categories(db, categories)
    else:
        # Filtra posts por termo de busca
        posts = crud.get_posts(db, search)
    
    if not posts:
        raise HTTPException(status_code=404, detail="Nenhum post encontrado")
    
    return posts

@router.get("/posts/{post_id}")
def get_post_by_id(post_id: int, db: Session = Depends(get_db)):
    post = crud.get_post_by_id(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post não encontrado")
    return post

@router.get("/posts/by-categories")
def get_posts_by_categories(
    category_ids: List[int] = Query(..., description="Lista de IDs de categorias para buscar os posts"),
    db: Session = Depends(get_db)
):
    print(f"Categorias recebidas: {category_ids}")
    
    # Chama a função que busca os posts das categorias
    posts = crud.get_posts_by_categories(db, category_ids)
    
    if not posts:
        raise HTTPException(status_code=404, detail="Nenhum post encontrado para essas categorias")

    return posts

@router.post("/posts")
def post_create(post_data: PostCreate, db: Session = Depends(get_db)):
    return crud.create_post(db, post_data)

@router.put("/posts/{post_id}")
def update_post(post_id: int, post_data: PostUpdate, db: Session = Depends(get_db)):
    post = crud.update_post(db, post_id, post_data)
    if not post:
        raise HTTPException(status_code=404, detail="Post não encontrado")
    return post

@router.delete("/posts/{post_id}")
def delete_post(post_id: int, db: Session = Depends(get_db)):
    post = crud.delete_post(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post não encontrado")
    return {"message": "Post excluído com sucesso"}