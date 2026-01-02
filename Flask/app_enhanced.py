from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
from keras.models import load_model
from werkzeug.utils import secure_filename
import os
from datetime import datetime
import json

app = Flask(__name__, template_folder="templates")
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Loading the model
model = load_model(r"C:\Users\HP\OneDrive\Desktop\DisaterAssesment\Flask\disaster.h5")
print("Loaded model from disk")

# In-memory storage for demo (in production, use a database)
reports = []
stats = {
    "total_reports": 0,
    "verified_emergencies": 0,
    "active_ngos": 3  # Static for demo
}

# Original routes for HTML templates
@app.route('/', methods=['GET'])
def index():
    return render_template('home.html')

@app.route('/home', methods=['GET'])
def home():
    return render_template('home.html')

@app.route('/intro', methods=['GET'])
def about():
    return render_template('intro.html')

@app.route('/upload', methods=['GET', 'POST'])
def upload():
    return render_template('upload.html')

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'prediction': 'Error: No image provided'})

    image = request.files['image']
    if image.filename == '':
        return jsonify({'prediction': 'Error: Invalid image'})

    # Save the uploaded image to a temporary file
    temp_filename = secure_filename(image.filename)
    image.save(temp_filename)

    # Read the image using OpenCV
    image = cv2.imread(temp_filename)
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    image = cv2.resize(image, (64, 64))
    x = np.expand_dims(image, axis=0)
    result = np.argmax(model.predict(x), axis=-1)
    index = ['Cyclone', 'Earthquake', 'Flood', 'Wildfire']
    prediction = index[result[0]]

    # Delete the temporary file
    os.remove(temp_filename)

    return jsonify({'prediction': prediction})

# New API routes for React frontend
@app.route('/api/reports', methods=['GET'])
def get_reports():
    """Get all disaster reports for the dashboard"""
    return jsonify(reports)

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get dashboard statistics"""
    return jsonify(stats)

@app.route('/api/report', methods=['POST'])
def submit_report():
    """Submit a new disaster report with AI analysis"""
    try:
        # Get form data
        title = request.form.get('title')
        location = request.form.get('location')
        description = request.form.get('description')
        
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400

        image = request.files['image']
        if image.filename == '':
            return jsonify({'error': 'Invalid image'}), 400

        # Save the uploaded image to a temporary file
        temp_filename = secure_filename(image.filename)
        image.save(temp_filename)

        # AI Analysis using the model
        image_data = cv2.imread(temp_filename)
        image_data = cv2.cvtColor(image_data, cv2.COLOR_BGR2RGB)
        image_data = cv2.resize(image_data, (64, 64))
        x = np.expand_dims(image_data, axis=0)
        result = np.argmax(model.predict(x), axis=-1)
        index = ['Cyclone', 'Earthquake', 'Flood', 'Wildfire']
        disaster_type = index[result[0]]
        
        # Get prediction confidence
        predictions = model.predict(x)[0]
        confidence = float(np.max(predictions))
        
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
            'status': 'Verified' if confidence > 0.7 else 'Pending',
            'confidence': confidence
        }
        
        # Add to reports list
        reports.append(new_report)
        
        # Update stats
        stats['total_reports'] = len(reports)
        if new_report['status'] == 'Verified':
            stats['verified_emergencies'] += 1
        
        # Delete the temporary file
        os.remove(temp_filename)
        
        return jsonify({
            'success': True,
            'ai_result': ai_result,
            'report_id': new_report['_id']
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Add some sample data for demo
def initialize_sample_data():
    """Add some sample reports for demonstration"""
    sample_reports = [
        {
            '_id': 1,
            'title': 'Heavy Flooding in Downtown Area',
            'location': 'Mumbai, Maharashtra',
            'description': 'Severe flooding reported in commercial district',
            'disaster_type': 'Flood',
            'source': 'Google News',
            'timestamp': datetime.now().isoformat(),
            'status': 'Verified'
        },
        {
            '_id': 2,
            'title': 'Earthquake Tremors Felt',
            'location': 'Delhi, India',
            'description': 'Mild earthquake tremors reported by residents',
            'disaster_type': 'Earthquake',
            'source': 'User Report',
            'timestamp': datetime.now().isoformat(),
            'status': 'Pending'
        }
    ]
    
    reports.extend(sample_reports)
    stats['total_reports'] = len(reports)
    stats['verified_emergencies'] = len([r for r in reports if r['status'] == 'Verified'])

# Initialize sample data
initialize_sample_data()

if __name__ == '__main__':
    app.run(debug=True, threaded=True, port=5000)