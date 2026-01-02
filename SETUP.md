# Setup Instructions

## Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- Git

## Installation Steps

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/Disaster-Relief-Platform.git
cd Disaster-Relief-Platform
```

### 2. Backend Setup
```bash
cd Flask
pip install -r requirements.txt
```

### 3. Frontend Setup
```bash
cd ../client
npm install
```

### 4. AI Model Setup
**Important**: The AI model file (`disaster.h5`) is not included in the repository due to size constraints.

**Option A**: Train your own model
- Place training data in `dataset/` folder
- Use the Jupyter notebook in `Model Building/` folder
- Save the trained model as `disaster.h5` in the `Flask/` directory

**Option B**: Use without AI (for testing)
- The system will work without the model file
- AI predictions will show as "Analysis Failed" but other features work

### 5. Start the Application

**Option 1: Automated (Windows)**
```bash
# From project root directory
start_system.bat
```

**Option 2: Manual**
```bash
# Terminal 1 - Backend
cd Flask
python app_working.py

# Terminal 2 - Frontend
cd client
npm start
```

### 6. Access the Application
- **Main Dashboard**: http://localhost:3000/
- **NGO Portal**: http://localhost:3000/ngo
- **Map View**: http://localhost:3000/map
- **Report Form**: http://localhost:3000/report

## Troubleshooting

### Common Issues
1. **"Module not found" errors**: Run `pip install -r requirements.txt` in Flask folder
2. **"npm command not found"**: Install Node.js from https://nodejs.org/
3. **Port already in use**: Change ports in the configuration files
4. **Camera not working**: Use HTTPS or localhost, check browser permissions

### Getting Help
- Check the main README.md for detailed troubleshooting
- Open an issue on GitHub if you encounter problems
- Ensure all prerequisites are installed correctly