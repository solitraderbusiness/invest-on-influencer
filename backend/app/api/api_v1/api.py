from fastapi import APIRouter

from app.api.api_v1.endpoints import influencers, analytics, scraper

api_router = APIRouter()
api_router.include_router(influencers.router, prefix="/influencers", tags=["influencers"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(scraper.router, prefix="/scraper", tags=["scraper"])