from datetime import datetime
from typing import List

from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text, Float
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Influencer(Base):
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    profile_pic_url = Column(String, nullable=True)
    external_url = Column(String, nullable=True)
    follower_count = Column(Integer, default=0)
    following_count = Column(Integer, default=0)
    post_count = Column(Integer, default=0)
    is_private = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)
    category = Column(String, nullable=True)
    
    # VC-specific metrics
    engagement_rate = Column(Float, default=0.0)
    growth_rate = Column(Float, default=0.0)
    content_quality_score = Column(Float, default=0.0)
    audience_quality_score = Column(Float, default=0.0)
    brand_alignment_score = Column(Float, default=0.0)
    overall_investment_score = Column(Float, default=0.0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_scraped_at = Column(DateTime, nullable=True)
    
    # Relationships
    posts = relationship("Post", back_populates="influencer", cascade="all, delete-orphan")
    metrics = relationship("InfluencerMetric", back_populates="influencer", cascade="all, delete-orphan")
    audience_metrics = relationship("AudienceMetric", back_populates="influencer", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Influencer {self.username}>"