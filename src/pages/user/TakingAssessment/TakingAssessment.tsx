import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, ProgressBar, Alert } from 'react-bootstrap';
import { Clock, CheckCircle, ArrowLeft, ArrowRight } from 'react-feather';

import MultiChoiceQuestion from '../../../components/MultiChoiceQuestion/MultiChoiceQuestion';
import TrueFalseQuestion from '../../../components/TrueFalseQuestion/TrueFalseQuestion';
import EssayQuestion from '../../../components/EssayQuestion/EssayQuestion';
import WebcamMonitor from '../../../components/WebcamMonitor/WebcamMonitor';
import { useTakingAssessment } from '../../../hooks/useTakingAssessment';
import './TakingAssessment.scss';
import { useAssessmentTakingContext } from '../../../contexts/AssessmentTakingContext';
import ResultsModal from '../../../components/ResultsModal/ResultsModal';

const TakingAssessment = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  
  const {
    loading,
    error,
    assessment,
    currentQuestionIndex,
    answers,
    isSubmitting,
    webcamWarnings,
    getCurrentQuestion,
    getCurrentAnswer,
    formatTimeRemaining,
    handleAnswerChange,
    handleNextQuestion,
    handlePrevQuestion,
    handleWebcamEvent,
    handleSubmitAssessment,
    calculateProgress
  } = useTakingAssessment(attemptId);
  
  // Render current question based on type
  const renderCurrentQuestion = () => {
    const question = getCurrentQuestion();
    if (!question) return null;
    
    const currentAnswer = getCurrentAnswer();
    
    switch (question.type) {
      case 'multiple-choice':
        return (
          <MultiChoiceQuestion
            question={question}
            selectedAnswer={currentAnswer}
            onChange={(value) => handleAnswerChange(question.id, value)}
          />
        );
      case 'true-false':
        return (
          <TrueFalseQuestion
            question={question}
            selectedAnswer={currentAnswer}
            onChange={(value) => handleAnswerChange(question.id, value)}
          />
        );
      case 'essay':
        return (
          <EssayQuestion
            question={question}
            answer={currentAnswer}
            onChange={(value) => handleAnswerChange(question.id, value)}
          />
        );
      default:
        return <p>Unsupported question type</p>;
    }
  };

  if (loading) {
    return (
      <Container className="taking-assessment">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading assessment...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="taking-assessment">
        <Alert variant="danger" className="my-4">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={() => navigate('/user/exams')}>
            Return to Exams
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <div className="taking-assessment">
      <Container fluid>
        <Row className="assessment-header">
          <Col>
            <h1>{assessment?.title}</h1>
            <div className="d-flex align-items-center">
              <Clock size={18} className="me-2" />
              <span className="remaining-time">{formatTimeRemaining()}</span>
            </div>
          </Col>
        </Row>
        
        <Row className="assessment-content">
          <Col md={3} className="webcam-sidebar">
            <Card className="webcam-card">
              <Card.Body>
                <h5>Webcam Monitoring</h5>
                <WebcamMonitor onEvent={handleWebcamEvent} attemptId={assessment?.attemptId} assessmentId={assessment?.assessmentId}/>
                
                {webcamWarnings > 0 && (
                  <Alert variant="warning" className="mt-3">
                    <small>Warnings: {webcamWarnings}</small>
                  </Alert>
                )}
              </Card.Body>
            </Card>
            
            <Card className="progress-card mt-3">
              <Card.Body>
                <h5>Progress</h5>
                <ProgressBar 
                  now={calculateProgress()} 
                  label={`${calculateProgress()}%`} 
                  variant="primary" 
                />
                <div className="d-flex justify-content-between mt-2">
                  <small>{answers.filter(a => a.answer.trim() !== '').length} of {assessment?.questions.length} answered</small>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={9}>
            <Card className="question-card">
              <Card.Body>
                <div className="question-header">
                  <h5>Question {currentQuestionIndex + 1} of {assessment?.questions.length}</h5>
                </div>
                
                <div className="question-content">
                  {renderCurrentQuestion()}
                </div>
                
                <div className="question-footer d-flex justify-content-between mt-4">
                  <Button 
                    variant="outline-secondary" 
                    onClick={handlePrevQuestion}
                    disabled={currentQuestionIndex === 0}
                  >
                    <ArrowLeft size={16} className="me-2" /> Previous
                  </Button>
                  
                  <div>
                    {currentQuestionIndex === (assessment?.questions.length || 0) - 1 ? (
                      <Button 
                        variant="success" 
                        onClick={handleSubmitAssessment}
                        disabled={isSubmitting}
                      >
                        <CheckCircle size={16} className="me-2" /> 
                        {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
                      </Button>
                    ) : (
                      <Button 
                        variant="primary" 
                        onClick={handleNextQuestion}
                      >
                        Next <ArrowRight size={16} className="ms-2" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      <ResultsModal />
    </div>
  );
};

export default TakingAssessment;
