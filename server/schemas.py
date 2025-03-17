from pydantic import BaseModel
from typing import List, Optional
import json

# Models para Category
class CategoryBase(BaseModel):
    name: str
    parent_id: Optional[int] = None
    image_url: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int
    subcategories: List["CategoryResponse"] = []

    class Config:
        from_attributes = True


# Models para Tag
class TagBase(BaseModel):
    name: str
    is_mandatory: bool

class TagOptionResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

class TagResponse(TagBase):
    id: int
    options: List[TagOptionResponse] = []

    class Config:
        from_attributes = True

class TagCreate(TagBase):
    options: List[str] = []

class TagUpdate(TagBase):
    options: List[str] = []

# Models para Post
class PostBase(BaseModel):
    title: str
    category_id: Optional[int] = None


class PostCreate(PostBase):
    content: str
    tag_option_ids: List[int] = []



class PostUpdate(PostBase):
    content: str
    tag_option_ids: List[int] = []


class PostResponse(PostBase):
    id: int
    content: str

    @property
    def content_dict(self) -> dict:
        if isinstance(self.content, str):
            try:
                return json.loads(self.content)
            except json.JSONDecodeError:
                raise ValueError("Invalid JSON content")
        return self.content

    class Config:
        from_attributes = True