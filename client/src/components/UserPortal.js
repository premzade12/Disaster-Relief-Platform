import React, { useState, useRef, useEffect, useContext } from 'react';
import axios from 'axios';
import { ThemeContext } from '../ThemeContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function UserPortal() {
  const { isDark } = useContext(ThemeContext);
  const [formData, setFormData] = useState({ title: '', location: '', description: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setCapturedImage(null);
    setAiResult(null);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'environment' } 
      });
      streamRef.current = stream;
      setShowCamera(true);
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = stream; }, 100);
    } catch (err) {
      alert('Camera access denied');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    setShowCamera(false);
  };

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (canvas && video) {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      canvas.toBlob((blob) => {
        const file = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });
        setSelectedFile(file);
        setCapturedImage(canvas.toDataURL());
        stopCamera();
        setAiResult(null);
      }, 'image/jpeg', 0.8);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return alert("Please upload an image");
    
    setLoading(true);
    setAiResult(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('image', selectedFile);

      const response = await axios.post(`${API_URL}/api/report`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setAiResult(response.data.ai_result);
      alert("✅ Report Submitted!");
      
      setFormData({ title: '', location: '', description: '' });
      setSelectedFile(null);
      setCapturedImage(null);
      
    } catch (err) {
      alert("Submission Failed");
    }
    setLoading(false);
  };

  return (
    <div className={`h-screen overflow-hidden py-6 sm:py-8 md:py-12 px-3 sm:px-4 ${isDark ? 'bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900' : 'bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50'}`}>
      <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 md:mb-10">
          <div className="inline-block bg-gradient-to-r from-red-600 to-orange-600 text-white px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold mb-3 sm:mb-4 shadow-lg animate-pulse">
            🚨 EMERGENCY REPORTING SYSTEM
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-2 sm:mb-3 bg-gradient-to-r from-red-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
            Report Disaster
          </h1>
          <p className={`text-base sm:text-lg md:text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>AI-Powered Real-Time Verification</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          {/* Form Section */}
          <div className={`rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border transform transition hover:scale-[1.01] ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="bg-gradient-to-r from-red-500 via-red-600 to-orange-600 p-4 sm:p-5 md:p-6">
              <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white flex items-center gap-2">
                📝 Incident Details
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-5 md:space-y-6">
              <div className="space-y-2">
                <label className={`block font-bold text-xs sm:text-sm uppercase tracking-wide ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  🏷️ Title
                </label>
                <input 
                  name="title" 
                  value={formData.title} 
                  onChange={handleChange} 
                  required 
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg sm:rounded-xl text-sm sm:text-base focus:outline-none focus:ring-4 transition ${isDark ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500 focus:ring-red-900' : 'bg-white border-gray-200 text-gray-900 focus:border-red-500 focus:ring-red-100'}`}
                  placeholder="e.g., Severe Flooding" 
                />
              </div>
              
              <div className="space-y-2">
                <label className={`block font-bold text-xs sm:text-sm uppercase tracking-wide ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  📍 Location
                </label>
                <input 
                  name="location" 
                  value={formData.location} 
                  onChange={handleChange} 
                  required 
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg sm:rounded-xl text-sm sm:text-base focus:outline-none focus:ring-4 transition ${isDark ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500 focus:ring-red-900' : 'bg-white border-gray-200 text-gray-900 focus:border-red-500 focus:ring-red-100'}`}
                  placeholder="City, State/Country" 
                />
              </div>
              
              <div className="space-y-2">
                <label className={`block font-bold text-xs sm:text-sm uppercase tracking-wide ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  📄 Description
                </label>
                <textarea 
                  name="description" 
                  rows="3" 
                  value={formData.description} 
                  onChange={handleChange} 
                  required 
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg sm:rounded-xl text-sm sm:text-base focus:outline-none focus:ring-4 transition resize-none ${isDark ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500 focus:ring-red-900' : 'bg-white border-gray-200 text-gray-900 focus:border-red-500 focus:ring-red-100'}`}
                  placeholder="Describe the disaster..."
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={loading || !selectedFile}
                className={`w-full py-3 sm:py-4 rounded-lg sm:rounded-xl font-black text-sm sm:text-base md:text-lg shadow-xl transform transition ${
                  loading || !selectedFile
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-red-600 to-orange-600 text-white hover:scale-105 hover:shadow-2xl'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    PROCESSING...
                  </span>
                ) : '🚨 SUBMIT EMERGENCY REPORT'}
              </button>
            </form>
          </div>

          {/* Image Upload Section */}
          <div className="space-y-4 sm:space-y-6">
            <div className={`rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-4 sm:p-5 md:p-6">
                <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white flex items-center gap-2">
                  📸 Evidence Upload
                </h2>
              </div>
              
              <div className="p-4 sm:p-6 md:p-8 space-y-3 sm:space-y-4">
                <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                  <button 
                    type="button" 
                    onClick={startCamera}
                    disabled={showCamera}
                    className={`py-2.5 sm:py-3 md:py-4 px-3 sm:px-4 md:px-6 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm shadow-lg transform transition ${
                      showCamera 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:scale-105 hover:shadow-xl'
                    }`}
                  >
                    📷 Camera
                  </button>
                  <label className="py-2.5 sm:py-3 md:py-4 px-3 sm:px-4 md:px-6 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm shadow-lg bg-gradient-to-r from-green-600 to-green-700 text-white hover:scale-105 hover:shadow-xl cursor-pointer text-center transform transition">
                    📁 Upload
                    <input type="file" onChange={handleFileChange} className="hidden" accept="image/*" />
                  </label>
                </div>

                {showCamera && (
                  <div className={`border-2 rounded-xl sm:rounded-2xl p-3 sm:p-4 ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
                    <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-lg sm:rounded-xl mb-3 sm:mb-4 shadow-lg" />
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <button 
                        type="button" 
                        onClick={capturePhoto} 
                        className="py-2 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-red-600 to-red-700 text-white hover:scale-105 transform transition shadow-lg"
                      >
                        ✓ Capture
                      </button>
                      <button 
                        type="button" 
                        onClick={stopCamera} 
                        className={`py-2 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold shadow-lg transform transition hover:scale-105 ${isDark ? 'bg-gray-600 text-white' : 'bg-gray-500 text-white'}`}
                      >
                        ✕ Cancel
                      </button>
                    </div>
                  </div>
                )}

                {(capturedImage || selectedFile) && (
                  <div className="border-2 border-green-500 rounded-xl sm:rounded-2xl p-3 sm:p-4 bg-gradient-to-br from-green-50 to-emerald-50">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm sm:text-base font-bold">✓</div>
                      <p className="font-bold text-green-700 text-xs sm:text-sm md:text-base">Image Ready</p>
                    </div>
                    {capturedImage ? (
                      <img src={capturedImage} alt="Captured" className="w-full rounded-lg sm:rounded-xl shadow-lg" />
                    ) : selectedFile && (
                      <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-inner">
                        <p className="text-xs sm:text-sm text-gray-600 font-medium truncate">📎 {selectedFile.name}</p>
                        <p className="text-xs text-gray-400 mt-1">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                      </div>
                    )}
                  </div>
                )}

                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </div>
            </div>

            {/* AI Result */}
            {aiResult && (
              <div className={`rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 sm:p-5 md:p-6">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white flex items-center gap-2">
                    🤖 AI Analysis
                  </h3>
                </div>
                <div className="p-4 sm:p-6 md:p-8">
                  <div className={`rounded-lg sm:rounded-xl p-4 sm:p-6 ${isDark ? 'bg-gray-700' : 'bg-gradient-to-br from-purple-50 to-indigo-50'}`}>
                    <pre className={`text-xs sm:text-sm whitespace-pre-wrap font-medium leading-relaxed ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{aiResult}</pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

export default UserPortal;
