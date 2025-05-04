import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { captureImageAsBlob } from '../utils/imageUtils';
import { useAuth } from './useAuth';
import axios from 'axios';
import { useCameraManager } from './useCameraManager'; // Import the manager

export const useFaceRegistration = () => {
  const { authState } = useAuth();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Use the camera manager
  const {
    stream: cameraStream, // Get the stream from the manager
    isLoading: isCameraLoading,
    error: cameraError,
    requestCamera,
    releaseCamera
  } = useCameraManager();

  const [capturedImages, setCapturedImages] = useState<Blob[]>([]);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [progressMessage, setProgressMessage] = useState<string>('Initializing...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Keep for registration-specific errors
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  const hookId = 'faceRegistration'; // Unique ID for this consumer

  // Request camera on mount
  useEffect(() => {
    const initialize = async () => {
      const stream = await requestCamera(hookId);
      if (stream && videoRef.current) {
        videoRef.current.srcObject = stream;
        setProgressMessage('Position your face and start capturing');
      } else {
        setProgressMessage('Waiting for camera access...');
      }
    };
    initialize();

    // Return cleanup function to release camera
    return () => {
      releaseCamera(hookId);
    };
  }, [requestCamera, releaseCamera]); // Dependencies on manager functions

  // Update video element when stream changes
  useEffect(() => {
    if (cameraStream && videoRef.current) {
      if (videoRef.current.srcObject !== cameraStream) {
        videoRef.current.srcObject = cameraStream;
        setProgressMessage('Camera ready. Position your face.');
      }
    } else if (videoRef.current) {
      videoRef.current.srcObject = null; // Clear if stream is lost/released
    }
  }, [cameraStream]);

  // Handle camera errors from the manager
  useEffect(() => {
    setErrorMessage(cameraError); // Display camera errors
  }, [cameraError]);

  const captureImage = useCallback(async () => {
    // Ensure stream is active before capturing
    if (!videoRef.current || !cameraStream || videoRef.current.readyState < 2 || capturedImages.length >= 3) {
      console.warn("Capture attempt failed: Video not ready or stream not available.");
      setErrorMessage("Camera not ready. Please wait.");
      return;
    }
    try {
      setIsCapturing(true);
      setProgressMessage('Capturing...');
      await new Promise(resolve => setTimeout(resolve, 300));
      const imageBlob = await captureImageAsBlob(videoRef.current, 'image/jpeg', 0.8, 640, 480);
      setCapturedImages(prev => [...prev, imageBlob]);
      const newCount = capturedImages.length + 1;
      if (newCount < 3) setProgressMessage(`${newCount}/3 captured. Please continue.`);
      else setProgressMessage('All images captured. Ready to submit.');
    } catch (err) {
      console.error('Error capturing image:', err);
      setErrorMessage('Failed to capture image. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  }, [capturedImages.length, cameraStream]); // Add cameraStream dependency

  const resetCapture = useCallback(() => {
    setCapturedImages([]);
    setProgressMessage('Images reset. Ready to capture again.');
    setErrorMessage(null); // Clear local errors, camera errors handled separately
    setIsComplete(false);
  }, []);

  const submitRegistration = useCallback(async () => {
    if (capturedImages.length !== 3 || !authState.user?.id) {
      setErrorMessage('Please capture all 3 images before submitting');
      return;
    }
    setIsRegistering(true);
    setProgressMessage('Registering your face...');
    try {
      const formData = new FormData();
      formData.append('name', authState.user.name);
      for (let i = 0; i < capturedImages.length; i++) {
        formData.append('images', capturedImages[i], `face_${i+1}.jpg`);
      }
      console.log('Submitting face registration with FormData');
      const response = await axios.post('https://api-sap.m3xd.dev/ai/register', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (response.status === 200) {
        console.log('Face registration successful:', response);
        setIsComplete(true);
        setProgressMessage('Registration successful!');
        toast.success('Face registration completed successfully!');
        releaseCamera(hookId); // Release camera after successful registration
      } else {
        toast.error('Face registration failed. Please try again.');
        resetCapture(); // Don't release camera on failure, allow retry
      }
    } catch (err) {
      console.error('Error registering face:', err);
      setErrorMessage('Face registration failed. Please try again.');
      toast.error('Face registration failed. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  }, [capturedImages, authState.user?.name, resetCapture, releaseCamera]); // Add releaseCamera

  return {
    videoRef,
    capturedImages,
    isCapturing,
    progressMessage,
    isLoading: isCameraLoading || isRegistering,
    errorMessage: errorMessage || cameraError, // Show combined errors
    isRegistering,
    isComplete,
    captureImage,
    resetCapture,
    submitRegistration,
    requestCamera: () => requestCamera(hookId),
    releaseCamera: () => releaseCamera(hookId)
  };
};