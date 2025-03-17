from sqlalchemy.orm import Session, joinedload, aliased
from typing import Optional
from sqlalchemy import or_
from models import Post, Category, TagType, TagOption
from schemas import PostCreate, PostUpdate, CategoryCreate, CategoryUpdate, CategoryResponse, TagCreate, TagUpdate
from typing import List
from fastapi import HTTPException

#! -------------------------- CATEGORIA --------------------------

def get_categories_tree(db: Session):
    root_categories = db.query(Category).filter(Category.parent_id == None).options(joinedload(Category.children)).all()

    def serialize_category(cat: Category) -> CategoryResponse:
        return CategoryResponse(
            id=getattr(cat, "id"),
            name=getattr(cat, "name"),
            parent_id=getattr(cat, "parent_id"),
            image_url=getattr(cat, "image_url"),
            subcategories=[serialize_category(sub) for sub in cat.children]
        )

    return [serialize_category(cat) for cat in root_categories]

def create_category(db: Session, category_data: CategoryCreate, image_url: str):
    category = Category(
        name=category_data.name, 
        parent_id=category_data.parent_id,
        image_url=image_url
        )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def update_category(db: Session, category_id: int, category_data: CategoryUpdate):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        return None

    db.query(Category).filter(Category.id == category_id).update({
        Category.name: category_data.name
    })
    
    db.commit()
    return db.query(Category).filter(Category.id == category_id).first()


def delete_category(db: Session, category_id: int):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        return None
    
    has_posts = db.query(Post).filter(Post.category_id == category_id).first()
    if has_posts:
        return "Categoria possui posts e não pode ser excluída."

    db.delete(category)
    db.commit()
    return category

#! ---------------------------- TAGS ----------------------------
def get_tags(db: Session):
    return db.query(TagType).all()

def create_tag(db: Session, tag_data: TagCreate):
    existing = db.query(TagType).filter(TagType.name == tag_data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Uma tag com esse nome já existe.")
    
    new_tag = TagType(name=tag_data.name, is_mandatory=tag_data.is_mandatory)
    db.add(new_tag)
    db.commit()
    db.refresh(new_tag)

    for option_name in tag_data.options:
        new_option = TagOption(name=option_name, tag_type_id=new_tag.id)
        db.add(new_option)

    db.commit()
    db.refresh(new_tag)
    return new_tag

def update_tag(db: Session, tag_id: int, tag: TagUpdate):
    tag_type = db.query(TagType).filter(TagType.id == tag_id).first()
    if not tag_type:
        raise HTTPException(status_code=404, detail="Tag não encontrada") 

    tag_type.name = str(tag.name)
    tag_type.is_mandatory = bool(tag.is_mandatory)
    db.commit()

    db.query(TagOption).filter(TagOption.tag_type_id == tag_id).delete()
    db.commit()

    for option_name in tag.options:
        new_option = TagOption(name=option_name, tag_type_id=tag_id)
        db.add(new_option)

    db.commit()
    db.refresh(tag_type)
    return tag_type

def delete_tag(db: Session, tag_id: int):
    tag_type = db.query(TagType).filter(TagType.id == tag_id).first()
    if not tag_type:
        raise HTTPException(status_code=404, detail="Tag não encontrada") 
    
    db.query(TagOption).filter(TagOption.tag_type_id == tag_id).delete()
    db.commit()

    db.delete(tag_type)
    db.commit()
    return {"message": "Tag excluída com sucesso"}

#! ---------------------------- POST ----------------------------
def get_posts_by_categories(db: Session, category_ids: List[int]):
    if not category_ids:
        return []

    # Busca os posts associados às categorias
    posts = db.query(Post).filter(Post.category_id.in_(category_ids)).all()
    return posts

def get_posts(db: Session, search: Optional[str] = None):
    # Alias para a categoria
    category_alias = aliased(Category)

    # Join entre post e categoria (alias)
    query = db.query(Post).join(category_alias, Post.category_id == category_alias.id)

    if search:
        query = query.filter(
            or_(
                Post.title.ilike(f"%{search}%"),  # Filtro por título
                Post.content.ilike(f"%{search}%"),  # Filtro por conteúdo
                category_alias.name.ilike(f"%{search}%")  # Filtro por nome da categoria (usando o alias)
            )
        )

    return query.all()

def get_post_by_id(db: Session, post_id: int):
    return db.query(Post)\
             .filter(Post.id == post_id)\
             .options(joinedload(Post.tag_options))\
             .first()

def create_post(db: Session, post_data: PostCreate):
    if post_data.category_id:
        category_exists = db.query(Category).filter(Category.id == post_data.category_id).first()
        if not category_exists:
            return "Categoria não encontrada."
    
    new_post = Post(
        title=post_data.title, 
        content=post_data.content,
        category_id=post_data.category_id
    )

    if post_data.tag_option_ids:
        tag_options = db.query(TagOption).filter(TagOption.id.in_(post_data.tag_option_ids)).all()
        if len(tag_options) != len(post_data.tag_option_ids):
            raise HTTPException(status_code=400, detail="Uma ou mais tags não foram encontradas.")
        new_post.tag_options = tag_options
        
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    return new_post

def update_post(db: Session, post_id: int, post_data: PostUpdate):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        return None

    db.query(Post).filter(Post.id == post_id).update({
        Post.title: post_data.title,
        Post.content: post_data.content,
        Post.category_id: post_data.category_id  
    })

    if post_data.tag_option_ids is not None:
        tag_options = db.query(TagOption).filter(TagOption.id.in_(post_data.tag_option_ids)).all()
        if len(tag_options) != len(post_data.tag_option_ids):
            raise HTTPException(status_code=400, detail="Uma ou mais tags não foram encontradas.")
        post.tag_options = tag_options
    
    db.commit()
    return db.query(Post).filter(Post.id == post_id).first()

def delete_post(db: Session, post_id: int):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        return None
    db.delete(post)
    db.commit()
    return post