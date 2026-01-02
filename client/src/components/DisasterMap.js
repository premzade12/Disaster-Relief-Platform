import React, { useState, useEffect } from 'react';
import axios from 'axios';

function DisasterMap() {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    fetchReports();
    const interval = setInterval(fetchReports, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchReports = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/reports');
      setReports(response.data);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    }
  };

  // Sample coordinates for Indian cities (in real app, use geocoding API)
  const getCoordinates = (location) => {
    const coords = {
      'Mumbai': { lat: 19.0760, lng: 72.8777 },
      'Delhi': { lat: 28.7041, lng: 77.1025 },
      'Bangalore': { lat: 12.9716, lng: 77.5946 },
      'Chennai': { lat: 13.0827, lng: 80.2707 },
      'Kolkata': { lat: 22.5726, lng: 88.3639 },
      'Hyderabad': { lat: 17.3850, lng: 78.4867 },
      'Pune': { lat: 18.5204, lng: 73.8567 },
      'Ahmedabad': { lat: 23.0225, lng: 72.5714 }
    };
    
    // Find matching city or return default coordinates
    const city = Object.keys(coords).find(city => 
      location.toLowerCase().includes(city.toLowerCase())
    );
    return city ? coords[city] : { lat: 20.5937, lng: 78.9629 }; // Center of India
  };

  const getDisasterColor = (type) => {
    const colors = {
      'Flood': '#3B82F6', // Blue
      'Earthquake': '#EF4444', // Red
      'Cyclone': '#8B5CF6', // Purple
      'Wildfire': '#F59E0B' // Orange
    };
    return colors[type] || '#6B7280';
  };

  const getDisasterIcon = (type) => {
    const icons = {
      'Flood': '🌊',
      'Earthquake': '🏚️',
      'Cyclone': '🌪️',
      'Wildfire': '🔥'
    };
    return icons[type] || '⚠️';
  };

  return (
    <div className="max-w-7xl mx-auto mt-10 px-4 mb-10">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        <div className="bg-gray-50 px-8 py-5 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            🗺️ Disaster Location Map
          </h2>
          <p className="text-gray-600 text-sm mt-1">Real-time visualization of reported disasters across regions</p>
        </div>
        
        <div className="p-6">
          {/* Map Container */}
          <div className="relative bg-gradient-to-br from-blue-50 to-green-50 rounded-xl border-2 border-gray-200 overflow-hidden" style={{ height: '500px' }}>
            {/* Simple SVG Map Representation */}
            <svg viewBox="0 0 800 500" className="w-full h-full">
              {/* Background */}
              <rect width="800" height="500" fill="#E0F2FE" />
              
              {/* India outline (simplified) */}
              <path
                d="M200 150 L250 120 L300 130 L350 140 L400 160 L450 180 L500 200 L520 250 L510 300 L480 350 L450 380 L400 400 L350 410 L300 400 L250 380 L200 350 L180 300 L170 250 L180 200 Z"
                fill="#10B981"
                fillOpacity="0.3"
                stroke="#059669"
                strokeWidth="2"
              />
              
              {/* Plot disaster locations */}
              {reports.map((report, index) => {
                const coords = getCoordinates(report.location);
                // Convert lat/lng to SVG coordinates (simplified mapping)
                const x = ((coords.lng - 68) / (97 - 68)) * 800;
                const y = ((37 - coords.lat) / (37 - 8)) * 500;
                
                return (
                  <g key={report._id}>
                    {/* Disaster marker */}
                    <circle
                      cx={x}
                      cy={y}
                      r="8"
                      fill={getDisasterColor(report.disaster_type)}
                      stroke="white"
                      strokeWidth="2"
                      className="cursor-pointer hover:r-10 transition-all"
                      onClick={() => setSelectedReport(report)}
                    />
                    {/* Pulsing animation for recent reports */}
                    {new Date() - new Date(report.timestamp) < 3600000 && (
                      <circle
                        cx={x}
                        cy={y}
                        r="8"
                        fill={getDisasterColor(report.disaster_type)}
                        fillOpacity="0.3"
                        className="animate-ping"
                      />
                    )}
                  </g>
                );
              })}
            </svg>
            
            {/* Selected Report Popup */}
            {selectedReport && (
              <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 max-w-sm">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-800">{selectedReport.title}</h3>
                  <button 
                    onClick={() => setSelectedReport(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-2 text-sm">
                  <p><span className="font-semibold">Location:</span> {selectedReport.location}</p>
                  <p><span className="font-semibold">Type:</span> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-bold text-white`} 
                          style={{ backgroundColor: getDisasterColor(selectedReport.disaster_type) }}>
                      {getDisasterIcon(selectedReport.disaster_type)} {selectedReport.disaster_type}
                    </span>
                  </p>
                  <p><span className="font-semibold">Status:</span> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-bold ${
                      selectedReport.status === 'Verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedReport.status}
                    </span>
                  </p>
                  <p><span className="font-semibold">Time:</span> {new Date(selectedReport.timestamp).toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Legend */}
          <div className="mt-6 flex flex-wrap gap-4 justify-center">
            {['Flood', 'Earthquake', 'Cyclone', 'Wildfire'].map(type => (
              <div key={type} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                <div 
                  className="w-4 h-4 rounded-full border-2 border-white"
                  style={{ backgroundColor: getDisasterColor(type) }}
                ></div>
                <span className="text-sm font-medium">{getDisasterIcon(type)} {type}</span>
              </div>
            ))}
          </div>
          
          {/* Statistics */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Flood', 'Earthquake', 'Cyclone', 'Wildfire'].map(type => {
              const count = reports.filter(r => r.disaster_type === type).length;
              return (
                <div key={type} className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold" style={{ color: getDisasterColor(type) }}>
                    {count}
                  </div>
                  <div className="text-sm text-gray-600">{type} Reports</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DisasterMap;