from typing import Any, Dict, List, Optional
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models.influencer import Influencer
from app.db.models.metric import InfluencerMetric
from app.db.models.audience import AudienceMetric

router = APIRouter()


@router.get("/top-influencers")
def get_top_influencers(
    db: Session = Depends(get_db),
    limit: int = 10,
    metric: str = "overall_investment_score",
    category: Optional[str] = None
) -> Any:
    """Get top influencers by specified metric"""
    valid_metrics = [
        "overall_investment_score", "engagement_rate", "growth_rate",
        "content_quality_score", "audience_quality_score", "brand_alignment_score",
        "follower_count"
    ]
    
    if metric not in valid_metrics:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid metric. Must be one of: {', '.join(valid_metrics)}"
        )
    
    query = db.query(Influencer)
    
    if category:
        query = query.filter(Influencer.category == category)
    
    # Order by the specified metric
    query = query.order_by(getattr(Influencer, metric).desc())
    
    # Limit results
    top_influencers = query.limit(limit).all()
    
    # Format response
    result = [{
        "id": inf.id,
        "username": inf.username,
        "full_name": inf.full_name,
        "follower_count": inf.follower_count,
        "category": inf.category,
        "is_verified": inf.is_verified,
        "profile_pic_url": inf.profile_pic_url,
        "metric_name": metric,
        "metric_value": getattr(inf, metric)
    } for inf in top_influencers]
    
    return result


@router.get("/growth-trends")
def get_growth_trends(
    db: Session = Depends(get_db),
    days: int = 90,
    influencer_id: Optional[int] = None
) -> Any:
    """Get follower growth trends over time"""
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Base query for metrics
    query = db.query(
        InfluencerMetric.influencer_id,
        func.date_trunc('day', InfluencerMetric.timestamp).label('date'),
        func.avg(InfluencerMetric.follower_count).label('avg_followers'),
        func.avg(InfluencerMetric.follower_growth_rate).label('avg_growth_rate')
    ).filter(InfluencerMetric.timestamp >= start_date)
    
    # Filter by influencer if specified
    if influencer_id:
        query = query.filter(InfluencerMetric.influencer_id == influencer_id)
    
    # Group by date and influencer
    query = query.group_by(
        'date',
        InfluencerMetric.influencer_id
    ).order_by('date')
    
    results = query.all()
    
    # Format response
    if influencer_id:
        # Single influencer format
        influencer = db.query(Influencer).filter(Influencer.id == influencer_id).first()
        if not influencer:
            raise HTTPException(
                status_code=404,
                detail=f"Influencer with ID {influencer_id} not found"
            )
        
        data_points = [{
            "date": result.date.strftime("%Y-%m-%d"),
            "follower_count": int(result.avg_followers),
            "growth_rate": float(result.avg_growth_rate)
        } for result in results]
        
        return {
            "influencer_id": influencer_id,
            "username": influencer.username,
            "data": data_points
        }
    else:
        # Multiple influencers format (aggregated)
        # Group by date
        date_grouped = {}
        for result in results:
            date_str = result.date.strftime("%Y-%m-%d")
            if date_str not in date_grouped:
                date_grouped[date_str] = {
                    "date": date_str,
                    "total_followers": 0,
                    "avg_growth_rate": 0.0,
                    "influencer_count": 0
                }
            
            date_grouped[date_str]["total_followers"] += int(result.avg_followers)
            date_grouped[date_str]["avg_growth_rate"] += float(result.avg_growth_rate)
            date_grouped[date_str]["influencer_count"] += 1
        
        # Calculate averages
        for date_str, data in date_grouped.items():
            if data["influencer_count"] > 0:
                data["avg_growth_rate"] /= data["influencer_count"]
        
        # Convert to list and sort by date
        data_points = list(date_grouped.values())
        data_points.sort(key=lambda x: x["date"])
        
        return {"data": data_points}


@router.get("/category-distribution")
def get_category_distribution(
    db: Session = Depends(get_db),
    min_score: Optional[float] = None
) -> Any:
    """Get distribution of influencers by category"""
    query = db.query(
        Influencer.category,
        func.count(Influencer.id).label('count'),
        func.avg(Influencer.overall_investment_score).label('avg_score')
    )
    
    if min_score is not None:
        query = query.filter(Influencer.overall_investment_score >= min_score)
    
    # Group by category
    query = query.group_by(Influencer.category)
    
    results = query.all()
    
    # Format response
    categories = [{
        "category": result.category or "Uncategorized",
        "count": result.count,
        "avg_score": float(result.avg_score)
    } for result in results]
    
    return {"categories": categories}


@router.get("/audience-demographics")
def get_audience_demographics(
    db: Session = Depends(get_db),
    influencer_id: Optional[int] = None
) -> Any:
    """Get audience demographics data"""
    # Get latest audience metrics
    if influencer_id:
        # For a specific influencer
        audience_metric = db.query(AudienceMetric).filter(
            AudienceMetric.influencer_id == influencer_id
        ).order_by(AudienceMetric.timestamp.desc()).first()
        
        if not audience_metric:
            raise HTTPException(
                status_code=404,
                detail=f"No audience metrics found for influencer {influencer_id}"
            )
        
        influencer = db.query(Influencer).filter(Influencer.id == influencer_id).first()
        
        return {
            "influencer_id": influencer_id,
            "username": influencer.username if influencer else None,
            "age_distribution": audience_metric.age_distribution,
            "gender_distribution": audience_metric.gender_distribution,
            "location_distribution": audience_metric.location_distribution,
            "interest_categories": audience_metric.interest_categories
        }
    else:
        # Aggregated across all influencers
        # Get all latest audience metrics
        subquery = db.query(
            AudienceMetric.influencer_id,
            func.max(AudienceMetric.timestamp).label('max_timestamp')
        ).group_by(AudienceMetric.influencer_id).subquery('latest_metrics')
        
        latest_metrics = db.query(AudienceMetric).join(
            subquery,
            (AudienceMetric.influencer_id == subquery.c.influencer_id) &
            (AudienceMetric.timestamp == subquery.c.max_timestamp)
        ).all()
        
        # Aggregate demographics
        age_distribution = {}
        gender_distribution = {}
        location_distribution = {}
        interest_categories = {}
        
        for metric in latest_metrics:
            # Aggregate age distribution
            if metric.age_distribution:
                for age_group, percentage in metric.age_distribution.items():
                    if age_group not in age_distribution:
                        age_distribution[age_group] = 0
                    age_distribution[age_group] += percentage / len(latest_metrics)
            
            # Aggregate gender distribution
            if metric.gender_distribution:
                for gender, percentage in metric.gender_distribution.items():
                    if gender not in gender_distribution:
                        gender_distribution[gender] = 0
                    gender_distribution[gender] += percentage / len(latest_metrics)
            
            # Aggregate location distribution (top 10)
            if metric.location_distribution:
                for location, percentage in metric.location_distribution.items():
                    if location not in location_distribution:
                        location_distribution[location] = 0
                    location_distribution[location] += percentage / len(latest_metrics)
            
            # Aggregate interest categories
            if metric.interest_categories:
                for category, percentage in metric.interest_categories.items():
                    if category not in interest_categories:
                        interest_categories[category] = 0
                    interest_categories[category] += percentage / len(latest_metrics)
        
        # Sort and limit location distribution to top 10
        location_distribution = dict(sorted(
            location_distribution.items(), 
            key=lambda item: item[1], 
            reverse=True
        )[:10])
        
        # Sort and limit interest categories to top 15
        interest_categories = dict(sorted(
            interest_categories.items(), 
            key=lambda item: item[1], 
            reverse=True
        )[:15])
        
        return {
            "age_distribution": age_distribution,
            "gender_distribution": gender_distribution,
            "location_distribution": location_distribution,
            "interest_categories": interest_categories
        }


@router.get("/investment-opportunities")
def get_investment_opportunities(
    db: Session = Depends(get_db),
    min_score: float = 0.7,
    min_growth_rate: float = 0.1,
    limit: int = 10
) -> Any:
    """Get top investment opportunities based on scores and growth"""
    # Find influencers with high scores and growth rates
    opportunities = db.query(Influencer).filter(
        Influencer.overall_investment_score >= min_score,
        Influencer.growth_rate >= min_growth_rate
    ).order_by(Influencer.overall_investment_score.desc()).limit(limit).all()
    
    # Format response
    result = [{
        "id": inf.id,
        "username": inf.username,
        "full_name": inf.full_name,
        "follower_count": inf.follower_count,
        "category": inf.category,
        "overall_score": inf.overall_investment_score,
        "growth_rate": inf.growth_rate,
        "engagement_rate": inf.engagement_rate,
        "audience_quality": inf.audience_quality_score
    } for inf in opportunities]
    
    return {"opportunities": result}


@router.get("/score-distribution")
def get_score_distribution(
    db: Session = Depends(get_db)
) -> Any:
    """Get distribution of influencers by score ranges"""
    # Define score ranges
    ranges = [
        {"min": 0.0, "max": 0.2, "label": "Very Low"},
        {"min": 0.2, "max": 0.4, "label": "Low"},
        {"min": 0.4, "max": 0.6, "label": "Medium"},
        {"min": 0.6, "max": 0.8, "label": "High"},
        {"min": 0.8, "max": 1.0, "label": "Very High"}
    ]
    
    # Count influencers in each range
    distribution = []
    for range_info in ranges:
        count = db.query(func.count(Influencer.id)).filter(
            Influencer.overall_investment_score >= range_info["min"],
            Influencer.overall_investment_score < range_info["max"]
        ).scalar()
        
        distribution.append({
            "range": range_info["label"],
            "min": range_info["min"],
            "max": range_info["max"],
            "count": count
        })
    
    return {"distribution": distribution}