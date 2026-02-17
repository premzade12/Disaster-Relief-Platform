import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../ThemeContext';

function UserProfile({ user, onLogout }) {
  const { isDark } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [profile] = useState(user);

  const handleLogout = () => {
    localStorage.removeItem('user');
    onLogout();
  };

  return (
    <div className={`h-screen overflow-hidden ${isDark ? 'bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900' : 'bg-gray-50'}`}>
      <div className="flex h-full">
        {/* Sidebar */}
        <div className={`w-64 h-full p-6 flex flex-col ${isDark ? 'bg-gray-800 border-r border-gray-700' : 'bg-white border-r border-gray-200'}`}>
          <h2 className={`text-xl font-bold mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>Report an</h2>
          
          <nav className="space-y-4">
            <button onClick={() => navigate('/profile')} className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}>
              <span>🏠</span> User Portal
            </button>
            <button onClick={() => navigate('/report')} className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg ${isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}>
              <span>⚠️</span> Report
            </button>
            <button onClick={() => navigate('/')} className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg ${isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}>
              <span>🔔</span> Dashboard
            </button>
          </nav>

          <button onClick={handleLogout} className={`flex items-center gap-3 px-4 py-2 rounded-lg mt-auto ${isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}>
            <span>🚪</span> Log out
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            <h1 className={`text-3xl font-bold mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>User Profile</h1>

            <div className={`rounded-2xl shadow-lg p-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              {/* Profile Picture */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center text-white text-3xl font-bold">
                    {profile.firstName?.[0]}{profile.lastName?.[0]}
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center">
                    ✓
                  </button>
                </div>
              </div>

              <form className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>First Name</label>
                    <input value={profile.firstName} readOnly className={`w-full px-4 py-3 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-500'}`} />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Last Name</label>
                    <input value={profile.lastName} readOnly className={`w-full px-4 py-3 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-500'}`} />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Contact Number</label>
                  <input value={profile.contactNumber} readOnly className={`w-full px-4 py-3 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-500'}`} />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
                  <input value={profile.email} readOnly className={`w-full px-4 py-3 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-500'}`} />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Role</label>
                  <input value={profile.role} readOnly className={`w-full px-4 py-3 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-500'}`} />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
