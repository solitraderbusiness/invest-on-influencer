from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, Float, ForeignKey, String
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class InfluencerMetric(Base):
    id = Column(Integer, primary_key=True, index=True)
    influencer_id = Column(Integer, ForeignKey("influencer.id"), nullable=False)
    
    # Timestamp for this metric snapshot
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Follower metrics
    follower_count = Column(Integer, default=0)
    following_count = Column(Integer, default=0)
    post_count = Column(Integer, default=0)
    
    # Growth metrics (calculated fields)
    follower_growth_count = Column(Integer, default=0)  # Change since last snapshot
    follower_growth_rate = Column(Float, default=0.0)  # Percentage change
    
    # Engagement metrics
    avg_likes_per_post = Column(Float, default=0.0)
    avg_comments_per_post = Column(Float, default=0.0)
    avg_views_per_post = Column(Float, nullable=True)  # For video content
    engagement_rate = Column(Float, default=0.0)  # (likes + comments) / followers
    
    # VC-specific metrics
    content_quality_score = Column(Float, default=0.0)
    audience_quality_score = Column(Float, default=0.0)
    brand_alignment_score = Column(Float, default=0.0)
    overall_investment_score = Column(Float, default=0.0)
    
    # Trend indicators
    trend_direction = Column(String, default="stable")  # growing, declining, stable
    trend_strength = Column(Float, default=0.0)  # 0.0 to 1.0
    
    # Relationships
    influencer = relationship("Influencer", back_populates="metrics")
    
    def __repr__(self):
        return f"<InfluencerMetric {self.influencer_id} at {self.timestamp}>"