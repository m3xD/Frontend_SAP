import React, { useEffect } from 'react';
import { Alert, Button } from 'react-bootstrap';
import { useFaceDetection } from '../../hooks/useFaceDetection'; // Assuming useFaceDetection now uses useCameraManager

interface WebcamMonitorProps {
  onEvent: (eventType: string, details: any) => void;
  attemptId?: string;
  assessmentId?: string;
}

const WebcamMonitor: React.FC<WebcamMonitorProps> = ({ onEvent, attemptId, assessmentId }) => {
  const {
    videoRef,
    canvasRef,
    isMonitoring,
    isLoading,
    error,
    startMonitoring
  } = useFaceDetection(attemptId, assessmentId, onEvent);

  // Start monitoring when component mounts (this will also request the camera)
  useEffect(() => {
    startMonitoring();
    // No cleanup needed here as useFaceDetection handles release on unmount
  }, [startMonitoring]);

  return (
    <div className="webcam-component">
      <div className="webcam-container">
        {error ? (
          <div className="webcam-overlay error">
            <div className="text-center">
              <p>{error}</p>
              {/* Use startMonitoring to retry, as it handles camera request and setup */}
              <Button variant="primary" size="sm" onClick={startMonitoring}>
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

        <canvas
          ref={canvasRef}
          className="webcam-canvas"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            display: isMonitoring ? 'block' : 'none' // Show canvas only when monitoring
          }}
        />

        {/* Status indicator can be simplified or enhanced */}
        <div className={`webcam-status ${error ? 'error' : isMonitoring ? 'active' : 'inactive'}`}></div>
      </div>

      {isLoading && (
        <Alert variant="info" className="mt-2 p-2 small">
          <small>Initializing webcam monitoring...</small>
        </Alert>
      )}

      <small className="d-block text-muted mt-2">
        Your webcam feed is being monitored. Please ensure your face is clearly visible.
      </small>
    </div>
  );
};

export default WebcamMonitor;