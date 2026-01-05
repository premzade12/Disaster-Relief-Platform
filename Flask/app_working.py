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
from pymongo import MongoClient
from bson import ObjectId

app = Flask(__name__)
CORS(app, origins=["*"])

# MongoDB Atlas connection
try:
    MONGO_URI = os.environ.get('MONGO_URI')
    if not MONGO_URI:
        print("❌ MONGO_URI environment variable not set")
        client = None
        db = None
    else:
        client = MongoClient(MONGO_URI)
        db = client.disaster_relief
        reports_collection = db.reports
        actions_collection = db.ngo_actions
        print("✅ MongoDB Atlas connected successfully!")
except Exception as e:
    print(f"❌ MongoDB connection error: {e}")
    client = None
    db = None

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

# Initialize with sample data if database is empty
def init_sample_data():
    if db and reports_collection.count_documents({}) == 0:
        sample_reports = [
            {
                'title': 'Heavy Flooding in Downtown Area',
                'location': 'Mumbai, Maharashtra',
                'description': 'Severe flooding reported in commercial district',
                'disaster_type': 'Flood',
                'source': 'User Report',
                'timestamp': datetime.now(),
                'status': 'Verified',
                'coordinates': {'lat': 19.0760, 'lng': 72.8777},
                'news_verified': True,
                'final_verified': True,
                'severity': 'High'
            },
            {
                'title': 'Earthquake Tremors Felt',
                'location': 'Delhi, India',
                'description': 'Mild earthquake tremors reported by residents',
                'disaster_type': 'Earthquake',
                'source': 'User Report',
                'timestamp': datetime.now(),
                'status': 'Pending Verification',
                'coordinates': {'lat': 28.7041, 'lng': 77.1025},
                'news_verified': False,
                'final_verified': False,
                'severity': 'Medium'
            }
        ]
        reports_collection.insert_many(sample_reports)
        print("✅ Sample data initialized")

init_sample_data()

@app.route('/')
def home():
    return jsonify({"message": "Disaster Relief Platform API is running!", "endpoints": ["/api/stats", "/api/reports", "/api/report"]})

@app.route('/api/stats', methods=['GET'])
def get_stats():
    if not db:
        return jsonify({"error": "Database not connected"}), 500
    
    total_reports = reports_collection.count_documents({})
    verified_emergencies = reports_collection.count_documents({"final_verified": True})
    pending_verification = reports_collection.count_documents({"status": "Pending Verification"})
    news_verified = reports_collection.count_documents({"news_verified": True})
    
    stats = {
        "total_reports": total_reports,
        "verified_emergencies": verified_emergencies,
        "active_ngos": 3,
        "pending_verification": pending_verification,
        "news_verified": news_verified
    }
    return jsonify(stats)

@app.route('/api/reports', methods=['GET'])
def get_reports():
    if not db:
        return jsonify({"error": "Database not connected"}), 500
    
    reports = list(reports_collection.find({}))
    for report in reports:
        report['_id'] = str(report['_id'])
        if isinstance(report.get('timestamp'), datetime):
            report['timestamp'] = report['timestamp'].isoformat()
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
            'timestamp': datetime.now(),
            'status': 'Pending Verification',
            'news_verified': False,
            'final_verified': False
        }
        
        if db:
            result = reports_collection.insert_one(new_report)
            report_id = str(result.inserted_id)
        else:
            report_id = "no_db"
        
        try:
            os.remove(temp_filename)
        except:
            pass
        
        return jsonify({
            'success': True,
            'ai_result': ai_result,
            'report_id': report_id
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
    """Get only fully verified reports for NGO dashboard"""
    if not db:
        return jsonify({"error": "Database not connected"}), 500
    
    verified_reports = list(reports_collection.find({"final_verified": True}))
    for report in verified_reports:
        report['_id'] = str(report['_id'])
        if isinstance(report.get('timestamp'), datetime):
            report['timestamp'] = report['timestamp'].isoformat()
    return jsonify(verified_reports)

@app.route('/api/ngo/take-action', methods=['POST'])
def take_ngo_action():
    if not db:
        return jsonify({"error": "Database not connected"}), 500
        
    try:
        data = request.get_json()
        report_id = data.get('report_id')
        action_type = data.get('action_type')
        resources = data.get('resources', [])
        ngo_name = data.get('ngo_name', 'Anonymous NGO')
        
        report = reports_collection.find_one({"_id": ObjectId(report_id)})
        if not report:
            return jsonify({'error': 'Report not found'}), 404
        
        action = {
            'report_id': report_id,
            'ngo_name': ngo_name,
            'action_type': action_type,
            'resources': resources,
            'timestamp': datetime.now(),
            'status': 'Active',
            'location': report['location'],
            'disaster_type': report['disaster_type']
        }
        
        result = actions_collection.insert_one(action)
        action_id = str(result.inserted_id)
        
        reports_collection.update_one(
            {"_id": ObjectId(report_id)},
            {"$set": {"ngo_response": True}}
        )
        
        return jsonify({
            'success': True,
            'action_id': action_id,
            'message': f'Action "{action_type}" initiated successfully'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/ngo/actions', methods=['GET'])
def get_ngo_actions():
    if not db:
        return jsonify({"error": "Database not connected"}), 500
    
    actions = list(actions_collection.find({}))
    for action in actions:
        action['_id'] = str(action['_id'])
        if isinstance(action.get('timestamp'), datetime):
            action['timestamp'] = action['timestamp'].isoformat()
    return jsonify(actions)

@app.route('/api/verify-report/<report_id>', methods=['POST'])
def verify_report_with_news(report_id):
    """Verify a report using news API and update final verification status"""
    if not db:
        return jsonify({"error": "Database not connected"}), 500
        
    try:
        report = reports_collection.find_one({"_id": ObjectId(report_id)})
        if not report:
            return jsonify({'error': 'Report not found'}), 404
        
        disaster_type_for_news = report.get('cnn_prediction', 'Unknown')
        if report.get('models_agree', False):
            disaster_type_for_news = report.get('disaster_type', 'Unknown')
        
        verification_result = verify_with_news_api(
            report['title'], 
            report['location'], 
            disaster_type_for_news
        )
        
        # Update report in MongoDB
        update_data = {
            'news_verified': verification_result['verified'],
            'news_confidence': verification_result['confidence']
        }
        
        # Final verification logic
        if (report.get('models_agree', False) and 
            verification_result['verified'] and 
            report.get('cnn_confidence', 0) > 0.6 and 
            report.get('bert_confidence', 0) > 0.6):
            update_data['final_verified'] = True
            update_data['status'] = 'Fully Verified'
        else:
            update_data['final_verified'] = False
            update_data['status'] = 'Partially Verified' if verification_result['verified'] else 'Unverified'
        
        reports_collection.update_one(
            {"_id": ObjectId(report_id)},
            {"$set": update_data}
        )
        
        return jsonify({
            'success': True,
            'verification_result': verification_result,
            'models_agree': report.get('models_agree', False),
            'final_verified': update_data.get('final_verified', False),
            'updated_status': update_data['status']
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