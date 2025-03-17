from fastapi import FastAPI
from database import engine, Base
from routes import posts, categories, tags
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Backend está rodando"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(posts.router)
app.include_router(categories.router)
app.include_router(tags.router)