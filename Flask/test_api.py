import requests
import json

def test_api():
    base_url = "http://127.0.0.1:5000"
    
    print("🧪 Testing Disaster Assessment API...")
    
    # Test 1: Check if server is running
    try:
        response = requests.get(f"{base_url}/")
        print(f"✅ Server is running: {response.status_code}")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"❌ Server not running: {e}")
        return
    
    # Test 2: Get stats
    try:
        response = requests.get(f"{base_url}/api/stats")
        print(f"✅ Stats endpoint: {response.status_code}")
        print(f"   Data: {response.json()}")
    except Exception as e:
        print(f"❌ Stats endpoint failed: {e}")
    
    # Test 3: Get reports
    try:
        response = requests.get(f"{base_url}/api/reports")
        print(f"✅ Reports endpoint: {response.status_code}")
        print(f"   Reports count: {len(response.json())}")
    except Exception as e:
        print(f"❌ Reports endpoint failed: {e}")
    
    print("\n🎉 API tests completed!")
    print("💡 If all tests pass, your React app should work!")

if __name__ == "__main__":
    test_api()