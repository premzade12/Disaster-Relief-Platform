from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

def calculate_severity(description):
    desc_lower = description.lower()
    high_keywords = ['severe', 'major', 'massive', 'catastrophic', 'devastating', 'critical', 
                     'emergency', 'evacuations', 'casualties', 'deaths', 'collapsed', 'destroyed']
    medium_keywords = ['moderate', 'significant', 'considerable', 'damage', 'affected', 
                       'warning', 'alert', 'spreading', 'rising']
    
    if any(keyword in desc_lower for keyword in high_keywords):
        return 'High'
    elif any(keyword in desc_lower for keyword in medium_keywords):
        return 'Medium'
    else:
        return 'Low'

MONGO_URI = os.environ.get('MONGO_URI')
client = MongoClient(MONGO_URI)
db = client.disaster_relief
reports_collection = db.reports

reports = list(reports_collection.find({}))
print(f"Found {len(reports)} reports")

for report in reports:
    if 'severity' not in report:
        severity = calculate_severity(report.get('description', ''))
        reports_collection.update_one(
            {'_id': report['_id']},
            {'$set': {'severity': severity}}
        )
        print(f"Updated {report.get('title', 'Unknown')} - Severity: {severity}")
    else:
        print(f"Skipped {report.get('title', 'Unknown')} - Already has severity: {report['severity']}")

print("\nDone! All reports now have severity.")
