from sqlalchemy import Column, Integer, String, JSON, ForeignKey, Boolean, Table
from sqlalchemy.orm import relationship, Mapped, mapped_column
from database import Base


class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False, unique=True)
    parent_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    image_url = Column(String, nullable=True)

    parent = relationship("Category", remote_side=[id], backref="children")
    posts = relationship('Post', back_populates='category')


# Tabela de associação para a relação muitos-para-muitos entre posts e tags
post_tag_options = Table(
    'post_tag_options',
    Base.metadata,
    Column('post_id', Integer, ForeignKey('posts.id'), primary_key=True),
    Column('tag_option_id', Integer, ForeignKey('tag_options.id'), primary_key=True)
)

class Post(Base):
    __tablename__ = "posts"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    content = Column(String, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    
    category = relationship("Category", back_populates="posts")

    # Define o relacionamento com TagOption
    tag_options = relationship("TagOption", secondary=post_tag_options, back_populates="posts")

class TagType(Base):
    __tablename__ = "tag_types"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    is_mandatory: Mapped[bool] = mapped_column(Boolean, default=False)
    options = relationship("TagOption", back_populates="tag_type")

class TagOption(Base):
    __tablename__ = "tag_options"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    tag_type_id: Mapped[int] = mapped_column(Integer, ForeignKey("tag_types.id"), nullable=False)
    
    tag_type = relationship("TagType", back_populates="options")
    posts = relationship("Post", secondary=post_tag_options, back_populates="tag_options")
