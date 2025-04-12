import asyncio
import logging
import random
from datetime import datetime
from typing import Dict, List, Optional, Union

from playwright.async_api import async_playwright
from tenacity import retry, stop_after_attempt, wait_exponential
from fake_useragent import UserAgent

from app.core.config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class InstagramScraper:
    """Instagram scraper using Playwright with proxy rotation"""
    
    def __init__(self):
        self.proxies = settings.PROXY_LIST
        self.current_proxy_index = 0
        self.user_agent = UserAgent()
        self.last_proxy_rotation = datetime.utcnow()
        self.browser = None
        self.context = None
        self.page = None
    
    async def initialize(self):
        """Initialize the browser and page"""
        playwright = await async_playwright().start()
        
        # Get proxy if available
        proxy = self._get_next_proxy() if self.proxies else None
        
        # Get random user agent if rotation is enabled
        user_agent = self.user_agent.random if settings.USER_AGENT_ROTATION else None
        
        # Launch browser with proxy if available
        browser_args = {}
        if proxy:
            browser_args["proxy"] = {
                "server": proxy,
                # Add credentials if needed
                # "username": "username",
                # "password": "password",
            }
        
        self.browser = await playwright.chromium.launch(headless=True)
        
        # Create context with user agent if specified
        context_args = {}
        if user_agent:
            context_args["user_agent"] = user_agent
        
        self.context = await self.browser.new_context(**context_args)
        self.page = await self.context.new_page()
        
        # Set default timeout
        self.page.set_default_timeout(settings.REQUEST_TIMEOUT * 1000)
        
        logger.info(f"Browser initialized with proxy: {proxy} and user agent: {user_agent}")
    
    async def close(self):
        """Close browser and clean up resources"""
        if self.context:
            await self.context.close()
        if self.browser:
            await self.browser.close()
    
    def _get_next_proxy(self) -> str:
        """Get the next proxy from the rotation list"""
        if not self.proxies:
            return None
        
        proxy = self.proxies[self.current_proxy_index]
        self.current_proxy_index = (self.current_proxy_index + 1) % len(self.proxies)
        self.last_proxy_rotation = datetime.utcnow()
        
        return proxy
    
    async def _rotate_proxy_if_needed(self):
        """Check if proxy rotation is needed based on time interval"""
        if not self.proxies:
            return
        
        now = datetime.utcnow()
        minutes_since_rotation = (now - self.last_proxy_rotation).total_seconds() / 60
        
        if minutes_since_rotation >= settings.PROXY_ROTATION_INTERVAL:
            await self.close()
            await self.initialize()
            logger.info("Rotated proxy based on time interval")
    
    @retry(stop=stop_after_attempt(settings.REQUEST_RETRY_COUNT), 
           wait=wait_exponential(multiplier=1, min=4, max=10))
    async def _fetch_page(self, url: str) -> str:
        """Fetch a page with retry logic"""
        try:
            await self._rotate_proxy_if_needed()
            await self.page.goto(url, wait_until="networkidle")
            content = await self.page.content()
            return content
        except Exception as e:
            logger.error(f"Error fetching {url}: {str(e)}")
            raise
    
    async def get_profile_data(self, username: str) -> Dict:
        """Scrape basic profile data for an Instagram user"""
        profile_url = f"https://www.instagram.com/{username}/"
        
        try:
            await self._fetch_page(profile_url)
            
            # Check if profile exists
            not_found_selector = "text=Sorry, this page isn't available."
            if await self.page.query_selector(not_found_selector):
                logger.warning(f"Profile {username} not found")
                return {"error": "Profile not found"}
            
            # Check if profile is private
            private_selector = "text=This Account is Private"
            is_private = await self.page.query_selector(private_selector) is not None
            
            # Extract profile data using JavaScript evaluation
            profile_data = await self.page.evaluate("""
                () => {
                    // Try to find the data in the page's JSON-LD
                    const jsonLd = document.querySelector('script[type="application/ld+json"]');
                    if (jsonLd) {
                        try {
                            const data = JSON.parse(jsonLd.textContent);
                            return {
                                username: data.name || data.alternateName,
                                full_name: data.name,
                                profile_pic_url: data.image,
                                external_url: data.url,
                                bio: data.description,
                            };
                        } catch (e) {
                            // JSON parsing failed, continue with DOM extraction
                        }
                    }
                    
                    // Extract data from meta tags and DOM elements
                    const metaDescription = document.querySelector('meta[name="description"]');
                    const description = metaDescription ? metaDescription.content : '';
                    
                    // Parse follower count from description
                    const followerMatch = description.match(/(\d+(\.\d+)?(k|m)?) Followers/i);
                    const followerText = followerMatch ? followerMatch[1] : '0';
                    let followerCount = parseInt(followerText.replace(/[km]/i, ''));
                    if (followerText.toLowerCase().includes('k')) {
                        followerCount *= 1000;
                    } else if (followerText.toLowerCase().includes('m')) {
                        followerCount *= 1000000;
                    }
                    
                    // Parse following count from description
                    const followingMatch = description.match(/(\d+(\.\d+)?(k|m)?) Following/i);
                    const followingText = followingMatch ? followingMatch[1] : '0';
                    let followingCount = parseInt(followingText.replace(/[km]/i, ''));
                    if (followingText.toLowerCase().includes('k')) {
                        followingCount *= 1000;
                    } else if (followingText.toLowerCase().includes('m')) {
                        followingCount *= 1000000;
                    }
                    
                    // Parse post count from description
                    const postMatch = description.match(/(\d+(\.\d+)?(k|m)?) Posts/i);
                    const postText = postMatch ? postMatch[1] : '0';
                    let postCount = parseInt(postText.replace(/[km]/i, ''));
                    if (postText.toLowerCase().includes('k')) {
                        postCount *= 1000;
                    } else if (postText.toLowerCase().includes('m')) {
                        postCount *= 1000000;
                    }
                    
                    // Extract profile image
                    const profileImg = document.querySelector('img[alt*="profile picture"]');
                    const profilePicUrl = profileImg ? profileImg.src : null;
                    
                    // Extract bio text
                    const bioElement = document.querySelector('div:-webkit-any(header, section) > div > span');
                    const bio = bioElement ? bioElement.textContent : '';
                    
                    // Check if verified
                    const verifiedBadge = document.querySelector('span[aria-label="Verified"]');
                    const isVerified = verifiedBadge !== null;
                    
                    return {
                        username: window.location.pathname.replace(/\//g, ''),
                        full_name: document.querySelector('h2')?.textContent || '',
                        bio: bio,
                        profile_pic_url: profilePicUrl,
                        follower_count: followerCount,
                        following_count: followingCount,
                        post_count: postCount,
                        is_verified: isVerified,
                    };
                }
            """)
            
            # Add private flag and timestamp
            profile_data["is_private"] = is_private
            profile_data["last_scraped_at"] = datetime.utcnow().isoformat()
            
            return profile_data
            
        except Exception as e:
            logger.error(f"Error scraping profile {username}: {str(e)}")
            return {"error": str(e)}
    
    async def get_recent_posts(self, username: str, limit: int = 12) -> List[Dict]:
        """Scrape recent posts from an Instagram profile"""
        profile_url = f"https://www.instagram.com/{username}/"
        
        try:
            await self._fetch_page(profile_url)
            
            # Check if profile exists and is not private
            not_found_selector = "text=Sorry, this page isn't available."
            private_selector = "text=This Account is Private"
            
            if await self.page.query_selector(not_found_selector):
                logger.warning(f"Profile {username} not found")
                return [{"error": "Profile not found"}]
            
            if await self.page.query_selector(private_selector):
                logger.warning(f"Profile {username} is private")
                return [{"error": "Profile is private"}]
            
            # Extract posts data using JavaScript evaluation
            posts_data = await self.page.evaluate(f"""
                (limit) => {{
                    // Function to extract post data from article elements
                    const extractPostData = (article) => {{
                        // Get post link
                        const linkElement = article.querySelector('a');
                        const postUrl = linkElement ? linkElement.href : null;
                        const postId = postUrl ? postUrl.split('/p/')[1]?.split('/')[0] : null;
                        
                        // Get image/video
                        const mediaElement = article.querySelector('img, video');
                        const mediaUrl = mediaElement ? mediaElement.src : null;
                        const mediaType = article.querySelector('video') ? 'VIDEO' : 'IMAGE';
                        
                        // Try to get like count from aria-label
                        let likeCount = 0;
                        const likeElement = article.querySelector('[aria-label*="like"]');
                        if (likeElement) {{
                            const likeMatch = likeElement.getAttribute('aria-label').match(/(\d+)\s+like/i);
                            if (likeMatch) {{
                                likeCount = parseInt(likeMatch[1]);
                            }}
                        }}
                        
                        // Try to get comment count
                        let commentCount = 0;
                        const commentElement = article.querySelector('[aria-label*="comment"]');
                        if (commentElement) {{
                            const commentMatch = commentElement.getAttribute('aria-label').match(/(\d+)\s+comment/i);
                            if (commentMatch) {{
                                commentCount = parseInt(commentMatch[1]);
                            }}
                        }}
                        
                        return {{
                            instagram_id: postId,
                            permalink: postUrl,
                            media_type: mediaType,
                            media_url: mediaUrl,
                            like_count: likeCount,
                            comment_count: commentCount,
                            timestamp: new Date().toISOString(),
                        }};
                    }};
                    
                    // Find all post articles
                    const articles = Array.from(document.querySelectorAll('article'));
                    
                    // If no articles found, try to find post elements another way
                    if (articles.length === 0) {{
                        const postElements = Array.from(document.querySelectorAll('a[href*="/p/"]'));
                        return postElements.slice(0, limit).map(element => {{
                            const postUrl = element.href;
                            const postId = postUrl.split('/p/')[1]?.split('/')[0];
                            const mediaElement = element.querySelector('img');
                            const mediaUrl = mediaElement ? mediaElement.src : null;
                            
                            return {{
                                instagram_id: postId,
                                permalink: postUrl,
                                media_type: 'IMAGE', // Default assumption
                                media_url: mediaUrl,
                                timestamp: new Date().toISOString(),
                            }};
                        }});
                    }}
                    
                    // Extract data from each article
                    return articles.slice(0, limit).map(extractPostData);
                }}
            """, limit)
            
            return posts_data
            
        except Exception as e:
            logger.error(f"Error scraping posts for {username}: {str(e)}")
            return [{"error": str(e)}]
    
    async def get_post_details(self, post_url: str) -> Dict:
        """Scrape detailed information about a specific post"""
        try:
            await self._fetch_page(post_url)
            
            # Check if post exists
            not_found_selector = "text=Sorry, this page isn't available."
            if await self.page.query_selector(not_found_selector):
                logger.warning(f"Post {post_url} not found")
                return {"error": "Post not found"}
            
            # Extract post data using JavaScript evaluation
            post_data = await self.page.evaluate("""
                () => {
                    // Try to find the data in the page's JSON-LD
                    const jsonLd = document.querySelector('script[type="application/ld+json"]');
                    if (jsonLd) {
                        try {
                            const data = JSON.parse(jsonLd.textContent);
                            return {
                                instagram_id: window.location.pathname.split('/p/')[1]?.split('/')[0],
                                caption: data.caption,
                                media_type: data.video ? 'VIDEO' : 'IMAGE',
                                media_url: data.image || data.thumbnailUrl,
                                permalink: window.location.href,
                                like_count: data.interactionStatistic?.find(s => s.interactionType === 'https://schema.org/LikeAction')?.userInteractionCount || 0,
                                comment_count: data.commentCount || 0,
                                timestamp: data.uploadDate,
                                author: data.author?.name || '',
                            };
                        } catch (e) {
                            // JSON parsing failed, continue with DOM extraction
                        }
                    }
                    
                    // Extract data from DOM elements
                    const captionElement = document.querySelector('div[data-testid="post-comment-root"] > span');
                    const caption = captionElement ? captionElement.textContent : '';
                    
                    // Extract hashtags from caption
                    const hashtags = [];
                    if (caption) {
                        const hashtagMatches = caption.match(/#[\w\u0590-\u05ff]+/g);
                        if (hashtagMatches) {
                            hashtags.push(...hashtagMatches);
                        }
                    }
                    
                    // Extract mentioned users from caption
                    const mentionedUsers = [];
                    if (caption) {
                        const mentionMatches = caption.match(/@[\w.]+/g);
                        if (mentionMatches) {
                            mentionedUsers.push(...mentionMatches.map(m => m.substring(1)));
                        }
                    }
                    
                    // Determine media type
                    const videoElement = document.querySelector('video');
                    const mediaType = videoElement ? 'VIDEO' : 'IMAGE';
                    
                    // Get media URL
                    const mediaElement = videoElement || document.querySelector('img[style*="object-fit"]');
                    const mediaUrl = mediaElement ? mediaElement.src : null;
                    
                    // Try to get like count
                    let likeCount = 0;
                    const likeElement = document.querySelector('[aria-label*="like"]');
                    if (likeElement) {
                        const likeMatch = likeElement.getAttribute('aria-label').match(/(\d+)\s+like/i);
                        if (likeMatch) {
                            likeCount = parseInt(likeMatch[1]);
                        }
                    }
                    
                    // Try to get comment count
                    let commentCount = 0;
                    const commentElement = document.querySelector('[aria-label*="comment"]');
                    if (commentElement) {
                        const commentMatch = commentElement.getAttribute('aria-label').match(/(\d+)\s+comment/i);
                        if (commentMatch) {
                            commentCount = parseInt(commentMatch[1]);
                        }
                    }
                    
                    // Try to determine if post is sponsored
                    const sponsoredText = document.querySelector('a[href*="/ads/"]');
                    const isPaidPartnership = document.querySelector('span:-webkit-any(span, div):contains("Paid partnership")') !== null;
                    const isSponsored = sponsoredText !== null || isPaidPartnership;
                    
                    // Get timestamp if available
                    const timeElement = document.querySelector('time');
                    const timestamp = timeElement ? timeElement.getAttribute('datetime') : new Date().toISOString();
                    
                    return {
                        instagram_id: window.location.pathname.split('/p/')[1]?.split('/')[0],
                        caption: caption,
                        hashtags: hashtags,
                        mentioned_users: mentionedUsers,
                        media_type: mediaType,
                        media_url: mediaUrl,
                        permalink: window.location.href,
                        like_count: likeCount,
                        comment_count: commentCount,
                        is_sponsored: isSponsored,
                        timestamp: timestamp,
                    };
                }
            """)
            
            return post_data
            
        except Exception as e:
            logger.error(f"Error scraping post {post_url}: {str(e)}")
            return {"error": str(e)}


# Example usage
async def main():
    scraper = InstagramScraper()
    try:
        await scraper.initialize()
        
        # Example: Get profile data
        username = "instagram"
        profile_data = await scraper.get_profile_data(username)
        print(f"Profile data for {username}:")
        print(profile_data)
        
        # Example: Get recent posts
        posts = await scraper.get_recent_posts(username, limit=5)
        print(f"\nRecent posts for {username}:")
        for post in posts:
            print(f"- {post.get('instagram_id')}: {post.get('permalink')}")
        
        # Example: Get post details
        if posts and "permalink" in posts[0]:
            post_url = posts[0]["permalink"]
            post_details = await scraper.get_post_details(post_url)
            print(f"\nDetails for post {post_url}:")
            print(post_details)
    
    finally:
        await scraper.close()


if __name__ == "__main__":
    asyncio.run(main())