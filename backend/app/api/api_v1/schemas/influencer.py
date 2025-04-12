from datetime import datetime
from typing import Dict, List, Optional, Union

from pydantic import BaseModel, Field


# Base Influencer Schema
class InfluencerBase(BaseModel):
    username: str
    full_name: Optional[str] = None
    bio: Optional[str] = None
    profile_pic_url: Optional[str] = None
    external_url: Optional[str] = None
    follower_count: Optional[int] = 0
    following_count: Optional[int] = 0
    post_count: Optional[int] = 0
    is_private: Optional[bool] = False
    is_verified: Optional[bool] = False
    category: Optional[str] = None


# Schema for creating a new influencer
class InfluencerCreate(InfluencerBase):
    pass


# Schema for updating an influencer
class InfluencerUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    profile_pic_url: Optional[str] = None
    external_url: Optional[str] = None
    follower_count: Optional[int] = None
    following_count: Optional[int] = None
    post_count: Optional[int] = None
    is_private: Optional[bool] = None
    is_verified: Optional[bool] = None
    category: Optional[str] = None
    engagement_rate: Optional[float] = None
    growth_rate: Optional[float] = None
    content_quality_score: Optional[float] = None
    audience_quality_score: Optional[float] = None
    brand_alignment_score: Optional[float] = None
    overall_investment_score: Optional[float] = None


# Schema for influencer list view (limited fields)
class InfluencerList(BaseModel):
    id: int
    username: str
    full_name: Optional[str] = None
    follower_count: int
    engagement_rate: float
    overall_investment_score: float
    category: Optional[str] = None
    is_verified: bool
    
    class Config:
        orm_mode = True


# Schema for full influencer response
class InfluencerResponse(InfluencerBase):
    id: int
    engagement_rate: float = 0.0
    growth_rate: float = 0.0
    content_quality_score: float = 0.0
    audience_quality_score: float = 0.0
    brand_alignment_score: float = 0.0
    overall_investment_score: float = 0.0
    created_at: datetime
    updated_at: datetime
    last_scraped_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True


# Schema for influencer scores
class InfluencerScores(BaseModel):
    influencer_id: int
    username: str
    overall_investment_score: float
    engagement_rate: float
    growth_rate: float
    content_quality_score: float
    audience_quality_score: float
    brand_alignment_score: float


# Schema for historical metrics
class InfluencerMetricResponse(BaseModel):
    id: int
    influencer_id: int
    timestamp: datetime
    follower_count: int
    following_count: int
    post_count: int
    follower_growth_count: int
    follower_growth_rate: float
    avg_likes_per_post: float
    avg_comments_per_post: float
    engagement_rate: float
    overall_investment_score: float
    trend_direction: str
    trend_strength: float
    
    class Config:
        orm_mode = True


# Schema for audience metrics
class AudienceMetricResponse(BaseModel):
    id: int
    influencer_id: int
    timestamp: datetime
    age_distribution: Optional[Dict[str, float]] = None
    gender_distribution: Optional[Dict[str, float]] = None
    location_distribution: Optional[Dict[str, float]] = None
    authentic_followers_ratio: float
    bot_followers_ratio: float
    inactive_followers_ratio: float
    engagement_rate: float
    loyalty_score: float
    interest_categories: Optional[Dict[str, float]] = None
    purchasing_power_score: float
    brand_affinity_score: float
    influence_multiplier: float
    
    class Config:
        orm_mode = True