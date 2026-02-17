import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

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
      } catch (error) {
      }
    }
  };

  const fetchReports = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/reports`);
      const fullyVerifiedReports = response.data.filter(report => report.final_verified);
      setReports(fullyVerifiedReports);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
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
      'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
      'Jaipur': { lat: 26.9124, lng: 75.7873 },
      'Lucknow': { lat: 26.8467, lng: 80.9462 },
      'Kanpur': { lat: 26.4499, lng: 80.3319 },
      'Nagpur': { lat: 21.1458, lng: 79.0882 },
      'Indore': { lat: 22.7196, lng: 75.8577 },
      'Thane': { lat: 19.2183, lng: 72.9781 },
      'Bhopal': { lat: 23.2599, lng: 77.4126 },
      'Visakhapatnam': { lat: 17.6868, lng: 83.2185 },
      'Pimpri': { lat: 18.6298, lng: 73.7997 },
      'Patna': { lat: 25.5941, lng: 85.1376 },
      'Vadodara': { lat: 22.3072, lng: 73.1812 },
      'Ghaziabad': { lat: 28.6692, lng: 77.4538 },
      'Ludhiana': { lat: 30.9010, lng: 75.8573 },
      'Agra': { lat: 27.1767, lng: 78.0081 },
      'Nashik': { lat: 19.9975, lng: 73.7898 },
      'Faridabad': { lat: 28.4089, lng: 77.3178 },
      'Meerut': { lat: 28.9845, lng: 77.7064 },
      'Rajkot': { lat: 22.3039, lng: 70.8022 },
      'Kalyan': { lat: 19.2403, lng: 73.1305 },
      'Vasai': { lat: 19.4612, lng: 72.7985 },
      'Varanasi': { lat: 25.3176, lng: 82.9739 },
      'Srinagar': { lat: 34.0837, lng: 74.7973 },
      'Aurangabad': { lat: 19.8762, lng: 75.3433 },
      'Dhanbad': { lat: 23.7957, lng: 86.4304 },
      'Amritsar': { lat: 31.6340, lng: 74.8723 },
      'Navi Mumbai': { lat: 19.0330, lng: 73.0297 },
      'Allahabad': { lat: 25.4358, lng: 81.8463 },
      'Ranchi': { lat: 23.3441, lng: 85.3096 },
      'Howrah': { lat: 22.5958, lng: 88.2636 },
      'Coimbatore': { lat: 11.0168, lng: 76.9558 },
      'Jabalpur': { lat: 23.1815, lng: 79.9864 },
      'Gwalior': { lat: 26.2183, lng: 78.1828 },
      'Vijayawada': { lat: 16.5062, lng: 80.6480 },
      'Jodhpur': { lat: 26.2389, lng: 73.0243 },
      'Madurai': { lat: 9.9252, lng: 78.1198 },
      'Raipur': { lat: 21.2514, lng: 81.6296 },
      'Kota': { lat: 25.2138, lng: 75.8648 }
    };
    
    const city = Object.keys(coords).find(city => 
      location.toLowerCase().includes(city.toLowerCase())
    );
    
    const result = city ? coords[city] : { lat: 20.5937, lng: 78.9629 };
    return result;
  };

  const updateMarkers = () => {
    if (!mapRef.current || !window.L || reports.length === 0) {
      return;
    }

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapRef.current.removeLayer(marker);
    });
    markersRef.current = [];

    // Group reports by location AND disaster type
    const locationGroups = {};
    reports.forEach(report => {
      const coords = report.coordinates || getCoordinates(report.location);
      const key = `${coords.lat.toFixed(4)},${coords.lng.toFixed(4)}_${report.disaster_type}`;
      if (!locationGroups[key]) {
        locationGroups[key] = { coords, type: report.disaster_type, reports: [] };
      }
      locationGroups[key].reports.push(report);
    });

    // Count types at each base location for offset calculation
    const baseLocationCounts = {};
    Object.values(locationGroups).forEach(group => {
      const baseKey = `${group.coords.lat.toFixed(4)},${group.coords.lng.toFixed(4)}`;
      baseLocationCounts[baseKey] = (baseLocationCounts[baseKey] || 0) + 1;
    });

    // Create markers for each disaster type at each location
    const typeIndexes = {};
    Object.values(locationGroups).forEach((group) => {
      const { coords, type, reports: groupReports } = group;
      const reportCount = groupReports.length;
      const baseKey = `${coords.lat.toFixed(4)},${coords.lng.toFixed(4)}`;
      
      // Get index for this type at this location
      if (!typeIndexes[baseKey]) typeIndexes[baseKey] = 0;
      const typeIndex = typeIndexes[baseKey]++;
      
      // Offset markers if multiple types at same location
      const offset = typeIndex * 0.01;
      const adjustedLat = coords.lat + offset;
      const adjustedLng = coords.lng + offset;
      
      const marker = window.L.circleMarker([adjustedLat, adjustedLng], {
        radius: 10 + (reportCount > 1 ? 3 : 0),
        fillColor: getDisasterColor(type),
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.85
      }).addTo(mapRef.current);

      // Create popup
      const popupContent = `
        <div style="max-width: 300px; font-family: Arial, sans-serif;">
          <h3 style="margin: 0 0 10px 0; color: #1f2937; font-size: 16px; font-weight: bold;">
            ${getDisasterIcon(type)} ${type} - ${groupReports[0].location}
          </h3>
          <div style="background: ${getDisasterColor(type)}20; padding: 8px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid ${getDisasterColor(type)};">
            <strong>${reportCount} ${type} Report${reportCount > 1 ? 's' : ''}</strong>
          </div>
          ${groupReports.slice(0, 3).map((report, idx) => `
            <div style="padding: 8px; margin-bottom: 8px; background: #fafafa; border-radius: 4px;">
              <div style="font-weight: bold; color: #1f2937; margin-bottom: 3px; font-size: 13px;">
                ${idx + 1}. ${report.title}
              </div>
              <div style="color: #6b7280; font-size: 12px; line-height: 1.4;">
                ${report.description.substring(0, 80)}${report.description.length > 80 ? '...' : ''}
              </div>
              <div style="margin-top: 3px; font-size: 11px; color: #9ca3af;">
                ${new Date(report.timestamp).toLocaleString()}
              </div>
            </div>
          `).join('')}
          ${reportCount > 3 ? `<div style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 5px;">+${reportCount - 3} more reports</div>` : ''}
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 350 });
      markersRef.current.push(marker);
    });
  };

  return (
    <div className="h-screen overflow-hidden">
      <div className="h-full overflow-y-auto">
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
        </div>
      </div>
    </div>
    </div>
    </div>
  );
}

export default LeafletMap;