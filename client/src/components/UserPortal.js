import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

function UserPortal() {
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

  // Cleanup camera stream on component unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Handle video stream setup
  useEffect(() => {
    if (showCamera && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [showCamera]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'environment' // Use back camera on mobile
        } 
      });
      streamRef.current = stream;
      setShowCamera(true);
      
      // Wait a bit then set video source
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      console.error('Camera error:', err);
      alert('Camera access denied or not available. Please check permissions and try again.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
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
    if (!selectedFile) return alert("Please upload an image or capture a photo for AI verification.");
    
    setLoading(true);
    setAiResult(null);

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('image', selectedFile);

      // Submit report with file upload and AI analysis
      const response = await axios.post('https://disaster-relief-platform-backend.onrender.com/api/report', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setAiResult(response.data.ai_result);
      alert("✅ Report Submitted! AI Analysis Complete.");
      
      // Reset form
      setFormData({ title: '', location: '', description: '' });
      setSelectedFile(null);
      setCapturedImage(null);
      
    } catch (err) {
      console.error(err);
      alert("Submission Failed. Is the backend running?");
    }
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-[85vh] p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="bg-yellow-400 p-6 text-center">
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-wide">📢 Report Incident</h2>
          <p className="text-yellow-900 font-medium text-sm mt-1">Submit details for AI Verification</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-700 font-bold mb-2">Title</label>
              <input name="title" value={formData.title} onChange={handleChange} required 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition" 
                placeholder="e.g., Heavy Flooding in Market" />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">Location</label>
              <input name="location" value={formData.location} onChange={handleChange} required 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition" 
                placeholder="City, Area" />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">Description</label>
              <textarea name="description" rows="3" value={formData.description} onChange={handleChange} required 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"></textarea>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg border border-red-100 dashed-border">
              <label className="block text-red-700 font-bold mb-3">Upload Evidence (Required)</label>
              
              {/* Camera and Upload Options */}
              <div className="flex gap-3 mb-4">
                <button 
                  type="button" 
                  onClick={startCamera}
                  disabled={showCamera}
                  className={`flex-1 py-3 px-4 rounded-lg font-bold transition flex items-center justify-center gap-2 ${
                    showCamera 
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  📷 Use Camera
                </button>
                <label className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-bold hover:bg-green-700 transition cursor-pointer flex items-center justify-center gap-2">
                  📁 Upload File
                  <input type="file" onChange={handleFileChange} className="hidden" accept="image/*" />
                </label>
              </div>

              {/* Camera View */}
              {showCamera && (
                <div className="mb-4 p-4 bg-gray-100 rounded-lg">
                  <p className="text-center text-gray-700 font-semibold mb-3">📷 Camera Active - Position your device to capture the disaster scene</p>
                  <div className="flex justify-center">
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      muted
                      className="w-full max-w-sm rounded-lg border-2 border-blue-400 shadow-lg"
                      style={{ maxHeight: '300px' }}
                    />
                  </div>
                  <div className="flex gap-3 mt-4 justify-center">
                    <button 
                      type="button" 
                      onClick={capturePhoto}
                      className="bg-red-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-red-700 transition shadow-lg flex items-center gap-2"
                    >
                      📸 CAPTURE PHOTO
                    </button>
                    <button 
                      type="button" 
                      onClick={stopCamera}
                      className="bg-gray-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-gray-700 transition shadow-lg flex items-center gap-2"
                    >
                      ❌ CANCEL
                    </button>
                  </div>
                </div>
              )}

              {/* Captured/Selected Image Preview */}
              {(capturedImage || selectedFile) && (
                <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-green-700 font-bold mb-3 text-center">✅ Image Ready for AI Analysis</p>
                  {capturedImage ? (
                    <div className="text-center">
                      <img src={capturedImage} alt="Captured" className="w-full max-w-sm mx-auto rounded-lg border-2 border-green-400 shadow-lg" />
                      <p className="text-green-600 text-sm mt-2 font-medium">📷 Photo captured from camera</p>
                    </div>
                  ) : selectedFile ? (
                    <div className="bg-green-100 p-4 rounded-lg border border-green-300 text-center">
                      <div className="text-4xl mb-2">📎</div>
                      <p className="text-green-800 font-bold">{selectedFile.name}</p>
                      <p className="text-green-600 text-sm">Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : null}
                </div>
              )}

              {/* Hidden canvas for image capture */}
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>

            {aiResult && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg animate-fade-in">
                <p className="font-bold text-blue-700">🤖 AI Analysis Result:</p>
                <pre className="text-gray-700 whitespace-pre-wrap mt-1 text-sm">{aiResult}</pre>
              </div>
            )}

            <button type="submit" disabled={loading}
              className={`w-full py-3 text-white font-bold rounded-lg shadow-lg transform transition hover:scale-105 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}>
              {loading ? "PROCESSING..." : "SUBMIT REPORT"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UserPortal;