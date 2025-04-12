from typing import Any, List, Optional
import asyncio
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models.influencer import Influencer
from app.db.models.post import Post
from app.scrapers.instagram_scraper import InstagramScraper
from app.api.api_v1.schemas.influencer import InfluencerResponse

router = APIRouter()


async def scrape_influencer_task(username: str, db: Session):
    """Background task to scrape an influencer's data"""
    scraper = InstagramScraper()
    try:
        await scraper.initialize()
        
        # Scrape profile data
        profile_data = await scraper.get_profile_data(username)
        
        if "error" in profile_data:
            return {"error": profile_data["error"]}
        
        # Check if influencer exists in database
        influencer = db.query(Influencer).filter(Influencer.username == username).first()
        
        if influencer:
            # Update existing influencer
            for key, value in profile_data.items():
                if hasattr(influencer, key):
                    setattr(influencer, key, value)
            
            influencer.last_scraped_at = datetime.utcnow()
        else:
            # Create new influencer
            influencer = Influencer(
                username=profile_data["username"],
                full_name=profile_data.get("full_name"),
                bio=profile_data.get("bio"),
                profile_pic_url=profile_data.get("profile_pic_url"),
                external_url=profile_data.get("external_url"),
                follower_count=profile_data.get("follower_count", 0),
                following_count=profile_data.get("following_count", 0),
                post_count=profile_data.get("post_count", 0),
                is_private=profile_data.get("is_private", False),
                is_verified=profile_data.get("is_verified", False),
                last_scraped_at=datetime.utcnow()
            )
            db.add(influencer)
            db.commit()
            db.refresh(influencer)
        
        # If profile is not private, scrape recent posts
        if not profile_data.get("is_private", False):
            posts_data = await scraper.get_recent_posts(username, limit=12)
            
            for post_data in posts_data:
                if "error" in post_data:
                    continue
                
                # Check if post exists
                post = db.query(Post).filter(Post.instagram_id == post_data["instagram_id"]).first()
                
                if post:
                    # Update existing post
                    for key, value in post_data.items():
                        if hasattr(post, key):
                            setattr(post, key, value)
                else:
                    # Create new post
                    post = Post(
                        instagram_id=post_data["instagram_id"],
                        influencer_id=influencer.id,
                        media_type=post_data.get("media_type"),
                        media_urls=[post_data.get("media_url")] if post_data.get("media_url") else None,
                        permalink=post_data.get("permalink"),
                        like_count=post_data.get("like_count", 0),
                        comment_count=post_data.get("comment_count", 0),
                        posted_at=datetime.fromisoformat(post_data["timestamp"]) if "timestamp" in post_data else None
                    )
                    db.add(post)
            
            # Commit all post changes
            db.commit()
            
            # For each post, get detailed information
            for post_data in posts_data:
                if "error" in post_data or not post_data.get("permalink"):
                    continue
                
                # Get post details
                post_details = await scraper.get_post_details(post_data["permalink"])
                
                if "error" in post_details:
                    continue
                
                # Update post with details
                post = db.query(Post).filter(Post.instagram_id == post_data["instagram_id"]).first()
                if post:
                    post.caption = post_details.get("caption")
                    post.hashtags = post_details.get("hashtags")
                    post.mentioned_users = post_details.get("mentioned_users")
                    post.is_sponsored = post_details.get("is_sponsored", False)
                    
                    # Update engagement metrics if available
                    if "like_count" in post_details and post_details["like_count"] > post.like_count:
                        post.like_count = post_details["like_count"]
                    
                    if "comment_count" in post_details and post_details["comment_count"] > post.comment_count:
                        post.comment_count = post_details["comment_count"]
                    
                    # Calculate engagement rate
                    if influencer.follower_count > 0:
                        post.engagement_rate = (post.like_count + post.comment_count) / influencer.follower_count
            
            # Commit all detail updates
            db.commit()
        
        return {"success": True, "influencer_id": influencer.id}
    
    except Exception as e:
        return {"error": str(e)}
    
    finally:
        await scraper.close()


@router.post("/scrape-influencer/{username}", response_model=dict)
def scrape_influencer(
    *,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    username: str
) -> Any:
    """Trigger scraping of an influencer's data"""
    # Add scraping task to background tasks
    background_tasks.add_task(scrape_influencer_task, username, db)
    
    return {
        "message": f"Scraping of influencer {username} started in the background",
        "status": "processing"
    }


@router.post("/batch-scrape", response_model=dict)
def batch_scrape_influencers(
    *,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    usernames: List[str]
) -> Any:
    """Trigger batch scraping of multiple influencers"""
    if not usernames:
        raise HTTPException(
            status_code=400,
            detail="No usernames provided for batch scraping"
        )
    
    # Add scraping tasks to background tasks
    for username in usernames:
        background_tasks.add_task(scrape_influencer_task, username, db)
    
    return {
        "message": f"Batch scraping of {len(usernames)} influencers started in the background",
        "status": "processing",
        "influencer_count": len(usernames)
    }


@router.get("/scrape-status/{username}", response_model=dict)
def get_scrape_status(
    *,
    db: Session = Depends(get_db),
    username: str
) -> Any:
    """Check the scraping status of an influencer"""
    influencer = db.query(Influencer).filter(Influencer.username == username).first()
    
    if not influencer:
        return {
            "username": username,
            "status": "not_found",
            "message": "Influencer not found in database"
        }
    
    # Check last scraped time
    if influencer.last_scraped_at:
        time_since_scrape = datetime.utcnow() - influencer.last_scraped_at
        hours_since_scrape = time_since_scrape.total_seconds() / 3600
        
        if hours_since_scrape < 24:
            status = "recent"
            message = f"Data was scraped {int(hours_since_scrape)} hours ago"
        else:
            status = "outdated"
            message = f"Data is outdated (last scraped {int(hours_since_scrape / 24)} days ago)"
    else:
        status = "never_scraped"
        message = "Influencer has never been scraped"
    
    return {
        "username": username,
        "status": status,
        "message": message,
        "last_scraped_at": influencer.last_scraped_at,
        "follower_count": influencer.follower_count,
        "post_count": influencer.post_count
    }