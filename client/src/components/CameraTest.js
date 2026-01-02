import React, { useState, useRef, useEffect } from 'react';

function CameraTest() {
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    try {
      setError('');
      console.log('Requesting camera access...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      
      console.log('Camera access granted:', stream);
      streamRef.current = stream;
      setIsActive(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log('Video element set');
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError(`Camera error: ${err.message}`);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('Camera track stopped');
      });
    }
    setIsActive(false);
    setError('');
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Camera Test</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        <button
          onClick={isActive ? stopCamera : startCamera}
          className={`w-full py-2 px-4 rounded font-semibold ${
            isActive 
              ? 'bg-red-600 text-white hover:bg-red-700' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isActive ? 'Stop Camera' : 'Start Camera'}
        </button>
        
        {isActive && (
          <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full"
              style={{ maxHeight: '300px' }}
            />
          </div>
        )}
        
        <div className="text-sm text-gray-600">
          <p><strong>Browser:</strong> {navigator.userAgent.split(' ')[0]}</p>
          <p><strong>HTTPS:</strong> {window.location.protocol === 'https:' ? 'Yes' : 'No'}</p>
          <p><strong>MediaDevices:</strong> {navigator.mediaDevices ? 'Supported' : 'Not supported'}</p>
        </div>
      </div>
    </div>
  );
}

export default CameraTest;