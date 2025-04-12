from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models.influencer import Influencer
from app.scoring.scoring_engine import ScoringEngine
from app.api.api_v1.schemas.influencer import (
    InfluencerCreate, 
    InfluencerUpdate, 
    InfluencerResponse,
    InfluencerScores,
    InfluencerList
)

router = APIRouter()


@router.get("/", response_model=List[InfluencerList])
def get_influencers(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    sort_by: Optional[str] = "overall_investment_score",
    sort_order: Optional[str] = "desc",
    min_score: Optional[float] = None,
    category: Optional[str] = None
) -> Any:
    """Get all influencers with optional filtering and sorting"""
    query = db.query(Influencer)
    
    # Apply filters
    if min_score is not None:
        query = query.filter(Influencer.overall_investment_score >= min_score)
    
    if category:
        query = query.filter(Influencer.category == category)
    
    # Apply sorting
    if sort_order.lower() == "asc":
        query = query.order_by(getattr(Influencer, sort_by))
    else:
        query = query.order_by(getattr(Influencer, sort_by).desc())
    
    # Apply pagination
    influencers = query.offset(skip).limit(limit).all()
    return influencers


@router.post("/", response_model=InfluencerResponse)
def create_influencer(
    *,
    db: Session = Depends(get_db),
    influencer_in: InfluencerCreate
) -> Any:
    """Create new influencer"""
    # Check if influencer already exists
    db_influencer = db.query(Influencer).filter(Influencer.username == influencer_in.username).first()
    if db_influencer:
        raise HTTPException(
            status_code=400,
            detail=f"Influencer with username {influencer_in.username} already exists"
        )
    
    # Create new influencer
    influencer = Influencer(
        username=influencer_in.username,
        full_name=influencer_in.full_name,
        bio=influencer_in.bio,
        profile_pic_url=influencer_in.profile_pic_url,
        external_url=influencer_in.external_url,
        follower_count=influencer_in.follower_count,
        following_count=influencer_in.following_count,
        post_count=influencer_in.post_count,
        is_private=influencer_in.is_private,
        is_verified=influencer_in.is_verified,
        category=influencer_in.category
    )
    
    db.add(influencer)
    db.commit()
    db.refresh(influencer)
    return influencer


@router.get("/{influencer_id}", response_model=InfluencerResponse)
def get_influencer(
    *,
    db: Session = Depends(get_db),
    influencer_id: int
) -> Any:
    """Get influencer by ID"""
    influencer = db.query(Influencer).filter(Influencer.id == influencer_id).first()
    if not influencer:
        raise HTTPException(
            status_code=404,
            detail=f"Influencer with ID {influencer_id} not found"
        )
    return influencer


@router.get("/by-username/{username}", response_model=InfluencerResponse)
def get_influencer_by_username(
    *,
    db: Session = Depends(get_db),
    username: str
) -> Any:
    """Get influencer by username"""
    influencer = db.query(Influencer).filter(Influencer.username == username).first()
    if not influencer:
        raise HTTPException(
            status_code=404,
            detail=f"Influencer with username {username} not found"
        )
    return influencer


@router.put("/{influencer_id}", response_model=InfluencerResponse)
def update_influencer(
    *,
    db: Session = Depends(get_db),
    influencer_id: int,
    influencer_in: InfluencerUpdate
) -> Any:
    """Update influencer"""
    influencer = db.query(Influencer).filter(Influencer.id == influencer_id).first()
    if not influencer:
        raise HTTPException(
            status_code=404,
            detail=f"Influencer with ID {influencer_id} not found"
        )
    
    # Update influencer attributes
    update_data = influencer_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(influencer, field, value)
    
    db.commit()
    db.refresh(influencer)
    return influencer


@router.delete("/{influencer_id}", response_model=InfluencerResponse)
def delete_influencer(
    *,
    db: Session = Depends(get_db),
    influencer_id: int
) -> Any:
    """Delete influencer"""
    influencer = db.query(Influencer).filter(Influencer.id == influencer_id).first()
    if not influencer:
        raise HTTPException(
            status_code=404,
            detail=f"Influencer with ID {influencer_id} not found"
        )
    
    db.delete(influencer)
    db.commit()
    return influencer


@router.get("/{influencer_id}/scores", response_model=InfluencerScores)
def get_influencer_scores(
    *,
    db: Session = Depends(get_db),
    influencer_id: int,
    industry_categories: Optional[List[str]] = Query(None)
) -> Any:
    """Get investment scores for an influencer"""
    influencer = db.query(Influencer).filter(Influencer.id == influencer_id).first()
    if not influencer:
        raise HTTPException(
            status_code=404,
            detail=f"Influencer with ID {influencer_id} not found"
        )
    
    # Calculate scores
    scoring_engine = ScoringEngine(db)
    scores = scoring_engine.calculate_overall_score(influencer_id, industry_categories)
    
    return {
        "influencer_id": influencer_id,
        "username": influencer.username,
        **scores
    }


@router.post("/{influencer_id}/update-scores", response_model=InfluencerScores)
def update_influencer_scores(
    *,
    db: Session = Depends(get_db),
    influencer_id: int,
    industry_categories: Optional[List[str]] = Query(None)
) -> Any:
    """Calculate and update investment scores for an influencer"""
    influencer = db.query(Influencer).filter(Influencer.id == influencer_id).first()
    if not influencer:
        raise HTTPException(
            status_code=404,
            detail=f"Influencer with ID {influencer_id} not found"
        )
    
    # Calculate and update scores
    scoring_engine = ScoringEngine(db)
    scores = scoring_engine.update_influencer_scores(influencer_id, industry_categories)
    
    return {
        "influencer_id": influencer_id,
        "username": influencer.username,
        **scores
    }