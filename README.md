# Disaster Relief Platform

A comprehensive full-stack web application for real-time disaster monitoring, reporting, and coordinated relief efforts with AI-powered image analysis, news verification, and NGO response coordination.

## 🌐 Live Demo
- **Frontend**: [Deployed on Render](https://your-app-name.onrender.com)
- **Backend API**: [Flask API on Render](https://your-api-name.onrender.com)

## 🚀 Features

- **Real-time Dashboard**: Live monitoring of disaster reports and statistics
- **AI Image Analysis**: Automatic disaster type classification using deep learning
- **User Reporting**: Easy-to-use form for submitting disaster reports
- **Live Camera Capture**: Take photos directly from device camera or upload files
- **Interactive Map**: Visual representation of disaster locations with real-time updates
- **News Verification**: Cross-verify reports with news sources
- **NGO Response Portal**: Coordinate emergency relief efforts
- **Live Updates**: Dashboard refreshes every 5 seconds
- **Responsive Design**: Modern UI with Tailwind CSS

## 🏗️ Architecture

- **Frontend**: React.js with Tailwind CSS
- **Backend**: Flask with TensorFlow/Keras
- **AI Model**: CNN for disaster image classification (Cyclone, Earthquake, Flood, Wildfire)
- **Map Integration**: Leaflet.js for interactive mapping
- **News API**: Mock verification system (ready for real API integration)

## 📁 Project Structure

```
Disaster-Relief-Platform/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ClientDashboard.js    # Admin dashboard
│   │   │   ├── UserPortal.js         # Report submission
│   │   │   ├── LeafletMap.js         # Interactive map
│   │   │   └── NGODashboard.js       # NGO response portal
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   └── package.json
├── Flask/                  # Flask backend
│   ├── app_working.py     # Main Flask application
│   ├── disaster.h5        # AI model (not included - see setup)
│   └── requirements.txt
├── dataset/               # Training data (not included - large files)
├── Model Building/        # Jupyter notebooks
├── start_system.bat       # Automated startup script
└── README.md
```

## 🚀 Quick Start

### 🌐 Render Deployment (Recommended)

#### Frontend Deployment:
1. Fork this repository
2. Connect to Render
3. **Service Type**: Static Site
4. **Build Command**: `cd client && npm install && npm run build`
5. **Publish Directory**: `client/build`
6. **Environment Variables**:
   - `NODE_VERSION`: `20.11.0`
   - `CI`: `false`
   - `GENERATE_SOURCEMAP`: `false`

#### Backend Deployment:
1. Create new Web Service on Render
2. **Build Command**: `cd Flask && pip install -r requirements.txt`
3. **Start Command**: `cd Flask && python app_working.py`
4. **Environment Variables**:
   - `PYTHON_VERSION`: `3.11.0`
   - `PORT`: `5000`

### Prerequisites
- Python 3.8+
- Node.js 16+
- Git

### Option 1: Automated Setup (Recommended)
1. Clone the repository:
   ```bash
   git clone https://github.com/premzade12/Disaster-Relief-Platform.git
   cd Disaster-Relief-Platform
   ```
2. Double-click `start_system.bat` to automatically install dependencies and start both servers

### Option 2: Manual Setup

#### Backend Setup
```bash
cd Flask
pip install -r requirements.txt
python app_working.py
```

#### Frontend Setup
```bash
cd client
npm install
npm start
```

## 🌐 Access Points

### Production (Render)
- **Main Dashboard**: https://your-app-name.onrender.com
- **NGO Portal**: https://your-app-name.onrender.com/ngo
- **Map View**: https://your-app-name.onrender.com/map
- **Report Form**: https://your-app-name.onrender.com/report
- **Flask Backend**: https://your-api-name.onrender.com

### Local Development
- **Main Dashboard**: http://localhost:3000/ (Admin view with verification)
- **NGO Portal**: http://localhost:3000/ngo (Relief coordination)
- **Map View**: http://localhost:3000/map (Visual disaster locations)
- **Report Form**: http://localhost:3000/report (Public reporting)
- **Flask Backend**: http://localhost:5000

## 📱 Usage

### Dashboard View
- View real-time statistics (total reports, verified emergencies, active NGOs)
- Monitor live feed of disaster reports
- Verify reports with news API
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

### NGO Response Portal
1. View verified emergency reports
2. Select a disaster to respond to
3. Choose action type (Emergency Relief, Food Distribution, Medical Aid, etc.)
4. Deploy resources and track operations

## 🤖 AI Model

The system uses a Convolutional Neural Network trained to classify disaster images into:
- **Cyclone**: Tropical storms and hurricanes
- **Earthquake**: Seismic damage and destruction
- **Flood**: Water-related disasters
- **Wildfire**: Fire-related emergencies

**Note**: The AI model file (`disaster.h5`) is not included in the repository due to size constraints. You'll need to train your own model or contact the repository owner.

## 🔧 API Documentation

### Public Endpoints
- `GET /api/reports` - Get all disaster reports
- `GET /api/stats` - Get dashboard statistics
- `POST /api/report` - Submit new disaster report with image

### Verification Endpoints
- `POST /api/verify-report/{id}` - Verify report with news API

### NGO Endpoints
- `GET /api/ngo/verified-reports` - Get news-verified disasters for NGOs
- `POST /api/ngo/take-action` - NGO takes emergency action
- `GET /api/ngo/actions` - Get all active relief operations

## 🛠️ Development

### Adding New Features
1. **Frontend**: Add components in `client/src/components/`
2. **Backend**: Add routes in `Flask/app_working.py`
3. **Styling**: Use Tailwind CSS classes

### Model Training
- Training data should be placed in `dataset/` folder
- Use Jupyter notebook in `Model Building/` folder
- Save trained model as `disaster.h5` in Flask/ directory

## 📋 Requirements

### Backend
- Python 3.8+
- Flask 2.3.3
- TensorFlow 2.13.0
- OpenCV 4.8.1
- NumPy 1.24.3
- flask-cors 4.0.0
- requests (for news API)

### Frontend
- Node.js 16+
- React 18.2.0
- Axios 1.6.0
- React Router DOM 6.8.0
- Tailwind CSS (via CDN)

## 🚨 Troubleshooting

### Common Issues
1. **Port conflicts**: Change ports in package.json (React) or app_working.py (Flask)
2. **Model loading errors**: Ensure disaster.h5 is in Flask/ directory
3. **CORS errors**: flask-cors is installed and configured
4. **Image upload fails**: Check file permissions and temp directory access
5. **Camera not working**: Ensure HTTPS or localhost, check browser permissions

### Error Messages
- "Backend not running": Start Flask server first
- "No image provided": Ensure image is selected before submission
- "Model prediction failed": Check image format (JPG, PNG supported)
- "Camera access denied": Allow camera permissions in browser

## 🌟 Key Features Workflow

1. **User Reports** → Incident submitted via camera/upload
2. **AI Analysis** → Disaster type classification
3. **News Verification** → Cross-check with news sources
4. **NGO Dashboard** → Verified incidents appear for NGOs
5. **Emergency Response** → NGOs deploy resources and aid
6. **Real-time Tracking** → Monitor all operations on map and dashboard

## 📄 License

This project is for educational purposes. Feel free to modify and distribute.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For issues and questions:
1. Check troubleshooting section
2. Review console logs
3. Ensure all dependencies are installed
4. Verify both servers are running
5. Open an issue on GitHub

## 🙏 Acknowledgments

- OpenStreetMap for map data
- Leaflet.js for mapping functionality
- TensorFlow team for AI framework
- React team for frontend framework
- Flask team for backend framework

---

**⚠️ Important Notes:**
- The AI model file is not included due to size constraints
- Dataset is not included due to size constraints
- This is a demonstration system - adapt for production use
- News API integration is currently mocked - integrate with real news APIs for production#   D i s a s t e r - R e l i e f - P l a t f o r m  
 