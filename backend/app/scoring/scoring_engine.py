import logging
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Union

from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.models.influencer import Influencer
from app.db.models.post import Post
from app.db.models.metric import InfluencerMetric
from app.db.models.audience import AudienceMetric

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ScoringEngine:
    """Engine for calculating investment scores for influencers based on VC metrics"""
    
    def __init__(self, db: Session):
        self.db = db
        # Load weights from settings
        self.engagement_weight = settings.ENGAGEMENT_RATE_WEIGHT
        self.growth_weight = settings.FOLLOWER_GROWTH_WEIGHT
        self.content_quality_weight = settings.CONTENT_QUALITY_WEIGHT
        self.audience_quality_weight = settings.AUDIENCE_QUALITY_WEIGHT
        self.brand_alignment_weight = settings.BRAND_ALIGNMENT_WEIGHT
    
    def calculate_engagement_rate(self, influencer_id: int) -> float:
        """Calculate engagement rate based on recent posts"""
        # Get the influencer
        influencer = self.db.query(Influencer).filter(Influencer.id == influencer_id).first()
        if not influencer:
            logger.error(f"Influencer with ID {influencer_id} not found")
            return 0.0
        
        # Get recent posts (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_posts = self.db.query(Post).filter(
            Post.influencer_id == influencer_id,
            Post.posted_at >= thirty_days_ago
        ).all()
        
        if not recent_posts:
            logger.warning(f"No recent posts found for influencer {influencer.username}")
            return 0.0
        
        # Calculate average engagement per post
        total_engagement = sum(post.like_count + post.comment_count for post in recent_posts)
        avg_engagement_per_post = total_engagement / len(recent_posts)
        
        # Calculate engagement rate (engagement / followers)
        if influencer.follower_count > 0:
            engagement_rate = avg_engagement_per_post / influencer.follower_count
        else:
            engagement_rate = 0.0
        
        # Apply logarithmic scaling for large follower counts
        # This prevents unfair disadvantage for mega-influencers
        if influencer.follower_count > 100000:  # 100k followers
            follower_factor = np.log10(influencer.follower_count / 10000)
            engagement_rate *= follower_factor
        
        return min(engagement_rate, 1.0)  # Cap at 1.0
    
    def calculate_growth_rate(self, influencer_id: int) -> float:
        """Calculate follower growth rate over time"""
        # Get historical metrics for the past 90 days
        ninety_days_ago = datetime.utcnow() - timedelta(days=90)
        metrics = self.db.query(InfluencerMetric).filter(
            InfluencerMetric.influencer_id == influencer_id,
            InfluencerMetric.timestamp >= ninety_days_ago
        ).order_by(InfluencerMetric.timestamp).all()
        
        if len(metrics) < 2:
            logger.warning(f"Not enough historical data for influencer {influencer_id}")
            return 0.0
        
        # Get oldest and newest metrics
        oldest_metric = metrics[0]
        newest_metric = metrics[-1]
        
        # Calculate time difference in days
        time_diff = (newest_metric.timestamp - oldest_metric.timestamp).days
        if time_diff < 1:
            time_diff = 1  # Avoid division by zero
        
        # Calculate follower growth
        follower_diff = newest_metric.follower_count - oldest_metric.follower_count
        
        # Calculate daily growth rate
        daily_growth_rate = follower_diff / time_diff
        
        # Calculate percentage growth rate
        if oldest_metric.follower_count > 0:
            percentage_growth_rate = (follower_diff / oldest_metric.follower_count) * 100
            # Normalize to 0-1 scale (assuming 100% growth in 90 days is exceptional)
            normalized_growth_rate = min(percentage_growth_rate / 100, 1.0)
        else:
            normalized_growth_rate = 0.0
        
        return normalized_growth_rate
    
    def calculate_content_quality_score(self, influencer_id: int) -> float:
        """Calculate content quality score based on post performance"""
        # Get the influencer
        influencer = self.db.query(Influencer).filter(Influencer.id == influencer_id).first()
        if not influencer:
            return 0.0
        
        # Get recent posts
        recent_posts = self.db.query(Post).filter(
            Post.influencer_id == influencer_id
        ).order_by(Post.posted_at.desc()).limit(20).all()
        
        if not recent_posts:
            return 0.0
        
        # Calculate metrics for content quality
        total_posts = len(recent_posts)
        
        # 1. Consistency score - regular posting schedule
        if total_posts >= 2:
            post_dates = [post.posted_at for post in recent_posts if post.posted_at]
            post_dates.sort(reverse=True)
            
            # Calculate average days between posts
            intervals = [(post_dates[i] - post_dates[i+1]).days 
                        for i in range(len(post_dates)-1) if post_dates[i] and post_dates[i+1]]
            
            if intervals:
                avg_interval = sum(intervals) / len(intervals)
                # Variance in posting schedule (lower is better)
                if len(intervals) > 1:
                    variance = sum((interval - avg_interval) ** 2 for interval in intervals) / len(intervals)
                    # Normalize variance (0-1 where 1 is perfectly consistent)
                    consistency_score = 1.0 / (1.0 + variance/10)  # Adjust divisor as needed
                else:
                    consistency_score = 0.7  # Default for limited data
            else:
                consistency_score = 0.5
        else:
            consistency_score = 0.3  # Low score for very few posts
        
        # 2. Engagement consistency - how consistently posts perform
        engagement_rates = []
        for post in recent_posts:
            if influencer.follower_count > 0:
                post_engagement = (post.like_count + post.comment_count) / influencer.follower_count
                engagement_rates.append(post_engagement)
        
        if engagement_rates:
            avg_engagement = sum(engagement_rates) / len(engagement_rates)
            if len(engagement_rates) > 1:
                engagement_variance = sum((rate - avg_engagement) ** 2 for rate in engagement_rates) / len(engagement_rates)
                # Normalize (0-1 where 1 is consistently engaging content)
                engagement_consistency = 1.0 / (1.0 + engagement_variance * 100)  # Scale factor
            else:
                engagement_consistency = 0.7
        else:
            engagement_consistency = 0.5
        
        # 3. Media diversity score - mix of image, video, carousel
        media_types = {post.media_type for post in recent_posts if post.media_type}
        media_diversity = len(media_types) / 3.0  # Normalize by max types (IMAGE, VIDEO, CAROUSEL_ALBUM)
        
        # 4. Caption quality - based on length and hashtag usage
        caption_scores = []
        for post in recent_posts:
            if not post.caption:
                caption_scores.append(0.3)  # Penalty for no caption
                continue
                
            # Length score - favor moderate length captions
            caption_length = len(post.caption)
            if caption_length < 10:
                length_score = 0.3  # Too short
            elif caption_length < 50:
                length_score = 0.6  # Short but acceptable
            elif caption_length < 300:
                length_score = 1.0  # Ideal length
            elif caption_length < 500:
                length_score = 0.8  # Getting long
            else:
                length_score = 0.5  # Too long
            
            # Hashtag score - favor moderate hashtag usage
            if not post.hashtags:
                hashtag_count = 0
            else:
                hashtag_count = len(post.hashtags)
                
            if hashtag_count == 0:
                hashtag_score = 0.4  # No hashtags
            elif hashtag_count <= 5:
                hashtag_score = 0.9  # Good amount
            elif hashtag_count <= 15:
                hashtag_score = 0.7  # Getting excessive
            else:
                hashtag_score = 0.3  # Hashtag spam
            
            caption_scores.append((length_score + hashtag_score) / 2)
        
        avg_caption_score = sum(caption_scores) / len(caption_scores) if caption_scores else 0.5
        
        # Combine all factors with weights
        content_quality_score = (
            consistency_score * 0.25 +
            engagement_consistency * 0.35 +
            media_diversity * 0.15 +
            avg_caption_score * 0.25
        )
        
        return min(content_quality_score, 1.0)  # Cap at 1.0
    
    def calculate_audience_quality_score(self, influencer_id: int) -> float:
        """Calculate audience quality score based on audience metrics"""
        # Get latest audience metrics
        audience_metric = self.db.query(AudienceMetric).filter(
            AudienceMetric.influencer_id == influencer_id
        ).order_by(AudienceMetric.timestamp.desc()).first()
        
        if not audience_metric:
            logger.warning(f"No audience metrics found for influencer {influencer_id}")
            return 0.5  # Default middle score when no data available
        
        # 1. Authenticity score - real followers vs bots/inactive
        authenticity_score = audience_metric.authentic_followers_ratio
        
        # 2. Engagement quality - how engaged the audience is
        engagement_quality = audience_metric.engagement_rate
        
        # 3. Loyalty score - consistent engagement from same users
        loyalty_score = audience_metric.loyalty_score
        
        # 4. Purchasing power - estimated economic value of audience
        purchasing_power = audience_metric.purchasing_power_score
        
        # 5. Influence multiplier - how influential the audience is
        influence_score = audience_metric.influence_multiplier
        
        # Combine scores with weights
        audience_quality_score = (
            authenticity_score * 0.3 +
            engagement_quality * 0.2 +
            loyalty_score * 0.15 +
            purchasing_power * 0.25 +
            influence_score * 0.1
        )
        
        return min(audience_quality_score, 1.0)  # Cap at 1.0
    
    def calculate_brand_alignment_score(self, influencer_id: int, industry_categories: List[str] = None) -> float:
        """Calculate brand alignment score based on content categories and audience interests"""
        # This would typically be customized per VC firm's investment focus
        # For now, we'll use a simplified approach
        
        # Get the influencer
        influencer = self.db.query(Influencer).filter(Influencer.id == influencer_id).first()
        if not influencer:
            return 0.0
        
        # Get latest audience metrics for interest categories
        audience_metric = self.db.query(AudienceMetric).filter(
            AudienceMetric.influencer_id == influencer_id
        ).order_by(AudienceMetric.timestamp.desc()).first()
        
        # Default alignment score if no data
        if not audience_metric or not audience_metric.interest_categories:
            return 0.5
        
        # If no specific industry categories provided, use a default scoring
        if not industry_categories:
            # Default scoring based on general VC interest areas
            # Higher weights for tech, finance, business, lifestyle categories
            vc_interest_weights = {
                "technology": 1.0,
                "finance": 0.9,
                "business": 0.9,
                "entrepreneurship": 1.0,
                "startups": 1.0,
                "innovation": 0.9,
                "lifestyle": 0.7,
                "health": 0.8,
                "fitness": 0.7,
                "fashion": 0.6,
                "beauty": 0.6,
                "travel": 0.5,
                "food": 0.5,
                "entertainment": 0.4,
                "gaming": 0.7,
                "education": 0.8,
                "science": 0.8
            }
            
            # Calculate weighted score based on audience interests
            total_weight = 0
            weighted_sum = 0
            
            for category, percentage in audience_metric.interest_categories.items():
                category_lower = category.lower()
                weight = vc_interest_weights.get(category_lower, 0.5)  # Default weight for unknown categories
                weighted_sum += percentage * weight
                total_weight += percentage
            
            if total_weight > 0:
                alignment_score = weighted_sum / total_weight
            else:
                alignment_score = 0.5
        else:
            # Calculate alignment based on specified industry categories
            alignment_scores = []
            
            for category in industry_categories:
                category_lower = category.lower()
                # Check if this category exists in audience interests
                if category_lower in {k.lower(): v for k, v in audience_metric.interest_categories.items()}:
                    # Higher score for stronger match
                    alignment_scores.append(audience_metric.interest_categories.get(category_lower, 0))
            
            if alignment_scores:
                alignment_score = sum(alignment_scores) / len(alignment_scores)
            else:
                alignment_score = 0.3  # Low score if no matches
        
        return min(alignment_score, 1.0)  # Cap at 1.0
    
    def calculate_overall_score(self, influencer_id: int, industry_categories: List[str] = None) -> Dict[str, float]:
        """Calculate overall investment score and component scores"""
        # Calculate individual component scores
        engagement_rate = self.calculate_engagement_rate(influencer_id)
        growth_rate = self.calculate_growth_rate(influencer_id)
        content_quality = self.calculate_content_quality_score(influencer_id)
        audience_quality = self.calculate_audience_quality_score(influencer_id)
        brand_alignment = self.calculate_brand_alignment_score(influencer_id, industry_categories)
        
        # Calculate weighted overall score
        overall_score = (
            engagement_rate * self.engagement_weight +
            growth_rate * self.growth_weight +
            content_quality * self.content_quality_weight +
            audience_quality * self.audience_quality_weight +
            brand_alignment * self.brand_alignment_weight
        )
        
        # Return all scores
        return {
            "overall_investment_score": overall_score,
            "engagement_rate": engagement_rate,
            "growth_rate": growth_rate,
            "content_quality_score": content_quality,
            "audience_quality_score": audience_quality,
            "brand_alignment_score": brand_alignment
        }
    
    def update_influencer_scores(self, influencer_id: int, industry_categories: List[str] = None) -> Dict[str, float]:
        """Calculate and update scores for an influencer in the database"""
        # Calculate scores
        scores = self.calculate_overall_score(influencer_id, industry_categories)
        
        # Update influencer record
        influencer = self.db.query(Influencer).filter(Influencer.id == influencer_id).first()
        if influencer:
            influencer.engagement_rate = scores["engagement_rate"]
            influencer.growth_rate = scores["growth_rate"]
            influencer.content_quality_score = scores["content_quality_score"]
            influencer.audience_quality_score = scores["audience_quality_score"]
            influencer.brand_alignment_score = scores["brand_alignment_score"]
            influencer.overall_investment_score = scores["overall_investment_score"]
            
            # Save to database
            self.db.commit()
            logger.info(f"Updated scores for influencer {influencer.username}")
        else:
            logger.error(f"Influencer with ID {influencer_id} not found")
        
        return scores
    
    def batch_update_scores(self, industry_categories: List[str] = None) -> int:
        """Update scores for all influencers in the database"""
        influencers = self.db.query(Influencer).all()
        updated_count = 0
        
        for influencer in influencers:
            try:
                self.update_influencer_scores(influencer.id, industry_categories)
                updated_count += 1
            except Exception as e:
                logger.error(f"Error updating scores for influencer {influencer.username}: {str(e)}")
                continue
        
        return updated_count