import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function LeafletMap() {
  const [reports, setReports] = useState([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    loadLeaflet();
    fetchReports();
    const interval = setInterval(fetchReports, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (mapLoaded && reports.length > 0) {
      updateMarkers();
    }
  }, [mapLoaded, reports]);

  const loadLeaflet = () => {
    // Load Leaflet CSS
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    if (!window.L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => {
        setTimeout(initializeMap, 500); // Wait for CSS to load
      };
      document.head.appendChild(script);
    } else {
      initializeMap();
    }
  };

  const initializeMap = () => {
    if (window.L && document.getElementById('leaflet-map')) {
      try {
        const map = window.L.map('leaflet-map').setView([20.5937, 78.9629], 5);
        
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 18
        }).addTo(map);

        mapRef.current = map;
        setMapLoaded(true);
        console.log('✅ Map initialized successfully');
      } catch (error) {
        console.error('❌ Map initialization failed:', error);
      }
    }
  };

  const fetchReports = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/reports');
      console.log('📋 Fetched reports:', response.data);
      setReports(response.data);
    } catch (err) {
      console.error('❌ Failed to fetch reports:', err);
    }
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

  const getDisasterColor = (type) => {
    const colors = {
      'Flood': '#3B82F6',
      'Earthquake': '#EF4444',
      'Cyclone': '#8B5CF6',
      'Wildfire': '#F59E0B'
    };
    return colors[type] || '#6B7280';
  };

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
    
    const city = Object.keys(coords).find(city => 
      location.toLowerCase().includes(city.toLowerCase())
    );
    return city ? coords[city] : { lat: 20.5937, lng: 78.9629 };
  };

  const updateMarkers = () => {
    if (!mapRef.current || !window.L || reports.length === 0) {
      console.log('⚠️ Cannot update markers:', { map: !!mapRef.current, leaflet: !!window.L, reports: reports.length });
      return;
    }

    console.log('📍 Updating markers for', reports.length, 'reports');

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapRef.current.removeLayer(marker);
    });
    markersRef.current = [];

    reports.forEach((report, index) => {
      const coords = report.coordinates || getCoordinates(report.location);
      console.log(`📍 Adding marker ${index + 1}:`, report.title, 'at', coords);
      
      const marker = window.L.circleMarker([coords.lat, coords.lng], {
        radius: 12,
        fillColor: getDisasterColor(report.disaster_type),
        color: '#ffffff',
        weight: 3,
        opacity: 1,
        fillOpacity: 0.8
      }).addTo(mapRef.current);

      const popupContent = `
        <div style="max-width: 250px; font-family: Arial, sans-serif;">
          <h3 style="margin: 0 0 10px 0; color: #1f2937; font-size: 16px; font-weight: bold;">
            ${getDisasterIcon(report.disaster_type)} ${report.title}
          </h3>
          <div style="margin-bottom: 8px;">
            <strong>Location:</strong> ${report.location}
          </div>
          <div style="margin-bottom: 8px;">
            <strong>Type:</strong> 
            <span style="background: ${getDisasterColor(report.disaster_type)}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-left: 5px;">
              ${report.disaster_type}
            </span>
          </div>
          <div style="margin-bottom: 8px;">
            <strong>Status:</strong> 
            <span style="background: ${report.status === 'Verified' ? '#10B981' : '#F59E0B'}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-left: 5px;">
              ${report.status}
            </span>
          </div>
          <div style="margin-bottom: 8px;">
            <strong>Time:</strong> ${new Date(report.timestamp).toLocaleString()}
          </div>
          <div style="color: #6b7280; font-size: 14px;">
            ${report.description}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      markersRef.current.push(marker);
    });

    console.log('✅ Added', markersRef.current.length, 'markers to map');
  };

  return (
    <div className="max-w-7xl mx-auto mt-10 px-4 mb-10">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        <div className="bg-gray-50 px-8 py-5 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            🌍 Interactive Map - Disaster Locations
          </h2>
          <p className="text-gray-600 text-sm mt-1">Real-time map showing disaster reports with detailed information</p>
        </div>
        
        <div className="p-6">
          {/* Map Container with relative positioning */}
          <div className="relative">
            {/* Leaflet Map Container */}
            <div 
              id="leaflet-map"
              className="w-full rounded-xl border-2 border-gray-200 shadow-lg"
              style={{ height: '500px' }}
            />
            
            {/* Loading indicator */}
            {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-xl">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading map...</p>
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

          {/* Debug Info */}
          <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="text-yellow-800 text-sm">
              <strong>🔍 Debug Info:</strong> 
              Map Loaded: {mapLoaded ? '✅' : '❌'} | 
              Reports: {reports.length} | 
              Markers: {markersRef.current.length}
            </p>
            {reports.length > 0 && (
              <div className="mt-2 text-xs text-yellow-700">
                <strong>Sample Report:</strong> {reports[0].title} at {reports[0].location}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-blue-800 text-sm">
              <strong>📍 How to use:</strong> Click on any colored marker to see detailed disaster information. 
              The map uses OpenStreetMap data and updates automatically with new reports.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeafletMap;