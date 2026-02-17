import requests
import json

API_URL = "http://localhost:5001"

# Get all reports
response = requests.get(f"{API_URL}/api/reports")
reports = response.json()

print(f"Total reports: {len(reports)}")
print(f"Fully verified: {len([r for r in reports if r.get('final_verified')])}")
print(f"Models agree: {len([r for r in reports if r.get('models_agree')])}")
print("\n" + "="*60)

# Verify reports where models agree but not news verified
for report in reports:
    if report.get('models_agree') and not report.get('news_verified'):
        report_id = report['_id']
        title = report['title']
        
        print(f"\nVerifying: {title}")
        print(f"  Location: {report['location']}")
        print(f"  Type: {report['disaster_type']}")
        
        try:
            verify_response = requests.post(f"{API_URL}/api/verify-report/{report_id}")
            result = verify_response.json()
            
            if result.get('success'):
                print(f"  [OK] Status: {result['updated_status']}")
                print(f"  Final Verified: {result['final_verified']}")
            else:
                print(f"  [ERROR] Error: {result.get('error')}")
        except Exception as e:
            print(f"  [FAILED] Failed: {e}")

print("\n" + "="*60)
print("\n[SUMMARY] Final Summary:")
response = requests.get(f"{API_URL}/api/reports")
reports = response.json()
print(f"Total reports: {len(reports)}")
print(f"Fully verified (on map): {len([r for r in reports if r.get('final_verified')])}")
print(f"Partially verified: {len([r for r in reports if r.get('models_agree') and not r.get('final_verified')])}")
