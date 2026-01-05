🚨 Disaster Relief Platform
A comprehensive full-stack web application for real-time disaster monitoring, reporting, and coordinated relief efforts with AI-powered image analysis, news verification, and NGO response coordination.

🌐 Live Demo
🎨 Frontend: Deployed on Render

⚙️ Backend API: Flask API on Render

✨ Features
📊 Real-time Dashboard: Live monitoring of disaster reports and statistics.

🤖 AI Image Analysis: Automatic disaster type classification using deep learning (CNN).

📝 User Reporting: Easy-to-use form for submitting disaster reports.

📷 Live Camera Capture: Take photos directly from your device camera or upload files.

🗺️ Interactive Map: Visual representation of disaster locations with real-time updates.

📰 News Verification: Cross-verify reports with news sources.

🤝 NGO Response Portal: Coordinate emergency relief efforts.

⚡ Live Updates: Dashboard refreshes every 5 seconds.

📱 Responsive Design: Modern UI built with Tailwind CSS.

🏗️ Architecture & Tech Stack
Frontend: React.js with Tailwind CSS

Backend: Flask with TensorFlow/Keras

AI Model: Convolutional Neural Network (CNN) for disaster image classification (Cyclone, Earthquake, Flood, Wildfire)

Map Integration: Leaflet.js for interactive mapping

News API: Mock verification system (ready for real API integration)

📂 Project Structure
Plaintext

Disaster-Relief-Platform/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ClientDashboard.js
│   │   │   ├── AdminDashboard.js
│   │   │   ├── UserPortal.js      # Report submission
│   │   │   ├── LeafletMap.js      # Interactive map
│   │   │   ├── NGODashboard.js    # NGO response portal
│   │   │   ├── App.js
│   │   │   └── index.js
│   ├── public/
│   └── package.json
├── Flask/                  # Flask backend
│   ├── app_working.py      # Main Flask application
│   ├── disaster.h5         # AI model (not included - see setup)
│   ├── requirements.txt
│   └── dataset/            # Training data (not included - large files)
├── Model Building/         # Jupyter notebooks
├── start_system.bat        # Automated startup script
└── README.md
🚀 Quick Start
Prerequisites
Python 3.8+

Node.js 16+

Git

Option 1: Automated Setup (Recommended)
Clone the repository:

Bash

git clone https://github.com/premzade12/Disaster-Relief-Platform.git
cd Disaster-Relief-Platform
Run the startup script: Double-click start_system.bat to automatically install dependencies and start both servers.

Option 2: Manual Setup
Backend Setup:

Bash

cd Flask
pip install -r requirements.txt
python app_working.py
Frontend Setup:

Bash

cd client
npm install
npm start
💻 Access Points
Local Development
Main Dashboard: http://localhost:3000/ (Admin view with verification)

NGO Portal: http://localhost:3000/ngo (Relief coordination)

Map View: http://localhost:3000/map (Visual disaster locations)

Report Form: http://localhost:3000/report (Public reporting)

Flask Backend: http://localhost:5000

📖 Usage Guide
1. Main Dashboard
View real-time statistics (total reports, verified emergencies, active NGOs).

Monitor live feed of disaster reports.

Verify reports with news API.

See AI classification results.

2. Map View
Interactive map showing disaster locations.

Click on markers to see detailed information.

Color-coded disaster types with legend.

Real-time updates with pulsing animations for recent reports.

3. Report Submission
Navigate to "Report Incident".

Fill in title, location, and description.

Choose to either:

📷 Use Camera: Capture photo directly from device.

📁 Upload File: Select existing image from device.

Submit and receive instant AI feedback.

4. NGO Response Portal
View verified emergency reports.

Select a disaster to respond to.

Choose action type (Emergency Relief, Food Distribution, Medical Aid, etc.).

Deploy resources and track operations.

🧠 AI Model Details
The system uses a Convolutional Neural Network (CNN) trained to classify disaster images into:

🌪️ Cyclone: Tropical storms and hurricanes

🏚️ Earthquake: Seismic damage and destruction

🌊 Flood: Water-related disasters

🔥 Wildfire: Fire-related emergencies

⚠️ Important Note: The AI model file (disaster.h5) is not included in the repository due to size constraints. You will need to train your own model using the notebooks in Model Building/ or contact the repository owner.

📡 API Documentation
Public Endpoints
GET /api/reports - Get all disaster reports

GET /api/stats - Get dashboard statistics

POST /api/report - Submit new disaster report with image

Verification Endpoints
POST /api/verify-report/<id> - Verify report with news API

NGO Endpoints
GET /api/ngo/verified-reports - Get news-verified disasters for NGOs

POST /api/ngo/take-action - NGO takes emergency action

GET /api/ngo/actions - Get all active relief operations

🛠️ Deployment (Render)
Frontend Deployment
Fork this repository.

Connect to Render.

Service Type: Static Site

Build Command: cd client && npm install && npm run build

Publish Directory: client/build

Environment Variables:

NODE_VERSION: 20.11.0

CI: false

GENERATE_SOURCEMAP: false

Backend Deployment
Create new Web Service on Render.

Build Command: cd Flask && pip install -r requirements.txt

Start Command: cd Flask && python app_working.py

Environment Variables:

PYTHON_VERSION: 3.11.0

PORT: 5000

🔧 Troubleshooting
Common Issues
Port conflicts: Change ports in package.json (React) or app_working.py (Flask).

Model loading errors: Ensure disaster.h5 is present in the Flask/ directory.

CORS errors: Flask-cors is installed and configured.

Image upload fails: Check file permissions and temp directory access.

Camera not working: Ensure HTTPS or localhost; check browser permissions.

Error Messages
"Backend not running": Start Flask server first.

"No image provided": Ensure image is selected before submission.

"Model prediction failed": Check image format (JPG, PNG supported).

"Camera access denied": Allow camera permissions in browser.

🤝 Contributing
Fork the repository.

Create feature branch (git checkout -b feature/AmazingFeature).

Commit your changes (git commit -m 'Add some AmazingFeature').

Push to the branch (git push origin feature/AmazingFeature).

Open a Pull Request.

📜 License
This project is for educational purposes. Feel free to modify and distribute.

🙏 Acknowledgments
OpenStreetMap for map data.

Leaflet.js for mapping functionality.

TensorFlow team for AI framework.

React & Flask teams.

⚠️ Important Notes:

The AI model file is not included due to size constraints.

Dataset is not included due to size constraints.

This is a demonstration system - adapt for production use.

News API integration is currently mocked - integrate with real news APIs for production.
