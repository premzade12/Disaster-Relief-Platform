from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
from keras.models import load_model
from werkzeug.utils import secure_filename
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Loading the model
model = load_model(r"C:\Users\HP\OneDrive\Desktop\DisaterAssesment\Flask\disaster.h5")
print("Loaded model from disk")

# Simple in-memory storage
reports = [
    {
        '_id': 1,
        'title': 'Test Report',
        'location': 'Test Location',
        'disaster_type': 'Flood',
        'source': 'User Report',
        'timestamp': datetime.now().isoformat(),
        'status': 'Verified'
    }
]

@app.route('/api/stats', methods=['GET'])
def get_stats():
    return jsonify({
        "total_reports": len(reports),
        "verified_emergencies": 1,
        "active_ngos": 3
    })

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
        temp_filename = secure_filename(image.filename)
        image.save(temp_filename)

        # AI Analysis
        image_data = cv2.imread(temp_filename)
        image_data = cv2.cvtColor(image_data, cv2.COLOR_BGR2RGB)
        image_data = cv2.resize(image_data, (64, 64))
        x = np.expand_dims(image_data, axis=0)
        result = np.argmax(model.predict(x), axis=-1)
        index = ['Cyclone', 'Earthquake', 'Flood', 'Wildfire']
        disaster_type = index[result[0]]
        
        ai_result = f"Disaster Type: {disaster_type}\nAnalysis Complete!"
        
        new_report = {
            '_id': len(reports) + 1,
            'title': title,
            'location': location,
            'disaster_type': disaster_type,
            'source': 'User Report',
            'timestamp': datetime.now().isoformat(),
            'status': 'Verified'
        }
        
        reports.append(new_report)
        os.remove(temp_filename)
        
        return jsonify({
            'success': True,
            'ai_result': ai_result,
            'report_id': new_report['_id']
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)