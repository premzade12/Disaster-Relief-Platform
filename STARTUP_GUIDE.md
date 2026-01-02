# 🚀 Disaster Assessment System - Startup Guide

## Quick Start (Recommended)

1. **Double-click** `start_system.bat` in your project folder
2. **Wait** for both servers to start (2 command windows will open)
3. **Open browser** and go to: http://localhost:3000

## Manual Start (If batch file doesn't work)

### Step 1: Start Flask Backend
```cmd
cd c:\Users\HP\OneDrive\Desktop\DisaterAssesment\Flask
python app_working.py
```
**Expected output:**
```
🚀 Starting Disaster Assessment API...
📍 Available endpoints:
   GET  /api/stats   - Dashboard statistics
   GET  /api/reports - All reports
   POST /api/report  - Submit new report
🌐 Server will run on: http://127.0.0.1:5000
 * Running on http://127.0.0.1:5000
```

### Step 2: Test Flask API (Optional)
```cmd
cd c:\Users\HP\OneDrive\Desktop\DisaterAssesment\Flask
python test_api.py
```

### Step 3: Start React Frontend
```cmd
cd c:\Users\HP\OneDrive\Desktop\DisaterAssesment\client
npm install
npm start
```

## 🌐 Access Your Application

- **Frontend Dashboard**: http://localhost:3000
- **Report Submission**: http://localhost:3000/report
- **Backend API**: http://127.0.0.1:5000

## 🧪 Testing the System

1. **Dashboard**: Should show statistics and sample reports
2. **Report Form**: 
   - Fill in title, location, description
   - Upload any image (JPG/PNG)
   - Click "Submit Report"
   - Should get AI analysis result

## 🚨 Troubleshooting

### Flask Issues
- **"Model loading error"**: Check if `disaster.h5` exists in Flask folder
- **"Port already in use"**: Close other Flask instances
- **"Module not found"**: Run `pip install flask flask-cors opencv-python tensorflow`

### React Issues
- **"Backend not running"**: Start Flask first
- **"npm not found"**: Install Node.js
- **"Port 3000 in use"**: React will ask to use different port

### CORS Issues
- **"Access blocked"**: Make sure Flask shows "CORS enabled"
- **"Network Error"**: Check if Flask is running on correct port

## 📁 Project Structure
```
DisaterAssesment/
├── client/          # React frontend
├── Flask/           # Python backend
│   ├── app_working.py    # ✅ Use this Flask app
│   ├── disaster.h5       # AI model
│   └── test_api.py       # API tester
└── start_system.bat      # Auto-start script
```

## 🎯 Success Indicators

✅ Flask shows: "Server will run on: http://127.0.0.1:5000"
✅ React shows: "webpack compiled successfully"
✅ Dashboard loads with sample data
✅ Form submission works and shows AI result

## 📞 Still Having Issues?

1. Check both command windows for error messages
2. Try manual start instead of batch file
3. Run `python test_api.py` to test Flask
4. Ensure all dependencies are installed