from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Instagram Influencer Investment Analysis API",
    description="API for analyzing Instagram influencers for venture capital investment opportunities",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production to specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to the Instagram Influencer Investment Analysis API"}

# Import and include API routers
from app.api.api_v1.api import api_router
app.include_router(api_router, prefix="/api/v1")