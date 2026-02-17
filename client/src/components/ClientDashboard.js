import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { ThemeContext } from '../ThemeContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function ClientDashboard() {
  const { isDark } = useContext(ThemeContext);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({ total_reports: 0, verified_emergencies: 0, active_ngos: 0, pending_verification: 0 });
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
    fetchData();
    const interval = setInterval(fetchData, 5000); 
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const reportRes = await axios.get(`${API_URL}/api/reports`);
      const statRes = await axios.get(`${API_URL}/api/stats`);
      setReports(reportRes.data);
      setStats(statRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    
    try {
      await axios.delete(`${API_URL}/api/report/${reportId}`);
      alert('Report deleted successfully');
      fetchData();
    } catch (err) {
      console.error('Delete error:', err);
      alert(`Failed to delete report: ${err.response?.data?.error || err.message}`);
    }
  };

  const getStatusBadge = (report) => {
    if (report.final_verified) return <span className={`px-2 py-1 text-xs font-medium rounded ${isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'}`}>✓ Verified</span>;
    if (report.status?.includes('Partially')) return <span className={`px-2 py-1 text-xs font-medium rounded ${isDark ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-800'}`}>Partial</span>;
    return <span className={`px-2 py-1 text-xs font-medium rounded ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>Pending</span>;
  };

  return (
    <div className={`h-screen overflow-hidden ${isDark ? 'bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900' : 'bg-gray-50'}`}>
      <div className="h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6">
      
      {/* Stats Cards with Animation */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className={`rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all duration-300 ${isDark ? 'bg-gradient-to-br from-blue-900 to-blue-800' : 'bg-gradient-to-br from-blue-500 to-blue-600'}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-4xl font-black text-white mb-2">{stats.total_reports}</div>
              <div className="text-sm text-blue-100 font-medium">Total Reports</div>
            </div>
            <div className="text-5xl opacity-20">📊</div>
          </div>
          <div className="mt-3 flex items-center text-xs text-blue-200">
            <span className="animate-pulse">●</span>
            <span className="ml-1">Live tracking</span>
          </div>
        </div>
        
        <div className={`rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all duration-300 ${isDark ? 'bg-gradient-to-br from-green-900 to-green-800' : 'bg-gradient-to-br from-green-500 to-green-600'}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-4xl font-black text-white mb-2">{stats.verified_emergencies}</div>
              <div className="text-sm text-green-100 font-medium">Verified</div>
            </div>
            <div className="text-5xl opacity-20">✅</div>
          </div>
          <div className="mt-3 flex items-center text-xs text-green-200">
            <span>↑ {Math.round((stats.verified_emergencies / stats.total_reports) * 100 || 0)}% verified</span>
          </div>
        </div>
        
        <div className={`rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all duration-300 ${isDark ? 'bg-gradient-to-br from-orange-900 to-orange-800' : 'bg-gradient-to-br from-orange-500 to-orange-600'}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-4xl font-black text-white mb-2">{stats.pending_verification}</div>
              <div className="text-sm text-orange-100 font-medium">Pending</div>
            </div>
            <div className="text-5xl opacity-20">⏳</div>
          </div>
          <div className="mt-3 flex items-center text-xs text-orange-200">
            <span className="animate-pulse">●</span>
            <span className="ml-1">Awaiting review</span>
          </div>
        </div>
        
        <div className={`rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all duration-300 ${isDark ? 'bg-gradient-to-br from-purple-900 to-purple-800' : 'bg-gradient-to-br from-purple-500 to-purple-600'}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-4xl font-black text-white mb-2">{stats.active_ngos}</div>
              <div className="text-sm text-purple-100 font-medium">Active NGOs</div>
            </div>
            <div className="text-5xl opacity-20">🏥</div>
          </div>
          <div className="mt-3 flex items-center text-xs text-purple-200">
            <span className="animate-pulse">●</span>
            <span className="ml-1">Responding now</span>
          </div>
        </div>
      </div>

      <div className={`rounded-2xl shadow-2xl overflow-hidden ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
        <div className={`px-6 py-5 border-b flex justify-between items-center ${isDark ? 'bg-gradient-to-r from-gray-800 to-gray-900 border-gray-700' : 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200'}`}>
          <div>
            <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>Live Disaster Reports</h2>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Real-time monitoring and verification</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-red-500 px-4 py-2 rounded-full">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              </span>
              <span className="text-sm text-white font-bold">LIVE</span>
            </div>
            <div className={`px-4 py-2 rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
              <span className="text-sm font-bold">{reports.length} Reports</span>
            </div>
          </div>
        </div>
        
        <div className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
          {reports.length === 0 ? (
            <div className={`p-12 text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              <div className="text-4xl mb-2">📭</div>
              <p>No reports found</p>
            </div>
          ) : (
            reports.map((report, index) => (
              <div key={report._id} className={`p-6 transition-all duration-300 hover:shadow-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-blue-50'}`} style={{animation: `fadeIn 0.5s ease-in ${index * 0.1}s`}}>
                <div className="grid grid-cols-2 gap-6">
                  {/* Left Side - Image */}
                  {report.image_url && (
                    <div className="flex items-center justify-center">
                      <div className="relative w-full h-64 rounded-2xl overflow-hidden shadow-lg">
                        <img 
                          src={`${API_URL}${report.image_url}`} 
                          alt={report.title}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="Arial" font-size="16"%3ENo Image%3C/text%3E%3C/svg%3E';
                          }}
                        />
                        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                          <span className="text-white text-sm font-bold">📸</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Right Side - Content */}
                  <div className="flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className={`font-bold text-xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{report.title}</h3>
                          {getStatusBadge(report)}
                        </div>
                        {user && (user.role === 'NGO' || user.role === 'Authority') && (
                          <button
                            onClick={() => deleteReport(report._id)}
                            className="ml-3 px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition"
                          >
                            🗑️ Delete
                          </button>
                        )}
                      </div>
                      
                      <div className={`space-y-2 mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-semibold">📍</span>
                          <span>{report.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-semibold">🕐</span>
                          <span>{new Date(report.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <p className={`text-sm leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{report.description}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {report.models_agree && (
                        <span className={`px-3 py-1.5 text-xs font-medium rounded-full ${isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>🤖 AI Verified</span>
                      )}
                      {report.news_verified && (
                        <span className={`px-3 py-1.5 text-xs font-medium rounded-full ${isDark ? 'bg-purple-900 text-purple-300' : 'bg-purple-50 text-purple-700 border border-purple-200'}`}>📰 News Verified</span>
                      )}
                      <span className={`px-3 py-1.5 text-xs font-medium rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>{report.disaster_type}</span>
                      {report.severity && (
                        <span className={`px-3 py-1.5 text-xs font-bold rounded-full ${
                          report.severity === 'High' ? 'bg-red-100 text-red-700 border border-red-200' :
                          report.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                          'bg-green-100 text-green-700 border border-green-200'
                        }`}>⚠️ {report.severity}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
    </div>
    </div>
  );
}

export default ClientDashboard;
