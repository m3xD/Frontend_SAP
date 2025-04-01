import React, { useState, useEffect, useRef } from 'react';
import { Alert, Button } from 'react-bootstrap';

interface WebcamMonitorProps {
  onEvent: (eventType: string, details: any) => void;
}

const WebcamMonitor: React.FC<WebcamMonitorProps> = ({ onEvent }) => {
  const [isWebcamActive, setIsWebcamActive] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Counter for face detection simulation
  const [noFaceCounter, setNoFaceCounter] = useState<number>(0);
  
  // Set up webcam on component mount
  useEffect(() => {
    initializeWebcam();
    
    return () => {
      // Clean up on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  // Simulate periodic face detection checks
  useEffect(() => {
    if (!isWebcamActive) return;
    
    const faceCheckInterval = setInterval(() => {
      // Simulate face detection - randomly determine if face is detected or not
      const faceDetected = Math.random() > 0.2; // 80% chance face is detected
      
      if (!faceDetected) {
        setNoFaceCounter(prev => prev + 1);
        setWarning("Your face is not clearly visible");
        
        if (noFaceCounter >= 3) {
          onEvent('warning', { 
            type: 'face_not_detected', 
            duration: noFaceCounter * 5,
            message: 'Your face has not been detected for some time. Please position yourself in front of the camera.'
          });
        }
      } else {
        setNoFaceCounter(0);
        setWarning(null);
      }
    }, 5000);
    
    return () => clearInterval(faceCheckInterval);
  }, [isWebcamActive, noFaceCounter, onEvent]);
  
  // Initialize webcam
  const initializeWebcam = async () => {
    try {
      setError(null);
      
      // Request webcam access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: false 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      streamRef.current = stream;
      setIsWebcamActive(true);
      
    } catch (err) {
      console.error('Error accessing webcam:', err);
      setError('Unable to access webcam. Please ensure camera permissions are granted.');
      onEvent('error', { type: 'webcam_access_denied' });
    }
  };
  
  // Retry webcam access
  const handleRetry = () => {
    initializeWebcam();
  };
  
  return (
    <div className="webcam-component">
      <div className="webcam-container">
        {error ? (
          <div className="webcam-overlay error">
            <div className="text-center">
              <p>{error}</p>
              <Button variant="primary" size="sm" onClick={handleRetry}>
                Retry Camera Access
              </Button>
            </div>
          </div>
        ) : null}
        
        <video 
          ref={videoRef}
          className="webcam-feed"
          autoPlay
          playsInline
          muted
        />
        
        <div className={`webcam-status ${warning ? 'warning' : isWebcamActive ? '' : 'inactive'}`}></div>
      </div>
      
      {warning && (
        <Alert variant="warning" className="mt-2 p-2 small">
          <small>{warning}</small>
        </Alert>
      )}
      
      <small className="d-block text-muted mt-2">
        Your webcam feed is being monitored. Please ensure your face is clearly visible.
      </small>
    </div>
  );
};

export default WebcamMonitor;