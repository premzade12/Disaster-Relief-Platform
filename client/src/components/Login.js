import React, { useState, useContext } from 'react';
import axios from 'axios';
import { ThemeContext } from '../ThemeContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function Login({ onLogin }) {
  const { isDark } = useContext(ThemeContext);
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    contactNumber: '',
    role: 'Citizen'
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const response = await axios.post(`${API_URL}${endpoint}`, formData);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      onLogin(response.data.user);
    } catch (err) {
      alert(err.response?.data?.error || 'Authentication failed');
    }
  };

  return (
    <div className={`h-screen flex items-center justify-center px-3 sm:px-4 ${isDark ? 'bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900' : 'bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50'}`}>
      <div className={`max-w-md w-full rounded-xl sm:rounded-2xl shadow-2xl p-5 sm:p-6 md:p-8 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
        <h2 className={`text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {isRegister ? '🚨 Register' : '🔐 Login'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {isRegister && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className={`block text-xs sm:text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>First Name</label>
                <input 
                  type="text"
                  name="firstName" 
                  value={formData.firstName} 
                  onChange={handleChange} 
                  required 
                  className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} 
                />
              </div>
                <div>
                  <label className={`block text-xs sm:text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Last Name</label>
                  <input 
                    type="text"
                    name="lastName" 
                    value={formData.lastName} 
                    onChange={handleChange} 
                    required 
                    className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} 
                  />
                </div>
              </div>
              <div>
                <label className={`block text-xs sm:text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Contact Number</label>
                <input 
                  type="tel"
                  name="contactNumber" 
                  value={formData.contactNumber} 
                  onChange={handleChange} 
                  required 
                  className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} 
                />
              </div>
              <div>
                <label className={`block text-xs sm:text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Role</label>
                <select name="role" value={formData.role} onChange={handleChange} className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
                  <option>Citizen</option>
                  <option>NGO</option>
                  <option>Authority</option>
                </select>
              </div>
            </>
          )}
          
          <div>
            <label className={`block text-xs sm:text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              required 
              autoComplete="email"
              className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} 
            />
          </div>
          
          <div>
            <label className={`block text-xs sm:text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Password</label>
            <input 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              required 
              autoComplete="current-password"
              className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} 
            />
          </div>

          <button type="submit" className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white text-sm sm:text-base font-bold rounded-lg hover:scale-105 transition">
            {isRegister ? 'Register' : 'Login'}
          </button>
        </form>

        <p className={`text-center mt-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button onClick={() => setIsRegister(!isRegister)} className="text-red-600 font-bold">
            {isRegister ? 'Login' : 'Register'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
