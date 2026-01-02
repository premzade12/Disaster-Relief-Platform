import React, { useState, useEffect } from 'react';
import axios from 'axios';

function NGODashboard() {
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
      const response = await axios.get('http://127.0.0.1:5000/api/ngo/verified-reports');
      setVerifiedReports(response.data);
    } catch (err) {
      console.error('Failed to fetch verified reports:', err);
    }
  };

  const fetchActions = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/ngo/actions');
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
      const response = await axios.post('http://127.0.0.1:5000/api/ngo/take-action', {
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
    <div className="max-w-7xl mx-auto mt-10 px-4 mb-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-2xl shadow-xl mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          🏥 NGO Response Dashboard
        </h1>
        <p className="text-blue-100 mt-2">Coordinate disaster relief efforts and manage emergency responses</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Verified Reports */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              ✅ Verified Emergency Reports
            </h2>
            <p className="text-gray-600 text-sm mt-1">News-verified disasters requiring immediate attention</p>
          </div>
          
          <div className="p-6 max-h-96 overflow-y-auto">
            {verifiedReports.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">📋</div>
                <p>No verified reports at the moment</p>
              </div>
            ) : (
              <div className="space-y-4">
                {verifiedReports.map(report => (
                  <div 
                    key={report._id} 
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedReport?._id === report._id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedReport(report)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        {getDisasterIcon(report.disaster_type)} {report.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getSeverityColor(report.severity)}`}>
                        {report.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">📍 {report.location}</p>
                    <p className="text-sm text-gray-500">{report.description}</p>
                    <div className="flex justify-between items-center mt-3 text-xs text-gray-400">
                      <span>🕒 {new Date(report.timestamp).toLocaleString()}</span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded">📰 News Verified</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              🚀 Take Emergency Action
            </h2>
            <p className="text-gray-600 text-sm mt-1">Deploy resources and coordinate relief efforts</p>
          </div>
          
          <div className="p-6">
            {!selectedReport ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">👆</div>
                <p>Select a verified report to take action</p>
              </div>
            ) : (
              <form onSubmit={handleTakeAction} className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-bold text-blue-800 mb-2">Selected Emergency:</h3>
                  <p className="text-blue-700">{selectedReport.title}</p>
                  <p className="text-blue-600 text-sm">📍 {selectedReport.location}</p>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-2">NGO Name</label>
                  <input
                    type="text"
                    value={actionForm.ngo_name}
                    onChange={(e) => setActionForm({...actionForm, ngo_name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Your NGO Name"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-2">Action Type</label>
                  <select
                    value={actionForm.action_type}
                    onChange={(e) => setActionForm({...actionForm, action_type: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                  <label className="block text-gray-700 font-bold mb-2">Resources to Deploy</label>
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {['Food Packets', 'Medical Supplies', 'Blankets', 'Water Bottles', 'Rescue Team', 'Ambulance'].map(resource => (
                      <button
                        key={resource}
                        type="button"
                        onClick={() => addResource(resource)}
                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300 transition"
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
                  className={`w-full py-3 text-white font-bold rounded-lg shadow-lg transition ${
                    loading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-red-600 hover:bg-red-700 transform hover:scale-105'
                  }`}
                >
                  {loading ? 'DEPLOYING...' : '🚀 DEPLOY EMERGENCY RESPONSE'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Active Actions */}
      <div className="mt-8 bg-white rounded-2xl shadow-xl border border-gray-200">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            📊 Active Relief Operations
          </h2>
          <p className="text-gray-600 text-sm mt-1">Current NGO response activities</p>
        </div>
        
        <div className="p-6">
          {actions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">📋</div>
              <p>No active operations</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {actions.map(action => (
                <div key={action.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-800">{action.action_type}</h3>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-bold">
                      {action.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">🏥 {action.ngo_name}</p>
                  <p className="text-sm text-gray-600 mb-2">📍 {action.location}</p>
                  <div className="text-xs text-gray-500">
                    <p>🕒 {new Date(action.timestamp).toLocaleString()}</p>
                    {action.resources.length > 0 && (
                      <p className="mt-1">📦 {action.resources.join(', ')}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NGODashboard;