from fastapi import FastAPI, Request, HTTPException, status
from database import engine, Base
from routes import posts, categories, tags
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()


app = FastAPI()

@app.middleware("http")
async def token_middleware(request: Request, call_next):
    # Verifica se o método da requisição é POST, PUT ou DELETE
    if request.method in ("POST", "PUT", "DELETE"):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token não fornecido")
        
        # Extrai o token; espera-se o formato "Bearer <token>"
        if "Bearer " in auth_header:
            token = auth_header.split("Bearer ")[1]
        else:
            token = auth_header

        expected_token = os.getenv("AUTH_TOKEN")
        if token != expected_token:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Token inválido")
    
    response = await call_next(request)
    return response

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