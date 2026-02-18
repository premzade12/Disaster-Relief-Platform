import React, { useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ClientDashboard from './components/ClientDashboard';
import UserPortal from './components/UserPortal';
import LeafletMap from './components/LeafletMap';
import NGODashboard from './components/NGODashboard';
import Login from './components/Login';
import UserProfile from './components/UserProfile';
import { ThemeProvider, ThemeContext } from './ThemeContext';
import './App.css';

function AppContent() {
  const { isDark, setIsDark } = useContext(ThemeContext);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleLogin = (userData) => setUser(userData);
  const handleLogout = () => setUser(null);

  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <div className={isDark ? 'dark bg-slate-900 min-h-screen' : 'bg-white min-h-screen'}>
      <div className="App">
        <nav className={`${isDark ? 'bg-gray-900' : 'bg-gray-800'} text-white p-3 md:p-4`}>
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
              <h1 className="text-base sm:text-xl md:text-2xl font-bold truncate">🎆 Disaster Relief</h1>
              <button
                onClick={() => setIsDark(!isDark)}
                className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg transition text-sm"
              >
                {isDark ? '☀️' : '🌙'}
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs sm:text-sm">
              <Link to="/" className="hover:text-gray-300 transition px-2 py-1 bg-gray-700 rounded">Dashboard</Link>
              <Link to="/map" className="hover:text-gray-300 transition px-2 py-1 bg-gray-700 rounded">Map</Link>
              {user.role !== 'Citizen' && (
                <Link to="/ngo" className="hover:text-gray-300 transition px-2 py-1 bg-gray-700 rounded">NGO</Link>
              )}
              <Link to="/profile" className="hover:text-gray-300 transition px-2 py-1 bg-gray-700 rounded">Profile</Link>
              <Link to="/report" className="hover:text-gray-300 transition px-2 py-1 bg-gray-700 rounded">Report</Link>
              <button onClick={handleLogout} className="hover:text-gray-300 transition px-2 py-1 bg-gray-700 rounded">Logout</button>
            </div>
          </div>
        </nav>
        
        <Routes>
          <Route path="/" element={<ClientDashboard />} />
          <Route path="/map" element={<LeafletMap />} />
          <Route path="/ngo" element={<NGODashboard />} />
          <Route path="/profile" element={<UserProfile user={user} onLogout={handleLogout} />} />
          <Route path="/report" element={<UserPortal user={user} />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;