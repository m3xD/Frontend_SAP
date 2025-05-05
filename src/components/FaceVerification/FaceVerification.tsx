import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Modal, Button, Spinner, Alert } from 'react-bootstrap';
import { Camera, CheckCircle } from 'react-feather';
import { captureImageAsBlob } from '../../utils/imageUtils';
import axios from 'axios';
import { toast } from 'react-toastify';
import studentService from '../../services/studentService';

interface FaceVerificationProps {
  show: boolean;
  onHide: () => void;
  onVerificationSuccess: () => void;
  userId: string;
  userName: string; // Add user name prop
}

const FaceVerification: React.FC<FaceVerificationProps> = ({
  show,
  onHide,
  onVerificationSuccess,
  userId,
  userName
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verified, setVerified] = useState<boolean>(false);
  const [confidenceLevel, setConfidenceLevel] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('Position your face in the frame');
  
  // Initialize camera when modal opens
  useEffect(() => {
    if (show) {
      initializeCamera();
    }
    
    // Cleanup when modal closes
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [show]);
  
  const initializeCamera = useCallback(async () => {
    try {
      setErrorMessage(null);
      
      // Try with ideal constraints first
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          },
          audio: false 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        // Save stream reference for cleanup
        streamRef.current = stream;
        setStatusMessage('Camera initialized. Ready to verify.');
        return;
      } catch (initialError) {
        console.warn('Failed with ideal constraints, trying simpler constraints:', initialError);
        
        // If failed with ideal constraints, try with basic constraints
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: true,
            audio: false 
          });
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          
          // Save stream reference for cleanup
          streamRef.current = stream;
          setStatusMessage('Camera initialized with basic settings. Ready to verify.');
          return;
        } catch (fallbackError) {
          throw fallbackError; // Re-throw to be caught by the outer catch
        }
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      
      // Provide more specific error messages based on the error type
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          setErrorMessage('Camera access denied. Please grant camera permissions and refresh the page.');
        } else if (err.name === 'NotFoundError') {
          setErrorMessage('No camera detected. Please connect a camera and try again.');
        } else if (err.name === 'NotReadableError') {
          setErrorMessage('Camera is already in use by another application. Please close other applications using the camera and try again.');
        } else {
          setErrorMessage(`Camera error: ${err.name}. Please ensure your camera is working properly.`);
        }
      } else {
        setErrorMessage('Unable to access camera. Please ensure camera permissions are granted.');
      }
    }
  }, []);
  
  const captureAndVerify = useCallback(async () => {
    if (!videoRef.current) return;
    
    try {
      setIsCapturing(true);
      setStatusMessage('Capturing...');
      
      // Add a slight delay for the flash effect
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Capture image from video as a Blob
      const imageBlob = await captureImageAsBlob(videoRef.current, 'image/jpeg', 0.8, 640, 480);
      
      // Now verify the face
      setIsCapturing(false);
      setIsVerifying(true);
      setStatusMessage('Verifying your identity...');
      
      // Create FormData
      const formData = new FormData();
      formData.append('image', imageBlob, 'face_verification.jpg');
      formData.append('userId', userId);
      
      // Send to API using student service
      const response = await studentService.verifyFaceIdentity(formData, userName);
      
      // Check if response is valid
      if (!response || !response.id) {
        setErrorMessage('No matching face found in our system. Please try again or contact support.');
        toast.error('Identity verification failed - no matching face found.');
        return;
      }
      
      // Handle the response
      if (response.verified) {
        // Both confidence is high enough AND name matches
        setVerified(true);
        setConfidenceLevel(response.confidence);
        setStatusMessage(`Identity verified successfully! (${(response.confidence * 100).toFixed(1)}% confidence)`);
        toast.success('Identity verified successfully!');
        
        // Wait a moment before calling the success callback
        setTimeout(() => {
          onVerificationSuccess();
        }, 1500);
      } else {
        // Failed verification
        if (!response.nameMatches) {
          // Name doesn't match - security concern
          setErrorMessage(`Verification failed - identity mismatch. Expected "${userName}" but found "${response.name}".`);
          toast.error('Identity verification failed - name mismatch detected.');
        } else if (response.confidence) {
          // Name matches but confidence is too low
          setConfidenceLevel(response.confidence);
          setErrorMessage(`Verification failed - confidence level too low: ${(response.confidence * 100).toFixed(1)}%. Please try again with better lighting.`);
          toast.error('Identity verification failed. Please try again with better lighting and positioning.');
        } else {
          // Other verification error
          setErrorMessage('Verification failed. Please try again or contact support.');
          toast.error('Identity verification failed. Please try again.');
        }
      }
    } catch (err) {
      console.error('Error verifying face:', err);
      setErrorMessage('Verification failed. Please try again or contact support.');
      toast.error('Face verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  }, [userId, userName, onVerificationSuccess]);
  
  const handleRetry = () => {
    setErrorMessage(null);
    setVerified(false);
    setStatusMessage('Position your face in the frame');
    initializeCamera();
  };
  
  return (
    <Modal 
      show={show} 
      onHide={onHide}
      backdrop="static"
      keyboard={false}
      centered
      size="md"
      className="face-verification-modal"
    >
      <Modal.Header closeButton={!isVerifying}>
        <Modal.Title>Identity Verification</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {errorMessage && (
          <Alert variant="danger" className="mb-3">
            {errorMessage}
            <Button 
              variant="outline-danger" 
              size="sm" 
              className="mt-2 d-block" 
              onClick={handleRetry}
            >
              Retry
            </Button>
          </Alert>
        )}
        
        <div className="text-center mb-3">
          <p>{statusMessage}</p>
        </div>
        
        <div className="webcam-container position-relative mb-4" style={{ 
          aspectRatio: '4/3',
          background: '#1a1a1a',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          {verified ? (
            <div className="success-overlay d-flex flex-column align-items-center justify-content-center h-100 text-white" style={{ background: '#2c2c2c' }}>
              <CheckCircle size={48} className="text-success mb-2" />
              <h5>Verification Successful!</h5>
              <p>Your identity has been verified.</p>
              {confidenceLevel && (
                <div className="confidence-badge bg-success bg-opacity-25 px-3 py-1 rounded-pill mt-2">
                  Confidence: {(confidenceLevel * 100).toFixed(1)}%
                </div>
              )}
              <small className="text-muted mt-3">You will be redirected to the assessment shortly.</small>
            </div>
          ) : (
            <>
              <video 
                ref={videoRef} 
                className={`w-100 h-100 ${isCapturing ? 'capturing' : ''}`}
                autoPlay 
                playsInline
                style={{ 
                  objectFit: 'cover',
                  transform: 'scaleX(-1)'
                }}
              />
              {isCapturing && (
                <div className="position-absolute inset-0" style={{ 
                  background: 'rgba(255, 255, 255, 0.3)',
                  animation: 'fade 0.5s'
                }}></div>
              )}
            </>
          )}
        </div>
        
        <div className="d-flex justify-content-center">
          {!verified && (
            <Button 
              variant="primary" 
              onClick={captureAndVerify}
              disabled={isCapturing || isVerifying || !videoRef.current || !!errorMessage}
            >
              {isCapturing || isVerifying ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  {isCapturing ? 'Capturing...' : 'Verifying...'}
                </>
              ) : (
                <>
                  <Camera size={16} className="me-2" /> Verify My Identity
                </>
              )}
            </Button>
          )}
        </div>
      </Modal.Body>
      
      <Modal.Footer>
        <small className="text-muted w-100 text-center">
          This verification ensures that you are the registered user for this assessment.
        </small>
      </Modal.Footer>
    </Modal>
  );
};

export default FaceVerification;