import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { ThemeContext } from '../ThemeContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function NGODashboard() {
  const { isDark } = useContext(ThemeContext);
  const [verifiedReports, setVerifiedReports] = useState([]);
  const [actions, setActions] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [actionForm, setActionForm] = useState({
    action_type: '',
    resources: [],
    ngo_name: 'Relief NGO'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVerifiedReports();
    fetchActions();
    const interval = setInterval(() => {
      fetchVerifiedReports();
      fetchActions();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchVerifiedReports = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/ngo/verified-reports`);
      console.log('Fetched verified reports:', response.data.length);
      
      // Sort by severity: High > Medium > Low
      const severityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
      const sorted = response.data.sort((a, b) => {
        const severityA = severityOrder[a.severity] || 4;
        const severityB = severityOrder[b.severity] || 4;
        return severityA - severityB;
      });
      
      setVerifiedReports(sorted);
    } catch (err) {
      console.error('Failed to fetch verified reports:', err);
    }
  };

  const fetchActions = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/ngo/actions`);
      setActions(response.data);
    } catch (err) {
      console.error('Failed to fetch actions:', err);
    }
  };

  const handleTakeAction = async (e) => {
    e.preventDefault();
    if (!selectedReport || !actionForm.action_type) return;

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/ngo/take-action`, {
        report_id: selectedReport._id,
        action_type: actionForm.action_type,
        resources: actionForm.resources,
        ngo_name: actionForm.ngo_name
      });

      alert(`✅ ${response.data.message}`);
      setSelectedReport(null);
      setActionForm({ action_type: '', resources: [], ngo_name: 'Relief NGO' });
      fetchActions();
    } catch (err) {
      alert('❌ Failed to take action');
      console.error(err);
    }
    setLoading(false);
  };

  const addResource = (resource) => {
    if (resource && !actionForm.resources.includes(resource)) {
      setActionForm({
        ...actionForm,
        resources: [...actionForm.resources, resource]
      });
    }
  };

  const removeResource = (resource) => {
    setActionForm({
      ...actionForm,
      resources: actionForm.resources.filter(r => r !== resource)
    });
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'High': 'bg-red-100 text-red-800 border-red-200',
      'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Low': 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[severity] || 'bg-gray-100 text-gray-800 border-gray-200';
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
    <div className={`h-screen overflow-hidden ${isDark ? 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900' : 'bg-gray-50'}`}>
      <div className="h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto mt-4 sm:mt-6 md:mt-10 px-3 sm:px-4 mb-6 sm:mb-10">
      {/* Header */}
      <div className={`p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl shadow-xl mb-6 sm:mb-8 ${isDark ? 'bg-gradient-to-r from-blue-800 to-blue-900' : 'bg-gradient-to-r from-blue-600 to-blue-800'} text-white`}>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-2 sm:gap-3">
          🏥 NGO Response Dashboard
        </h1>
        <p className="text-blue-100 mt-1 sm:mt-2 text-xs sm:text-sm md:text-base">Coordinate disaster relief efforts</p>
        <div className="mt-3 sm:mt-4 flex gap-2 sm:gap-4 text-xs sm:text-sm">
          <div className="bg-white/20 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg">
            <span className="font-bold text-lg sm:text-xl md:text-2xl">{verifiedReports.length}</span>
            <p className="text-blue-100 text-xs sm:text-sm">Verified Reports</p>
          </div>
          <div className="bg-white/20 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg">
            <span className="font-bold text-lg sm:text-xl md:text-2xl">{actions.length}</span>
            <p className="text-blue-100 text-xs sm:text-sm">Active Operations</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
        {/* Verified Reports */}
        <div className={`rounded-xl sm:rounded-2xl shadow-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className={`px-4 sm:px-5 md:px-6 py-3 sm:py-4 border-b ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <h2 className={`text-base sm:text-lg md:text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              ✅ Verified Emergency Reports
            </h2>
            <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>News-verified disasters</p>
          </div>
          
          <div className="p-3 sm:p-4 md:p-6 max-h-96 overflow-y-auto">
            {verifiedReports.length === 0 ? (
              <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                <div className="text-4xl mb-4">📋</div>
                <p>No verified reports at the moment</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {verifiedReports.map(report => (
                  <div 
                    key={report._id} 
                    className={`p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedReport?._id === report._id 
                        ? isDark ? 'border-blue-400 bg-blue-900' : 'border-blue-500 bg-blue-50'
                        : isDark ? 'border-gray-600 hover:border-gray-500' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedReport(report)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className={`font-bold text-sm sm:text-base flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {getDisasterIcon(report.disaster_type)} {report.title}
                      </h3>
                      <span className={`px-2 py-0.5 sm:py-1 rounded-full text-xs font-bold border ${getSeverityColor(report.severity)}`}>
                        {report.severity}
                      </span>
                    </div>
                    <p className={`text-xs sm:text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>📍 {report.location}</p>
                    <p className={`text-xs sm:text-sm line-clamp-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{report.description}</p>
                    <div className={`flex justify-between items-center mt-2 sm:mt-3 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      <span>🕒 {new Date(report.timestamp).toLocaleString()}</span>
                      <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">📰 Verified</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Form */}
        <div className={`rounded-xl sm:rounded-2xl shadow-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className={`px-4 sm:px-5 md:px-6 py-3 sm:py-4 border-b ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <h2 className={`text-base sm:text-lg md:text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              🚀 Take Emergency Action
            </h2>
            <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Deploy resources</p>
          </div>
          
          <div className="p-3 sm:p-4 md:p-6">
            {!selectedReport ? (
              <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                <div className="text-4xl mb-4">👆</div>
                <p>Select a verified report to take action</p>
              </div>
            ) : (
              <form onSubmit={handleTakeAction} className="space-y-3 sm:space-y-4">
                <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
                  <h3 className="font-bold text-blue-800 mb-1 sm:mb-2 text-sm sm:text-base">Selected Emergency:</h3>
                  <p className="text-blue-700 text-xs sm:text-sm">{selectedReport.title}</p>
                  <p className="text-blue-600 text-xs sm:text-sm">📍 {selectedReport.location}</p>
                </div>

                <div>
                  <label className={`block font-bold mb-1 sm:mb-2 text-xs sm:text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>NGO Name</label>
                  <input
                    type="text"
                    value={actionForm.ngo_name}
                    onChange={(e) => setActionForm({...actionForm, ngo_name: e.target.value})}
                    className={`w-full px-3 sm:px-4 py-2 border rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-400 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    placeholder="Your NGO Name"
                  />
                </div>

                <div>
                  <label className={`block font-bold mb-1 sm:mb-2 text-xs sm:text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Action Type</label>
                  <select
                    value={actionForm.action_type}
                    onChange={(e) => setActionForm({...actionForm, action_type: e.target.value})}
                    className={`w-full px-3 sm:px-4 py-2 border rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-400 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    required
                  >
                    <option value="">Select Action Type</option>
                    <option value="Emergency Relief">🚨 Emergency Relief</option>
                    <option value="Food Distribution">🍽️ Food Distribution</option>
                    <option value="Medical Aid">🏥 Medical Aid</option>
                    <option value="Shelter Setup">🏠 Shelter Setup</option>
                    <option value="Rescue Operations">🚁 Rescue Operations</option>
                    <option value="Water Supply">💧 Water Supply</option>
                  </select>
                </div>

                <div>
                  <label className={`block font-bold mb-1 sm:mb-2 text-xs sm:text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Resources to Deploy</label>
                  <div className="flex gap-1.5 sm:gap-2 mb-2 flex-wrap">
                    {['Food Packets', 'Medical Supplies', 'Blankets', 'Water Bottles', 'Rescue Team', 'Ambulance'].map(resource => (
                      <button
                        key={resource}
                        type="button"
                        onClick={() => addResource(resource)}
                        className="px-2 sm:px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs hover:bg-gray-300 transition"
                      >
                        + {resource}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {actionForm.resources.map(resource => (
                      <span
                        key={resource}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1"
                      >
                        {resource}
                        <button
                          type="button"
                          onClick={() => removeResource(resource)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-2.5 sm:py-3 text-white font-bold rounded-lg shadow-lg transition text-sm sm:text-base ${
                    loading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-red-600 hover:bg-red-700 transform hover:scale-105'
                  }`}
                >
                  {loading ? 'DEPLOYING...' : '🚀 DEPLOY RESPONSE'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Active Actions */}
      <div className={`mt-6 sm:mt-8 rounded-xl sm:rounded-2xl shadow-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className={`px-4 sm:px-5 md:px-6 py-3 sm:py-4 border-b ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
          <h2 className={`text-base sm:text-lg md:text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            📊 Active Relief Operations
          </h2>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Current NGO response activities</p>
        </div>
        
        <div className="p-3 sm:p-4 md:p-6">
          {actions.length === 0 ? (
            <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              <div className="text-4xl mb-4">📋</div>
              <p>No active operations</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {actions.map(action => (
                <div key={action.id} className={`p-3 sm:p-4 border rounded-lg ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`font-bold text-sm sm:text-base ${isDark ? 'text-white' : 'text-gray-800'}`}>{action.action_type}</h3>
                    <span className="bg-green-100 text-green-800 px-2 py-0.5 sm:py-1 rounded-full text-xs font-bold">
                      {action.status}
                    </span>
                  </div>
                  <p className={`text-xs sm:text-sm mb-1 sm:mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>🏥 {action.ngo_name}</p>
                  <p className={`text-xs sm:text-sm mb-1 sm:mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>📍 {action.location}</p>
                  <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    <p>🕒 {new Date(action.timestamp).toLocaleString()}</p>
                    {action.resources.length > 0 && (
                      <p className="mt-1 line-clamp-1">📦 {action.resources.join(', ')}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
    </div>
  );
}

export default NGODashboard;