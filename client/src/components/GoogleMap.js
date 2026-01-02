import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function GoogleMap() {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const mapRef = useRef(null);

  useEffect(() => {
    // Load Google Maps script
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      document.head.appendChild(script);
    } else {
      initializeMap();
    }

    fetchReports();
    const interval = setInterval(fetchReports, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (map && reports.length > 0) {
      updateMarkers();
    }
  }, [map, reports]);

  const initializeMap = () => {
    if (mapRef.current && window.google) {
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: { lat: 20.5937, lng: 78.9629 }, // Center of India
        zoom: 5,
        styles: [
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#e9e9e9' }, { lightness: 17 }]
          },
          {
            featureType: 'landscape',
            elementType: 'geometry',
            stylers: [{ color: '#f5f5f5' }, { lightness: 20 }]
          }
        ]
      });
      setMap(mapInstance);
    }
  };

  const fetchReports = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/reports');
      setReports(response.data);
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

  const updateMarkers = () => {
    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    
    const newMarkers = reports.map(report => {
      const coords = report.coordinates || getCoordinates(report.location);
      
      const marker = new window.google.maps.Marker({
        position: { lat: coords.lat, lng: coords.lng },
        map: map,
        title: report.title,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: getDisasterColor(report.disaster_type),
          fillOpacity: 0.8,
          strokeColor: '#ffffff',
          strokeWeight: 2
        }
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="max-width: 300px; padding: 10px;">
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
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
        setSelectedReport(report);
      });

      return marker;
    });

    setMarkers(newMarkers);
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

  return (
    <div className="max-w-7xl mx-auto mt-10 px-4 mb-10">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        <div className="bg-gray-50 px-8 py-5 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            🌍 Google Maps - Disaster Locations
          </h2>
          <p className="text-gray-600 text-sm mt-1">Interactive map powered by Google Maps showing real-time disaster reports</p>
        </div>
        
        <div className="p-6">
          {/* Google Map Container */}
          <div 
            ref={mapRef}
            className="w-full rounded-xl border-2 border-gray-200 shadow-lg"
            style={{ height: '500px' }}
          />
          
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

          {/* Instructions */}
          <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-blue-800 text-sm">
              <strong>📍 How to use:</strong> Click on any colored marker to see detailed disaster information. 
              Markers are color-coded by disaster type and show real-time data from reports.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GoogleMap;