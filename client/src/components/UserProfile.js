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
      <div className="flex flex-col md:flex-row h-full">
        {/* Sidebar */}
        <div className={`w-full md:w-64 h-auto md:h-full p-4 md:p-6 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible ${isDark ? 'bg-gray-800 border-b md:border-b-0 md:border-r border-gray-700' : 'bg-white border-b md:border-b-0 md:border-r border-gray-200'}`}>
          <h2 className={`text-base sm:text-lg md:text-xl font-bold mb-0 md:mb-8 mr-4 md:mr-0 whitespace-nowrap ${isDark ? 'text-white' : 'text-gray-900'}`}>Report an</h2>
          
          <nav className="flex flex-row md:flex-col gap-2 md:gap-4 flex-1 md:flex-initial">
            <button onClick={() => navigate('/profile')} className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 rounded-lg whitespace-nowrap text-sm md:text-base ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}>
              <span>🏠</span> <span className="hidden sm:inline">User Portal</span>
            </button>
            <button onClick={() => navigate('/report')} className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 rounded-lg whitespace-nowrap text-sm md:text-base ${isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}>
              <span>⚠️</span> <span className="hidden sm:inline">Report</span>
            </button>
            <button onClick={() => navigate('/')} className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 rounded-lg whitespace-nowrap text-sm md:text-base ${isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}>
              <span>🔔</span> <span className="hidden sm:inline">Dashboard</span>
            </button>
          </nav>

          <button onClick={handleLogout} className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 rounded-lg mt-0 md:mt-auto ml-auto md:ml-0 whitespace-nowrap text-sm md:text-base ${isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}>
            <span>🚪</span> <span className="hidden sm:inline">Log out</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            <h1 className={`text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>User Profile</h1>

            <div className={`rounded-xl sm:rounded-2xl shadow-lg p-5 sm:p-6 md:p-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              {/* Profile Picture */}
              <div className="flex justify-center mb-6 sm:mb-8">
                <div className="relative">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold">
                    {profile.firstName?.[0]}{profile.lastName?.[0]}
                  </div>
                  <button className="absolute bottom-0 right-0 w-7 h-7 sm:w-8 sm:h-8 bg-black text-white rounded-full flex items-center justify-center text-sm sm:text-base">
                    ✓
                  </button>
                </div>
              </div>

              <form className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>First Name</label>
                    <input value={profile.firstName} readOnly className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-500'}`} />
                  </div>
                  <div>
                    <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Last Name</label>
                    <input value={profile.lastName} readOnly className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-500'}`} />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Contact Number</label>
                  <input value={profile.contactNumber} readOnly className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-500'}`} />
                </div>

                <div>
                  <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
                  <input value={profile.email} readOnly className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-500'}`} />
                </div>

                <div>
                  <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Role</label>
                  <input value={profile.role} readOnly className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-500'}`} />
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
