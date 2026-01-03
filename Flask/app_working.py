from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
from keras.models import load_model
from werkzeug.utils import secure_filename
import os
from datetime import datetime
import requests
import json

app = Flask(__name__)
CORS(app, origins=["*", "https://disaster-relief-platform-frontend.onrender.com"])  # Allow all origins for development

# Loading the model
try:
    model = load_model(r"C:\Users\HP\OneDrive\Desktop\DisaterAssesment\Flask\disaster.h5")
    print("✅ Model loaded successfully!")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    model = None

# In-memory storage for reports and actions
reports = [
    {
        '_id': 1,
        'title': 'Heavy Flooding in Downtown Area',
        'location': 'Mumbai, Maharashtra',
        'description': 'Severe flooding reported in commercial district',
        'disaster_type': 'Flood',
        'source': 'User Report',
        'timestamp': datetime.now().isoformat(),
        'status': 'Verified',
        'coordinates': {'lat': 19.0760, 'lng': 72.8777},
        'news_verified': True,
        'severity': 'High'
    },
    {
        '_id': 2,
        'title': 'Earthquake Tremors Felt',
        'location': 'Delhi, India',
        'description': 'Mild earthquake tremors reported by residents',
        'disaster_type': 'Earthquake',
        'source': 'User Report',
        'timestamp': datetime.now().isoformat(),
        'status': 'Pending Verification',
        'coordinates': {'lat': 28.7041, 'lng': 77.1025},
        'news_verified': False,
        'severity': 'Medium'
    },
    {
        '_id': 3,
        'title': 'Wildfire Spreading Rapidly',
        'location': 'Bangalore, Karnataka',
        'description': 'Forest fire reported in outskirts',
        'disaster_type': 'Wildfire',
        'source': 'User Report',
        'timestamp': datetime.now().isoformat(),
        'status': 'Verified',
        'coordinates': {'lat': 12.9716, 'lng': 77.5946},
        'news_verified': True,
        'severity': 'High'
    }
]

# NGO Actions storage
ngo_actions = []

stats = {
    "total_reports": len(reports),
    "verified_emergencies": len([r for r in reports if r['status'] == 'Verified']),
    "active_ngos": 3,
    "pending_verification": len([r for r in reports if r['status'] == 'Pending Verification']),
    "news_verified": len([r for r in reports if r.get('news_verified', False)])
}

@app.route('/')
def home():
    return jsonify({"message": "Disaster Relief Platform API is running!", "endpoints": ["/api/stats", "/api/reports", "/api/report"]})

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get dashboard statistics"""
    print("📊 Stats requested")
    return jsonify(stats)

@app.route('/api/reports', methods=['GET'])
def get_reports():
    """Get all disaster reports"""
    print(f"📋 Reports requested - returning {len(reports)} reports")
    return jsonify(reports)

@app.route('/api/report', methods=['POST', 'OPTIONS'])
def submit_report():
    """Submit a new disaster report with AI analysis"""
    if request.method == 'OPTIONS':
        return '', 200
    
    print("📝 New report submission received")
    
    try:
        # Get form data
        title = request.form.get('title')
        location = request.form.get('location')
        description = request.form.get('description')
        
        print(f"Title: {title}, Location: {location}")
        
        if 'image' not in request.files:
            print("❌ No image provided")
            return jsonify({'error': 'No image provided'}), 400

        image = request.files['image']
        if image.filename == '':
            print("❌ Invalid image filename")
            return jsonify({'error': 'Invalid image'}), 400

        # Save the uploaded image temporarily
        temp_filename = secure_filename(image.filename)
        image.save(temp_filename)
        print(f"💾 Image saved as: {temp_filename}")

        # AI Analysis
        disaster_type = "Unknown"
        confidence = 0.5
        
        if model is not None:
            try:
                image_data = cv2.imread(temp_filename)
                image_data = cv2.cvtColor(image_data, cv2.COLOR_BGR2RGB)
                image_data = cv2.resize(image_data, (64, 64))
                x = np.expand_dims(image_data, axis=0)
                
                predictions = model.predict(x, verbose=0)
                result = np.argmax(predictions, axis=-1)
                index = ['Cyclone', 'Earthquake', 'Flood', 'Wildfire']
                disaster_type = index[result[0]]
                confidence = float(np.max(predictions))
                
                print(f"🤖 AI Analysis: {disaster_type} ({confidence:.2%})")
            except Exception as e:
                print(f"❌ AI Analysis failed: {e}")
                disaster_type = "Analysis Failed"
        else:
            print("⚠️ Model not loaded, using default prediction")
        
        # Create AI result message
        ai_result = f"Disaster Type: {disaster_type}\nConfidence: {confidence:.2%}\nAnalysis: The AI model has classified this image as showing signs of a {disaster_type.lower()}."
        
        # Create new report
        new_report = {
            '_id': len(reports) + 1,
            'title': title,
            'location': location,
            'description': description,
            'disaster_type': disaster_type,
            'source': 'User Report',
            'timestamp': datetime.now().isoformat(),
            'status': 'Verified' if confidence > 0.7 else 'Pending'
        }
        
        # Add to reports list
        reports.append(new_report)
        
        # Update stats
        stats['total_reports'] = len(reports)
        if new_report['status'] == 'Verified':
            stats['verified_emergencies'] += 1
        
        # Clean up temporary file
        try:
            os.remove(temp_filename)
            print(f"🗑️ Cleaned up: {temp_filename}")
        except:
            pass
        
        print(f"✅ Report submitted successfully! ID: {new_report['_id']}")
        
        return jsonify({
            'success': True,
            'ai_result': ai_result,
            'report_id': new_report['_id']
        })
        
    except Exception as e:
        print(f"❌ Error processing report: {e}")
        return jsonify({'error': str(e)}), 500

# News verification function (mock implementation)
def verify_with_news_api(title, location, disaster_type):
    """Mock news verification - in production, use real news API"""
    try:
        # Mock verification logic
        keywords = [disaster_type.lower(), location.split(',')[0].lower()]
        
        # Simulate news API response
        mock_news_data = {
            'flood mumbai': True,
            'earthquake delhi': False,
            'wildfire bangalore': True,
            'cyclone chennai': True
        }
        
        search_key = f"{disaster_type.lower()} {location.split(',')[0].lower()}"
        is_verified = mock_news_data.get(search_key, False)
        
        return {
            'verified': is_verified,
            'confidence': 0.85 if is_verified else 0.3,
            'source': 'News API Mock',
            'articles_found': 3 if is_verified else 0
        }
    except Exception as e:
        return {'verified': False, 'error': str(e)}

# NGO Dashboard endpoints
@app.route('/api/ngo/verified-reports', methods=['GET'])
def get_verified_reports():
    """Get only verified reports for NGO dashboard"""
    verified_reports = [r for r in reports if r['status'] == 'Verified' and r.get('news_verified', False)]
    print(f"📋 NGO Dashboard - returning {len(verified_reports)} verified reports")
    return jsonify(verified_reports)

@app.route('/api/ngo/take-action', methods=['POST'])
def take_ngo_action():
    """NGO takes action on a disaster report"""
    try:
        data = request.get_json()
        report_id = data.get('report_id')
        action_type = data.get('action_type')
        resources = data.get('resources', [])
        ngo_name = data.get('ngo_name', 'Anonymous NGO')
        
        # Find the report
        report = next((r for r in reports if r['_id'] == report_id), None)
        if not report:
            return jsonify({'error': 'Report not found'}), 404
        
        # Create action record
        action = {
            'id': len(ngo_actions) + 1,
            'report_id': report_id,
            'ngo_name': ngo_name,
            'action_type': action_type,
            'resources': resources,
            'timestamp': datetime.now().isoformat(),
            'status': 'Active',
            'location': report['location'],
            'disaster_type': report['disaster_type']
        }
        
        ngo_actions.append(action)
        
        # Update report status
        report['ngo_response'] = True
        report['response_actions'] = report.get('response_actions', []) + [action['id']]
        
        print(f"✅ NGO Action taken: {action_type} for report {report_id}")
        
        return jsonify({
            'success': True,
            'action_id': action['id'],
            'message': f'Action "{action_type}" initiated successfully'
        })
        
    except Exception as e:
        print(f"❌ Error taking NGO action: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/ngo/actions', methods=['GET'])
def get_ngo_actions():
    """Get all NGO actions"""
    return jsonify(ngo_actions)

@app.route('/api/verify-report/<int:report_id>', methods=['POST'])
def verify_report_with_news(report_id):
    """Verify a report using news API"""
    try:
        report = next((r for r in reports if r['_id'] == report_id), None)
        if not report:
            return jsonify({'error': 'Report not found'}), 404
        
        # Verify with news API
        verification_result = verify_with_news_api(
            report['title'], 
            report['location'], 
            report['disaster_type']
        )
        
        # Update report based on verification
        if verification_result['verified']:
            report['status'] = 'Verified'
            report['news_verified'] = True
            report['verification_confidence'] = verification_result['confidence']
        else:
            report['status'] = 'Unverified'
            report['news_verified'] = False
        
        # Update stats
        stats['verified_emergencies'] = len([r for r in reports if r['status'] == 'Verified'])
        stats['news_verified'] = len([r for r in reports if r.get('news_verified', False)])
        stats['pending_verification'] = len([r for r in reports if r['status'] == 'Pending Verification'])
        
        print(f"🔍 Report {report_id} verification: {verification_result['verified']}")
        
        return jsonify({
            'success': True,
            'verification_result': verification_result,
            'updated_status': report['status']
        })
        
    except Exception as e:
        print(f"❌ Error verifying report: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 Starting Disaster Relief Platform API...")
    print("📍 Available endpoints:")
    print("   GET  /api/stats   - Dashboard statistics")
    print("   GET  /api/reports - All reports")
    print("   POST /api/report  - Submit new report")
    port = int(os.environ.get('PORT', 5000))
    print(f"🌐 Server will run on: http://0.0.0.0:{port}")
    app.run(debug=False, host='0.0.0.0', port=port)