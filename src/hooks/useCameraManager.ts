import { useState, useRef, useCallback, useEffect } from 'react';

// Keep track of who is currently using the camera
let currentConsumer: string | null = null;
let streamInstance: MediaStream | null = null;

export const useCameraManager = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(streamInstance);
  const consumerIdRef = useRef<string | null>(null); // To track which component instance uses this hook

  const requestCamera = useCallback(async (consumerId: string): Promise<MediaStream | null> => {
    consumerIdRef.current = consumerId; // Store who is asking

    // If the requesting consumer already has the stream, return it
    if (currentConsumer === consumerId && streamInstance) {
      setStream(streamInstance); // Ensure local state is updated
      return streamInstance;
    }

    // If someone else is using it, deny (or force release if needed - careful!)
    if (currentConsumer && currentConsumer !== consumerId) {
      console.warn(`Camera requested by ${consumerId} but already in use by ${currentConsumer}`);
      setError(`Camera is currently in use by another feature (${currentConsumer}).`);
      return null;
    }

    // If no one is using it, or if the previous user released it
    setIsLoading(true);
    setError(null);
    setStream(null); // Clear previous stream from state if any

    try {
      // Release any lingering tracks just in case
      if (streamInstance) {
        streamInstance.getTracks().forEach(track => track.stop());
        streamInstance = null;
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: false
      });

      streamInstance = newStream;
      currentConsumer = consumerId;
      setStream(newStream);
      setIsLoading(false);
      console.log(`Camera access granted to: ${consumerId}`);
      return newStream;

    } catch (err) {
      console.error(`Camera access error for ${consumerId}:`, err);
      streamInstance = null;
      currentConsumer = null;
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') setError('Camera access denied.');
        else if (err.name === 'NotFoundError') setError('No camera detected.');
        else if (err.name === 'NotReadableError') setError('Camera is already in use.');
        else setError(`Camera error: ${err.name}`);
      } else {
        setError('Unable to access camera.');
      }
      setIsLoading(false);
      setStream(null);
      return null;
    }
  }, []);

  const releaseCamera = useCallback((consumerId: string) => {
    // Only release if the calling consumer is the current one
    if (currentConsumer === consumerId && streamInstance) {
      console.log(`Camera released by: ${consumerId}`);
      streamInstance.getTracks().forEach(track => track.stop());
      streamInstance = null;
      currentConsumer = null;
      setStream(null); // Update state
      setError(null);
      setIsLoading(false);
    } else if (consumerIdRef.current === consumerId) {
       // If this instance requested but wasn't the active consumer or stream is already null
       console.log(`Camera release called by ${consumerId}, but it wasn't the active consumer or stream was null.`);
       setStream(null);
       setError(null);
       setIsLoading(false);
    }
  }, []);

  // Effect to release camera if the component using the hook unmounts
  useEffect(() => {
    const id = consumerIdRef.current;
    return () => {
      if (id) {
        console.log(`Cleanup: Releasing camera potentially held by ${id}`);
        releaseCamera(id);
      }
    };
  }, [releaseCamera]);


  return { stream, isLoading, error, requestCamera, releaseCamera };
};