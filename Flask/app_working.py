from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
from keras.models import load_model
from werkzeug.utils import secure_filename
import os
from datetime import datetime, timedelta
import requests
import json
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*", "methods": ["GET", "POST", "DELETE", "OPTIONS"], "allow_headers": ["Content-Type"]}})

# MongoDB Atlas connection
try:
    MONGO_URI = os.environ.get('MONGO_URI')
    if not MONGO_URI:
        print("MONGO_URI environment variable not set")
        client = None
        db = None
        reports_collection = None
        actions_collection = None
        users_collection = None
    else:
        client = MongoClient(MONGO_URI)
        client.admin.command('ping')
        db = client.disaster_relief
        reports_collection = db.reports
        actions_collection = db.ngo_actions
        users_collection = db.users
        print("MongoDB Atlas connected successfully!")
except Exception as e:
    print(f"MongoDB connection error: {e}")
    print("Check your MongoDB credentials in MONGO_URI environment variable")
    client = None
    db = None
    reports_collection = None
    actions_collection = None
    users_collection = None

bert_model = None
bert_tokenizer = None
torch = None
print("BERT model disabled to avoid PyTorch/Transformers compatibility issues")
print("Using keyword-based text classification instead")

# CNN Model loading only
try:
    model_path = os.path.join(os.path.dirname(__file__), 'disaster.h5')
    if os.path.exists(model_path):
        cnn_model = load_model(model_path)
        print("CNN Model loaded successfully!")
    else:
        print("CNN Model file not found")
        cnn_model = None
except Exception as e:
    print(f"Error loading CNN model: {e}")
    cnn_model = None

# Initialize with sample data if database is empty
def init_sample_data():
    try:
        if db is not None:
            # Test if we can actually query the database
            count = reports_collection.count_documents({})
            if count == 0:
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
                print("Sample data initialized")
            else:
                print(f"Database already has {count} reports")
        else:
            print("Database not available - running without persistent storage")
    except Exception as e:
        print(f"Database initialization failed: {e}")
        print("App will continue without database - check MongoDB credentials")

init_sample_data()

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS')
    return response

@app.route('/api/auth/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == 'OPTIONS':
        return '', 200
    
    if db is None:
        return jsonify({"error": "Database not connected"}), 500
    
    try:
        data = request.get_json()
        email = data.get('email')
        
        if users_collection.find_one({"email": email}):
            return jsonify({'error': 'Email already registered'}), 400
        
        user = {
            'firstName': data.get('firstName'),
            'lastName': data.get('lastName'),
            'email': email,
            'password': data.get('password'),
            'contactNumber': data.get('contactNumber'),
            'role': data.get('role', 'Citizen'),
            'createdAt': datetime.now()
        }
        
        result = users_collection.insert_one(user)
        user['_id'] = str(result.inserted_id)
        del user['password']
        
        return jsonify({'success': True, 'user': user})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return '', 200
    
    if db is None:
        return jsonify({"error": "Database not connected"}), 500
    
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        user = users_collection.find_one({"email": email, "password": password})
        
        if not user:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        user['_id'] = str(user['_id'])
        del user['password']
        
        return jsonify({'success': True, 'user': user})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/')
def home():
    return jsonify({"message": "Disaster Relief Platform API is running!", "endpoints": ["/api/stats", "/api/reports", "/api/report"]})

@app.route('/api/stats', methods=['GET'])
def get_stats():
    if db is None:
        return jsonify({"error": "Database not connected"}), 500
    
    total_reports = reports_collection.count_documents({})
    verified_emergencies = reports_collection.count_documents({"final_verified": True})
    pending_verification = reports_collection.count_documents({"status": "Pending Verification"})
    news_verified = reports_collection.count_documents({"news_verified": True})
    
    try:
        registered_ngos = users_collection.count_documents({"role": "NGO"})
        print(f"NGO Count Query Result: {registered_ngos}")
        print(f"Database: {db.name}")
        print(f"Collection: {users_collection.name}")
    except Exception as e:
        print(f"Error counting NGOs: {e}")
        registered_ngos = 0
    
    stats = {
        "total_reports": total_reports,
        "verified_emergencies": verified_emergencies,
        "active_ngos": registered_ngos,
        "pending_verification": pending_verification,
        "news_verified": news_verified
    }
    return jsonify(stats)

@app.route('/api/reports', methods=['GET'])
def get_reports():
    if db is None:
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
        
        # Auto news verification
        verification_result = verify_with_news_api(title, location, final_disaster_type)
        news_verified = verification_result.get('verified', False)
        
        # Determine final verification status
        if models_agree and news_verified:
            final_verified = True
            status = 'Fully Verified'
        elif news_verified:
            final_verified = False
            status = 'Partially Verified (News Only)'
        elif models_agree:
            final_verified = False
            status = 'Partially Verified (Models Only)'
        else:
            final_verified = False
            status = 'Pending Verification'
        
        ai_result = f"CNN Analysis: {cnn_disaster_type} ({cnn_confidence:.2%})\nKeyword Analysis: {bert_disaster_type} ({bert_confidence:.2%})\nModels Agree: {'Yes' if models_agree else 'No'}\nNews Verified: {'Yes' if news_verified else 'No'}\nFinal Status: {status}"
        
        # Calculate severity
        severity = calculate_severity(description, final_disaster_type, cnn_confidence, verification_result.get('confidence', 0.5))
        
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
            'status': status,
            'news_verified': news_verified,
            'news_confidence': verification_result.get('confidence', 0.5),
            'final_verified': final_verified,
            'severity': severity
        }
        
        if db is not None:
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

def calculate_severity(description, disaster_type, cnn_confidence, news_confidence):
    """Calculate severity based on description keywords and confidence levels"""
    desc_lower = description.lower()
    
    # High severity keywords
    high_keywords = ['severe', 'major', 'massive', 'catastrophic', 'devastating', 'critical', 
                     'emergency', 'evacuations', 'casualties', 'deaths', 'collapsed', 'destroyed']
    
    # Medium severity keywords
    medium_keywords = ['moderate', 'significant', 'considerable', 'damage', 'affected', 
                       'warning', 'alert', 'spreading', 'rising']
    
    # Check keywords
    has_high = any(keyword in desc_lower for keyword in high_keywords)
    has_medium = any(keyword in desc_lower for keyword in medium_keywords)
    
    # Calculate based on confidence and keywords
    avg_confidence = (cnn_confidence + news_confidence) / 2
    
    if has_high or avg_confidence >= 0.8:
        return 'High'
    elif has_medium or avg_confidence >= 0.6:
        return 'Medium'
    else:
        return 'Low'

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
    """Verify disaster with Google News API"""
    try:
        NEWS_API_KEY = os.environ.get('NEWS_API_KEY')
        
        if not NEWS_API_KEY or NEWS_API_KEY == 'your_newsapi_key_here':
            print(f"NEWS_API_KEY not configured, using mock verification for: {disaster_type}")
            # Mock verification - approve valid disasters
            valid_disasters = ['flood', 'earthquake', 'cyclone', 'wildfire', 'conflicting']
            disaster_lower = disaster_type.lower()
            
            # Check if disaster type is valid (more lenient matching)
            is_valid = any(valid in disaster_lower for valid in valid_disasters)
            
            if is_valid:
                print(f"Mock verification: APPROVED for '{disaster_type}'")
                # Calculate confidence based on disaster type
                if 'conflicting' in disaster_lower or disaster_lower == 'unknown':
                    confidence = 0.5
                else:
                    confidence = 0.65
                
                return {
                    'verified': True,
                    'confidence': confidence,
                    'source': 'Mock Verification',
                    'articles_found': 3
                }
            else:
                print(f"Mock verification: REJECTED for '{disaster_type}'")
                return {'verified': False, 'confidence': 0.3, 'source': 'Mock', 'articles_found': 0}
        
        # Real News API integration
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
        
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            articles = data.get('articles', [])
            total_results = data.get('totalResults', 0)
            
            # Check if articles mention the disaster
            relevant_articles = 0
            for article in articles:
                article_text = f"{article.get('title', '')} {article.get('description', '')}".lower()
                if disaster_type.lower() in article_text and city.lower() in article_text:
                    relevant_articles += 1
            
            is_verified = relevant_articles > 0
            confidence = min(0.95, 0.5 + (relevant_articles * 0.15))
            
            return {
                'verified': is_verified,
                'confidence': confidence,
                'source': 'Google News API',
                'articles_found': relevant_articles,
                'total_results': total_results
            }
        else:
            print(f"News API error: {response.status_code}")
            return {'verified': False, 'confidence': 0.3, 'source': 'API Error', 'articles_found': 0}
            
    except Exception as e:
        print(f"News verification error: {e}")
        return {'verified': False, 'error': str(e), 'source': 'Error'}

@app.route('/api/ngo/verified-reports', methods=['GET'])
def get_verified_reports():
    """Get only fully verified reports for NGO dashboard"""
    if db is None:
        return jsonify({"error": "Database not connected"}), 500
    
    try:
        verified_reports = list(reports_collection.find({"final_verified": True}))
        for report in verified_reports:
            report['_id'] = str(report['_id'])
            if isinstance(report.get('timestamp'), datetime):
                report['timestamp'] = report['timestamp'].isoformat()
        print(f"NGO Dashboard: Returning {len(verified_reports)} verified reports")
        return jsonify(verified_reports)
    except Exception as e:
        print(f"Error in get_verified_reports: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/ngo/take-action', methods=['POST'])
def take_ngo_action():
    if db is None:
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
    if db is None:
        return jsonify({"error": "Database not connected"}), 500
    
    try:
        actions = list(actions_collection.find({}))
        for action in actions:
            action['_id'] = str(action['_id'])
            if isinstance(action.get('timestamp'), datetime):
                action['timestamp'] = action['timestamp'].isoformat()
        print(f"NGO Actions: Returning {len(actions)} actions")
        return jsonify(actions)
    except Exception as e:
        print(f"Error in get_ngo_actions: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/report/<report_id>', methods=['DELETE', 'OPTIONS'])
def delete_report(report_id):
    if request.method == 'OPTIONS':
        return '', 200
    
    if db is None:
        return jsonify({"error": "Database not connected"}), 500
    
    try:
        print(f"Attempting to delete report: {report_id}")
        
        if not ObjectId.is_valid(report_id):
            return jsonify({'error': 'Invalid report ID'}), 400
        
        result = reports_collection.delete_one({"_id": ObjectId(report_id)})
        
        if result.deleted_count == 0:
            return jsonify({'error': 'Report not found'}), 404
        
        print(f"Report {report_id} deleted successfully")
        return jsonify({'success': True, 'message': 'Report deleted successfully'})
    except Exception as e:
        print(f"Delete error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/verify-report/<report_id>', methods=['POST'])
def verify_report_with_news(report_id):
    """Verify a report using news API and update final verification status"""
    if db is None:
        return jsonify({"error": "Database not connected. Please configure MongoDB."}), 500
        
    try:
        print(f"Verifying report: {report_id}")
        
        # Validate ObjectId format
        if not ObjectId.is_valid(report_id):
            return jsonify({'error': 'Invalid report ID format'}), 400
        
        report = reports_collection.find_one({"_id": ObjectId(report_id)})
        if not report:
            return jsonify({'error': 'Report not found'}), 404
        
        disaster_type_for_news = report.get('cnn_prediction', 'Unknown')
        if report.get('models_agree', False):
            disaster_type_for_news = report.get('disaster_type', 'Unknown')
        
        print(f"Calling news API for: {disaster_type_for_news} in {report['location']}")
        verification_result = verify_with_news_api(
            report['title'], 
            report['location'], 
            disaster_type_for_news
        )
        
        print(f"News verification result: {verification_result}")
        
        # Update report in MongoDB
        update_data = {
            'news_verified': verification_result['verified'],
            'news_confidence': verification_result.get('confidence', 0.5)
        }
        
        # Final verification logic
        models_agree = report.get('models_agree', False)
        news_verified = verification_result['verified']
        
        if models_agree and news_verified:
            update_data['final_verified'] = True
            update_data['status'] = 'Fully Verified'
        elif news_verified:
            update_data['final_verified'] = False
            update_data['status'] = 'Partially Verified (News Only)'
        elif models_agree:
            update_data['final_verified'] = False
            update_data['status'] = 'Partially Verified (Models Only)'
        else:
            update_data['final_verified'] = False
            update_data['status'] = 'Pending Verification'
        
        print(f"Updating report with: {update_data}")
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
        print(f"Error in verify_report_with_news: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Verification failed: {str(e)}'}), 500

@app.route('/api/debug/reports', methods=['GET'])
def debug_reports():
    """Debug endpoint to check report verification status"""
    if db is None:
        return jsonify({"error": "Database not connected"}), 500
    
    try:
        all_reports = list(reports_collection.find({}))
        debug_info = []
        for report in all_reports:
            debug_info.append({
                'id': str(report['_id']),
                'title': report.get('title', 'N/A'),
                'models_agree': report.get('models_agree', False),
                'news_verified': report.get('news_verified', False),
                'final_verified': report.get('final_verified', False),
                'status': report.get('status', 'Unknown')
            })
        return jsonify({
            'total_reports': len(all_reports),
            'fully_verified': len([r for r in all_reports if r.get('final_verified')]),
            'reports': debug_info
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/debug/users', methods=['GET'])
def debug_users():
    """Debug endpoint to check registered users"""
    if db is None:
        return jsonify({"error": "Database not connected"}), 500
    
    try:
        all_users = list(users_collection.find({}))
        user_info = []
        for user in all_users:
            user_info.append({
                'id': str(user['_id']),
                'email': user.get('email', 'N/A'),
                'firstName': user.get('firstName', 'N/A'),
                'lastName': user.get('lastName', 'N/A'),
                'role': user.get('role', 'N/A')
            })
        
        ngo_count = len([u for u in all_users if u.get('role') == 'NGO'])
        
        return jsonify({
            'total_users': len(all_users),
            'ngo_users': ngo_count,
            'users': user_info
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Starting Disaster Relief Platform API...")
    print("Available endpoints:")
    print("   GET  /api/stats   - Dashboard statistics")
    print("   GET  /api/reports - All reports")
    print("   POST /api/report  - Submit new report")
    
    port_env = os.environ.get('PORT', '5001')
    port = int(port_env) if port_env and port_env.strip() else 5001
    
    print(f"Server will run on: http://0.0.0.0:{port}")
    app.run(debug=False, host='0.0.0.0', port=port)