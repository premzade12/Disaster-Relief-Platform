# Disaster Assessment System - Frontend

This is the React frontend for the Disaster Assessment System.

## Features

- **ClientDashboard**: Real-time dashboard showing disaster reports and statistics
- **UserPortal**: Form for users to submit disaster reports with image upload
- **Live Updates**: Dashboard refreshes every 5 seconds to show latest data
- **AI Integration**: Image analysis for disaster verification

## Setup Instructions

1. **Install Dependencies**
   ```bash
   cd client
   npm install
   ```

2. **Start the Development Server**
   ```bash
   npm start
   ```
   The app will run on http://localhost:3000

3. **Make sure your Flask backend is running on http://localhost:5000**

## API Endpoints Expected

The frontend expects these endpoints from your Flask backend:

- `GET /api/reports` - Get all disaster reports
- `GET /api/stats` - Get dashboard statistics
- `POST /api/report` - Submit new disaster report with image

## Components

### ClientDashboard
- Displays real-time statistics (total reports, verified emergencies, active NGOs)
- Shows live table of all disaster reports
- Auto-refreshes every 5 seconds

### UserPortal
- Form for submitting disaster reports
- Image upload with AI analysis
- Real-time feedback on submission status

## Styling

The app uses Tailwind CSS for styling with a modern, responsive design.