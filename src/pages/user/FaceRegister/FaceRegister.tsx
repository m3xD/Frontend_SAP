import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, ProgressBar, Alert } from 'react-bootstrap';
import { Camera, CheckCircle, RefreshCw } from 'react-feather';
import { useNavigate } from 'react-router-dom';
import './FaceRegister.scss';
import { useFaceRegistration } from '../../../hooks/useFaceRegistration';

const FaceRegister: React.FC = () => {
  const navigate = useNavigate();
  const {
    videoRef,
    capturedImages,
    isCapturing,
    progressMessage,
    errorMessage,
    isRegistering,
    isComplete,
    captureImage,
    resetCapture,
    submitRegistration,
    requestCamera,
    releaseCamera
  } = useFaceRegistration();

  useEffect(() => {
    return () => {
      console.log('FaceRegister: Cleaning up camera and object URLs');
      releaseCamera();
      capturedImages.forEach(imageBlob => {
        if (imageBlob) {
          URL.revokeObjectURL(URL.createObjectURL(imageBlob));
        }
      });
    };
  }, [releaseCamera, capturedImages]);

  return (
    <Container className="face-register-page">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="face-register-card">
            <Card.Header>
              <h4 className="mb-0">Face Registration</h4>
            </Card.Header>
            
            <Card.Body>
              {errorMessage && (
                <Alert variant="danger" className="mb-3">
                  {errorMessage}
                  <Button 
                    variant="outline-danger" 
                    size="sm" 
                    className="mt-2 d-block" 
                    onClick={requestCamera}
                  >
                    Retry Camera Access
                  </Button>
                </Alert>
              )}
              
              <div className="text-center mb-3">
                <p>Please position your face within the frame and capture 3 clear images for facial recognition.</p>
              </div>
              
              <div className="webcam-container mb-4">
                {isComplete ? (
                  <div className="registration-complete">
                    <CheckCircle size={48} className="text-success mb-2" />
                    <h5>Registration Complete!</h5>
                    <p>Your face has been successfully registered.</p>
                  </div>
                ) : (
                  <div className="video-wrapper">
                    <video 
                      ref={videoRef} 
                      className={`webcam-video ${isCapturing ? 'flash' : ''}`}
                      autoPlay 
                      playsInline
                      muted
                    />
                    {isCapturing && <div className="capturing-overlay" />}
                  </div>
                )}
              </div>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Progress: {capturedImages.length}/3 images</span>
                  <span>{progressMessage}</span>
                </div>
                <ProgressBar now={capturedImages.length * 33.333} />
              </div>
              
              <div className="captured-images mb-4">
                <Row className='d-flex justify-content-center'>
                  {[0, 1, 2].map(index => (
                    <Col key={index} xs={4} md={2} className="mb-2">
                      <div className="image-placeholder">
                        {capturedImages[index] ? (
                          <img src={URL.createObjectURL(capturedImages[index])} alt={`Capture ${index + 1}`} />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
              
              <div className="d-flex justify-content-between">
                <Button 
                  variant="outline-secondary" 
                  onClick={resetCapture}
                  disabled={capturedImages.length === 0 || isRegistering}
                >
                  <RefreshCw size={16} className="me-2" /> Reset
                </Button>
                
                {isComplete ? (
                  <Button variant="primary" onClick={() => navigate(-1)}>
                    Return
                  </Button>
                ) : (
                  <Button 
                    variant="primary" 
                    onClick={capturedImages.length < 3 ? captureImage : submitRegistration}
                    disabled={isCapturing || isRegistering || !videoRef.current?.srcObject}
                  >
                    {isRegistering ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Registering...
                      </>
                    ) : capturedImages.length < 3 ? (
                      <>
                        <Camera size={16} className="me-2" /> Capture Image ({capturedImages.length + 1}/3)
                      </>
                    ) : (
                      'Complete Registration'
                    )}
                  </Button>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default FaceRegister;
