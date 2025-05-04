// hooks/useFaceDetection.ts

import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import analyticsService from '../services/analyticsService';
import { useCameraManager } from './useCameraManager'; // Import the manager

// Configuration constants
const YAW_THRESHOLD_DEGREES = 30;
const PITCH_THRESHOLD_DEGREES = 20;
const GAZE_THRESHOLD_RATIO = 0.45;
const LOOKING_AWAY_DURATION_MS = 1000;
const COOLDOWN_PERIOD_MS = 10000;
const MAX_FACES_ALLOWED = 1;
const ENABLE_MULTI_FACE_CHECK = true;
const ENABLE_HEAD_POSE_CHECK = true;
const ENABLE_GAZE_CHECK = true;
const YAW_ESTIMATION_MULTIPLIER = 90;
const PITCH_ESTIMATION_MULTIPLIER = 90;

// MediaPipe settings
const MEDIAPIPE_CONFIDENCE = 0.5;
const MAX_NUM_FACES_MEDIAPIPE = ENABLE_MULTI_FACE_CHECK ? 5 : 1;

export const useFaceDetection = (attemptId?: string, assessmentId?: string, onViolation?: (eventType: string, details: any) => void) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Use the camera manager
  const {
    stream: cameraStream,
    isLoading: isCameraLoading,
    error: cameraError,
    requestCamera,
    releaseCamera
  } = useCameraManager();

  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isMonitoring, setIsMonitoring] = useState<boolean>(false);

  // Face detection state
  const faceMeshRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const isProcessingRef = useRef<boolean>(false);

  const hookId = 'faceDetection'; // Unique ID

  // Cleanup function to release camera on unmount
  useEffect(() => {
    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }
      releaseCamera(hookId);
      setIsMonitoring(false);
    };
  }, [releaseCamera]);

  // Update video element when stream changes
  useEffect(() => {
    if (cameraStream && videoRef.current) {
      if (videoRef.current.srcObject !== cameraStream) {
        videoRef.current.srcObject = cameraStream;
      }
    } else if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [cameraStream]);

  const setupFaceMesh = useCallback(async () => {
    if (!cameraStream || !videoRef.current || typeof window === 'undefined' || !(window as any).FaceMesh || !(window as any).Camera) {
      console.warn("Cannot setup FaceMesh: Stream or libraries not ready.");
      return false;
    }

    try {
      if (!(window as any).FaceMesh || !(window as any).Camera) {
        await loadMediaPipeScripts();

        async function loadMediaPipeScripts() {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh';
          script.async = true;
          document.body.appendChild(script);
          return new Promise<void>((resolve, reject) => {
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load MediaPipe scripts'));
          });
        }
      }
      const { FaceMesh, Camera, FACEMESH_TESSELATION, FACEMESH_FACE_OVAL, FACEMESH_LEFT_IRIS, FACEMESH_RIGHT_IRIS, drawConnectors } = (window as any);
      if (!FaceMesh || !Camera) throw new Error('MediaPipe face mesh libraries not available');

      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }

      faceMeshRef.current = new FaceMesh({ locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}` });
      faceMeshRef.current.setOptions({
        maxNumFaces: MAX_NUM_FACES_MEDIAPIPE,
        refineLandmarks: true,
        minDetectionConfidence: MEDIAPIPE_CONFIDENCE,
        minTrackingConfidence: MEDIAPIPE_CONFIDENCE
      });
      faceMeshRef.current.onResults((results: any) => { /* ... onResults logic ... */ });

      cameraRef.current = new Camera(videoRef.current, {
        onFrame: async () => {
          if (!isProcessingRef.current && videoRef.current && videoRef.current.readyState >= 2 && faceMeshRef.current) {
            isProcessingRef.current = true;
            try {
              await faceMeshRef.current.send({ image: videoRef.current });
            } catch (error) {
              console.error("Error sending frame:", error);
            } finally {
              isProcessingRef.current = false;
            }
          }
        },
        width: 640,
        height: 480
      });

      await cameraRef.current.start();
      setIsMonitoring(true);
      return true;

    } catch (err) {
      console.error('Error setting up FaceMesh:', err);
      setIsMonitoring(false);
      return false;
    }
  }, [cameraStream]);

  const startMonitoring = useCallback(async () => {
    if (isMonitoring) return true;

    const stream = await requestCamera(hookId);
    if (!stream) {
      console.error("Failed to get camera stream for monitoring.");
      return false;
    }

    const success = await setupFaceMesh();
    return success;
  }, [isMonitoring, requestCamera, setupFaceMesh]);

  return {
    videoRef,
    canvasRef,
    isVerified,
    isMonitoring,
    isLoading: isCameraLoading,
    error: cameraError,
    verifyFaceIdentity: async () => { /* ... */ },
    startMonitoring,
    requestCamera: () => requestCamera(hookId),
    releaseCamera: () => releaseCamera(hookId)
  };
};