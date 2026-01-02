# Disaster Assessment System

A full-stack web application for real-time disaster monitoring and reporting with AI-powered image analysis.

## 🚀 Features

- **Real-time Dashboard**: Live monitoring of disaster reports and statistics
- **AI Image Analysis**: Automatic disaster type classification using deep learning
- **User Reporting**: Easy-to-use form for submitting disaster reports
- **Live Camera Capture**: Take photos directly from device camera or upload files
- **Interactive Map**: Visual representation of disaster locations with real-time updates
- **Live Updates**: Dashboard refreshes every 5 seconds
- **Responsive Design**: Modern UI with Tailwind CSS

## 🏗️ Architecture

- **Frontend**: React.js with Tailwind CSS
- **Backend**: Flask with TensorFlow/Keras
- **AI Model**: CNN for disaster image classification (Cyclone, Earthquake, Flood, Wildfire)

## 📁 Project Structure

```
DisaterAssesment/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ClientDashboard.js
│   │   │   └── UserPortal.js
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   └── package.json
├── Flask/                  # Flask backend
│   ├── templates/          # HTML templates (legacy)
│   ├── app.py             # Original Flask app
│   ├── app_enhanced.py    # Enhanced Flask app with API
│   ├── disaster.h5        # AI model
│   └── requirements.txt
├── dataset/               # Training data
└── Model Building/        # Jupyter notebooks
```

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)
1. Double-click `start_system.bat` to automatically install dependencies and start both servers

### Option 2: Manual Setup

#### Backend Setup
```bash
cd Flask
pip install -r requirements.txt
python app_enhanced.py
```

#### Frontend Setup
```bash
cd client
npm install
npm start
```

## 🌐 Access Points

- **React Frontend**: http://localhost:3000
- **Flask Backend**: http://localhost:5000
- **API Endpoints**:
  - `GET /api/reports` - Get all reports
  - `GET /api/stats` - Get statistics
  - `POST /api/report` - Submit new report

## 📱 Usage

### Dashboard View
- View real-time statistics (total reports, verified emergencies, active NGOs)
- Monitor live feed of disaster reports
- See AI classification results

### Map View
- Interactive map showing disaster locations
- Click on markers to see detailed information
- Color-coded disaster types with legend
- Real-time updates with pulsing animations for recent reports

### Report Submission
1. Navigate to "Report Incident"
2. Fill in title, location, and description
3. Choose to either:
   - **📷 Use Camera**: Capture photo directly from device camera
   - **📁 Upload File**: Select existing image from device
4. Submit and receive instant AI feedback

## 🤖 AI Model

The system uses a Convolutional Neural Network trained to classify disaster images into:
- **Cyclone**: Tropical storms and hurricanes
- **Earthquake**: Seismic damage and destruction
- **Flood**: Water-related disasters
- **Wildfire**: Fire-related emergencies

## 🔧 API Documentation

### GET /api/reports
Returns array of all disaster reports
```json
[
  {
    "_id": 1,
    "title": "Heavy Flooding",
    "location": "Mumbai",
    "disaster_type": "Flood",
    "status": "Verified",
    "timestamp": "2024-01-01T12:00:00"
  }
]
```

### GET /api/stats
Returns dashboard statistics
```json
{
  "total_reports": 10,
  "verified_emergencies": 7,
  "active_ngos": 3
}
```

### POST /api/report
Submit new disaster report with image
- **Form Data**: title, location, description, image (file)
- **Returns**: AI analysis result and report ID

## 🛠️ Development

### Adding New Features
1. **Frontend**: Add components in `client/src/components/`
2. **Backend**: Add routes in `Flask/app_enhanced.py`
3. **Styling**: Use Tailwind CSS classes

### Model Training
- Training data is in `dataset/` folder
- Jupyter notebook in `Model Building/` folder
- Model saved as `disaster.h5`

## 📋 Requirements

### Backend
- Python 3.8+
- Flask 2.3.3
- TensorFlow 2.13.0
- OpenCV 4.8.1
- NumPy 1.24.3

### Frontend
- Node.js 16+
- React 18.2.0
- Axios 1.6.0
- Tailwind CSS (via CDN)

## 🚨 Troubleshooting

### Common Issues
1. **Port conflicts**: Change ports in package.json (React) or app_enhanced.py (Flask)
2. **Model loading errors**: Ensure disaster.h5 is in Flask/ directory
3. **CORS errors**: flask-cors is installed and configured
4. **Image upload fails**: Check file permissions and temp directory access

### Error Messages
- "Backend not running": Start Flask server first
- "No image provided": Ensure image is selected before submission
- "Model prediction failed": Check image format (JPG, PNG supported)

## 📄 License

This project is for educational purposes. Feel free to modify and distribute.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📞 Support

For issues and questions:
1. Check troubleshooting section
2. Review console logs
3. Ensure all dependencies are installed
4. Verify both servers are running