from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String, Text, Float, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Post(Base):
    id = Column(Integer, primary_key=True, index=True)
    instagram_id = Column(String, unique=True, index=True, nullable=False)
    influencer_id = Column(Integer, ForeignKey("influencer.id"), nullable=False)
    
    # Post content
    caption = Column(Text, nullable=True)
    media_type = Column(String, nullable=False)  # IMAGE, VIDEO, CAROUSEL_ALBUM
    media_urls = Column(JSON, nullable=True)  # List of media URLs for carousel posts
    permalink = Column(String, nullable=True)
    
    # Engagement metrics
    like_count = Column(Integer, default=0)
    comment_count = Column(Integer, default=0)
    view_count = Column(Integer, nullable=True)  # For videos only
    save_count = Column(Integer, nullable=True)  # If available
    share_count = Column(Integer, nullable=True)  # If available
    engagement_rate = Column(Float, default=0.0)  # Calculated field
    
    # Content analysis
    hashtags = Column(JSON, nullable=True)  # List of hashtags used
    mentioned_users = Column(JSON, nullable=True)  # List of users mentioned
    is_sponsored = Column(Boolean, default=False)  # Detected sponsored content
    brands_mentioned = Column(JSON, nullable=True)  # Brands detected in post
    content_category = Column(String, nullable=True)  # Categorization of content
    content_quality_score = Column(Float, default=0.0)  # Calculated field
    
    # Timestamps
    posted_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    influencer = relationship("Influencer", back_populates="posts")
    
    def __repr__(self):
        return f"<Post {self.instagram_id}>"