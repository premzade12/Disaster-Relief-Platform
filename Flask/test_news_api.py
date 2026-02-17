from dotenv import load_dotenv
import os
import requests
from datetime import datetime, timedelta

load_dotenv()

def test_news_api():
    NEWS_API_KEY = os.environ.get('NEWS_API_KEY')
    
    if not NEWS_API_KEY:
        print("ERROR: NEWS_API_KEY not found")
        return
    
    print(f"Testing News API with key: {NEWS_API_KEY[:10]}...")
    
    # Test parameters
    disaster_type = "Flood"
    location = "Mumbai, Maharashtra"
    city = location.split(',')[0].strip()
    query = f"{disaster_type} {city}"
    
    url = 'https://newsapi.org/v2/everything'
    params = {
        'q': query,
        'apiKey': NEWS_API_KEY,
        'language': 'en',
        'sortBy': 'publishedAt',
        'pageSize': 10,
        'from': (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
    }
    
    print(f"Searching for: {query}")
    response = requests.get(url, params=params, timeout=10)
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        articles = data.get('articles', [])
        total_results = data.get('totalResults', 0)
        
        print(f"Total Results: {total_results}")
        print(f"Articles Retrieved: {len(articles)}")
        
        # Check relevance
        relevant_articles = 0
        for article in articles:
            article_text = f"{article.get('title', '')} {article.get('description', '')}".lower()
            if disaster_type.lower() in article_text and city.lower() in article_text:
                relevant_articles += 1
                print(f"  - Relevant: {article.get('title', 'No title')[:60]}...")
        
        print(f"\nRelevant Articles: {relevant_articles}")
        is_verified = relevant_articles > 0
        confidence = min(0.95, 0.5 + (relevant_articles * 0.15))
        
        print(f"Verified: {is_verified}")
        print(f"Confidence: {confidence:.2%}")
        print("\nSUCCESS: News API is working!")
    else:
        print(f"ERROR: API returned status {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    test_news_api()
