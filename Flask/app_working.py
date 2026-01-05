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
CORS(app, origins=["*"])

# Disable transformers and PyTorch to avoid compatibility issues
bert_model = None
bert_tokenizer = None
torch = None
print("⚠️ BERT model disabled to avoid PyTorch/Transformers compatibility issues")
print("📝 Using keyword-based text classification instead")

# CNN Model loading only
try:
    model_path = os.path.join(os.path.dirname(__file__), 'disaster.h5')
    if os.path.exists(model_path):
        cnn_model = load_model(model_path)
        print("✅ CNN Model loaded successfully!")
    else:
        print("❌ CNN Model file not found")
        cnn_model = None
except Exception as e:
    print(f"❌ Error loading CNN model: {e}")
    cnn_model = None

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
    return jsonify(stats)

@app.route('/api/reports', methods=['GET'])
def get_reports():
    return jsonify(reports)

@app.route('/api/report', methods=['POST', 'OPTIONS'])
def submit_report():
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        title = request.form.get('title')
        location = request.form.get('location')
        description = request.form.get('description')
        
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400

        image = request.files['image']
        if image.filename == '':
            return jsonify({'error': 'Invalid image'}), 400

        temp_filename = secure_filename(image.filename)
        image.save(temp_filename)

        # CNN Image Analysis
        cnn_disaster_type = "Unknown"
        cnn_confidence = 0.5
        
        if cnn_model is not None:
            try:
                image_data = cv2.imread(temp_filename)
                image_data = cv2.cvtColor(image_data, cv2.COLOR_BGR2RGB)
                image_data = cv2.resize(image_data, (64, 64))
                x = np.expand_dims(image_data, axis=0)
                
                predictions = cnn_model.predict(x, verbose=0)
                result = np.argmax(predictions, axis=-1)
                index = ['Cyclone', 'Earthquake', 'Flood', 'Wildfire']
                cnn_disaster_type = index[result[0]]
                cnn_confidence = float(np.max(predictions))
            except Exception as e:
                cnn_disaster_type = "Analysis Failed"
        
        # BERT Text Analysis
        bert_result = classify_text_with_bert(title, description)
        bert_disaster_type = bert_result['disaster_type']
        bert_confidence = bert_result['confidence']
        
        # Multi-model consensus
        models_agree = cnn_disaster_type.lower() == bert_disaster_type.lower()
        final_disaster_type = cnn_disaster_type if models_agree else "Conflicting"
        
        ai_result = f"CNN Analysis: {cnn_disaster_type} ({cnn_confidence:.2%})\nKeyword Analysis: {bert_disaster_type} ({bert_confidence:.2%})\nModels Agree: {'Yes' if models_agree else 'No'}\nFinal Classification: {final_disaster_type}"
        
        new_report = {
            '_id': len(reports) + 1,
            'title': title,
            'location': location,
            'description': description,
            'cnn_prediction': cnn_disaster_type,
            'cnn_confidence': cnn_confidence,
            'bert_prediction': bert_disaster_type,
            'bert_confidence': bert_confidence,
            'models_agree': models_agree,
            'disaster_type': final_disaster_type,
            'source': 'User Report',
            'timestamp': datetime.now().isoformat(),
            'status': 'Pending Verification',
            'news_verified': False,
            'final_verified': False
        }
        
        reports.append(new_report)
        stats['total_reports'] = len(reports)
        stats['pending_verification'] = len([r for r in reports if r['status'] == 'Pending Verification'])
        
        try:
            os.remove(temp_filename)
        except:
            pass
        
        return jsonify({
            'success': True,
            'ai_result': ai_result,
            'report_id': new_report['_id']
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def classify_text_with_bert(title, description):
    """Classify disaster type from title and description using keyword matching"""
    return classify_text_fallback(title, description)

def classify_text_fallback(title, description):
    """Keyword-based text classification"""
    text = f"{title} {description}".lower()
    
    # Keyword-based classification
    if any(word in text for word in ['flood', 'water', 'submerged', 'inundated', 'overflow']):
        return {'disaster_type': 'Flood', 'confidence': 0.75, 'method': 'Keyword'}
    elif any(word in text for word in ['earthquake', 'tremor', 'seismic', 'quake', 'shake']):
        return {'disaster_type': 'Earthquake', 'confidence': 0.75, 'method': 'Keyword'}
    elif any(word in text for word in ['cyclone', 'hurricane', 'storm', 'typhoon', 'wind']):
        return {'disaster_type': 'Cyclone', 'confidence': 0.75, 'method': 'Keyword'}
    elif any(word in text for word in ['fire', 'wildfire', 'burn', 'smoke', 'flame']):
        return {'disaster_type': 'Wildfire', 'confidence': 0.75, 'method': 'Keyword'}
    else:
        return {'disaster_type': 'Unknown', 'confidence': 0.5, 'method': 'Keyword'}

def verify_with_news_api(title, location, disaster_type):
    """Mock news verification - in production, use real news API"""
    try:
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

@app.route('/api/ngo/verified-reports', methods=['GET'])
def get_verified_reports():
    """Get only fully verified reports (CNN + BERT + News) for NGO dashboard"""
    verified_reports = [r for r in reports if r.get('final_verified', False)]
    return jsonify(verified_reports)

@app.route('/api/ngo/take-action', methods=['POST'])
def take_ngo_action():
    try:
        data = request.get_json()
        report_id = data.get('report_id')
        action_type = data.get('action_type')
        resources = data.get('resources', [])
        ngo_name = data.get('ngo_name', 'Anonymous NGO')
        
        report = next((r for r in reports if r['_id'] == report_id), None)
        if not report:
            return jsonify({'error': 'Report not found'}), 404
        
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
        report['ngo_response'] = True
        report['response_actions'] = report.get('response_actions', []) + [action['id']]
        
        return jsonify({
            'success': True,
            'action_id': action['id'],
            'message': f'Action "{action_type}" initiated successfully'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/ngo/actions', methods=['GET'])
def get_ngo_actions():
    return jsonify(ngo_actions)

@app.route('/api/verify-report/<int:report_id>', methods=['POST'])
def verify_report_with_news(report_id):
    """Verify a report using news API and update final verification status"""
    try:
        report = next((r for r in reports if r['_id'] == report_id), None)
        if not report:
            return jsonify({'error': 'Report not found'}), 404
        
        # Use the disaster type from model consensus for news verification
        disaster_type_for_news = report.get('cnn_prediction', 'Unknown')
        if report.get('models_agree', False):
            disaster_type_for_news = report.get('disaster_type', 'Unknown')
        
        verification_result = verify_with_news_api(
            report['title'], 
            report['location'], 
            disaster_type_for_news
        )
        
        # Update news verification status
        report['news_verified'] = verification_result['verified']
        report['news_confidence'] = verification_result['confidence']
        
        # Final verification: CNN + BERT agree + News verified
        if (report.get('models_agree', False) and 
            report.get('news_verified', False) and 
            report.get('cnn_confidence', 0) > 0.6 and 
            report.get('bert_confidence', 0) > 0.6):
            report['final_verified'] = True
            report['status'] = 'Fully Verified'
        else:
            report['final_verified'] = False
            report['status'] = 'Partially Verified' if report.get('news_verified', False) else 'Unverified'
        
        # Update stats
        stats['verified_emergencies'] = len([r for r in reports if r.get('final_verified', False)])
        stats['news_verified'] = len([r for r in reports if r.get('news_verified', False)])
        stats['pending_verification'] = len([r for r in reports if r['status'] == 'Pending Verification'])
        
        return jsonify({
            'success': True,
            'verification_result': verification_result,
            'models_agree': report.get('models_agree', False),
            'final_verified': report.get('final_verified', False),
            'updated_status': report['status']
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Starting Disaster Relief Platform API...")
    print("Available endpoints:")
    print("   GET  /api/stats   - Dashboard statistics")
    print("   GET  /api/reports - All reports")
    print("   POST /api/report  - Submit new report")
    
    port_env = os.environ.get('PORT', '5000')
    port = int(port_env) if port_env and port_env.strip() else 5000
    
    print(f"Server will run on: http://0.0.0.0:{port}")
    app.run(debug=False, host='0.0.0.0', port=port)