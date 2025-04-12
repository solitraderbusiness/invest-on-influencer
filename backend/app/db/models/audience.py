from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class AudienceMetric(Base):
    id = Column(Integer, primary_key=True, index=True)
    influencer_id = Column(Integer, ForeignKey("influencer.id"), nullable=False)
    
    # Timestamp for this metric snapshot
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Demographic data
    age_distribution = Column(JSON, nullable=True)  # e.g., {"18-24": 0.25, "25-34": 0.45, ...}
    gender_distribution = Column(JSON, nullable=True)  # e.g., {"male": 0.4, "female": 0.6}
    location_distribution = Column(JSON, nullable=True)  # e.g., {"Tehran": 0.3, "Isfahan": 0.15, ...}
    
    # Audience quality metrics
    authentic_followers_ratio = Column(Float, default=0.0)  # Estimated real followers (0.0-1.0)
    bot_followers_ratio = Column(Float, default=0.0)  # Estimated bot followers (0.0-1.0)
    inactive_followers_ratio = Column(Float, default=0.0)  # Estimated inactive followers (0.0-1.0)
    
    # Audience engagement metrics
    engagement_rate = Column(Float, default=0.0)  # How engaged the audience is
    loyalty_score = Column(Float, default=0.0)  # Consistency of engagement from same users
    
    # Audience interests
    interest_categories = Column(JSON, nullable=True)  # e.g., {"fashion": 0.4, "technology": 0.2, ...}
    
    # VC-specific audience metrics
    purchasing_power_score = Column(Float, default=0.0)  # Estimated purchasing power (0.0-1.0)
    brand_affinity_score = Column(Float, default=0.0)  # Affinity to brands/products (0.0-1.0)
    influence_multiplier = Column(Float, default=1.0)  # How influential the audience is themselves
    
    # Relationships
    influencer = relationship("Influencer", back_populates="audience_metrics")
    
    def __repr__(self):
        return f"<AudienceMetric {self.influencer_id} at {self.timestamp}>"