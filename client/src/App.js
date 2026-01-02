import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ClientDashboard from './components/ClientDashboard';
import UserPortal from './components/UserPortal';
import LeafletMap from './components/LeafletMap';
import NGODashboard from './components/NGODashboard';
import CameraTest from './components/CameraTest';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="bg-gray-800 text-white p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold">🎆 Disaster Relief Platform</h1>
            <div className="space-x-4">
              <Link to="/" className="hover:text-gray-300 transition">Dashboard</Link>
              <Link to="/map" className="hover:text-gray-300 transition">Map View</Link>
              <Link to="/ngo" className="hover:text-gray-300 transition">NGO Portal</Link>
              <Link to="/report" className="hover:text-gray-300 transition">Report Incident</Link>
              <Link to="/camera-test" className="hover:text-gray-300 transition text-xs opacity-75">Camera Test</Link>
            </div>
          </div>
        </nav>
        
        <Routes>
          <Route path="/" element={<ClientDashboard />} />
          <Route path="/map" element={<LeafletMap />} />
          <Route path="/ngo" element={<NGODashboard />} />
          <Route path="/report" element={<UserPortal />} />
          <Route path="/camera-test" element={<CameraTest />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;