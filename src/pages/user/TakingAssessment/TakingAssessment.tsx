import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, ProgressBar, Alert } from 'react-bootstrap';
import { Clock, CheckCircle, ArrowLeft, ArrowRight } from 'react-feather';

import { toast } from 'react-toastify';
import studentService from '../../../services/studentService';
import { StartAssessment, Answer } from '../../../types/StudentServiceTypes';
import './TakingAssessment.scss';
import MultiChoiceQuestion from '../../../components/MultiChoiceQuestion/MultiChoiceQuestion';
import TrueFalseQuestion from '../../../components/TrueFalseQuestion/TrueFalseQuestion';
import EssayQuestion from '../../../components/EssayQuestion/EssayQuestion';
import WebcamMonitor from '../../../components/WebcamMonitor/WebcamMonitor';

const TakingAssessment = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  
  // Assessment state
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [assessment, setAssessment] = useState<StartAssessment | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [webcamWarnings, setWebcamWarnings] = useState<number>(0);

  // Load assessment data
  useEffect(() => {
    const fetchAttemptDetails = async () => {
      if (!attemptId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // const attemptDetails = await studentService.getAttemptDetails(attemptId);
        
        // For demo purposes - normally you'd transform attemptDetails to StartAssessment
        // This is a placeholder to simulate fetching assessment data
        const mockAssessment: StartAssessment = {
          attemptId: attemptId,
          assessmentId: "assessment-123",
          title: "Sample Assessment",
          duration: 60, // 60 minutes
          timeLimit: true,
          endsAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          questions: [
            {
              id: "q1",
              type: "multiple-choice",
              text: "Which of the following is a JavaScript framework?",
              options: [
                { id: "o1", text: "React" },
                { id: "o2", text: "Angular" },
                { id: "o3", text: "Vue" },
                { id: "o4", text: "All of the above" }
              ]
            },
            {
              id: "q2",
              type: "true-false",
              text: "TypeScript is a superset of JavaScript.",
              options: [
                { id: "t", text: "True" },
                { id: "f", text: "False" }
              ]
            },
            {
              id: "q3",
              type: "essay",
              text: "Explain the difference between React and Angular.",
              options: []
            }
          ],
          settings: {
            randomizeQuestions: false,
            showResults: true,
            preventTabSwitching: true,
            requireWebcam: true
          }
        };
        
        setAssessment(mockAssessment);
        
        // Initialize answers array
        const initialAnswers = mockAssessment.questions.map(q => ({
          questionId: q.id,
          answer: ""
        }));
        setAnswers(initialAnswers);
        
        // Set remaining time
        const endTime = new Date(mockAssessment.endsAt).getTime();
        const now = Date.now();
        const timeRemaining = Math.max(0, Math.floor((endTime - now) / 1000));
        setRemainingTime(timeRemaining);
        
      } catch (err) {
        setError("Failed to load assessment. Please try again.");
        console.error('Error loading assessment:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAttemptDetails();
  }, [attemptId]);

  // Timer effect
  useEffect(() => {
    if (!assessment || remainingTime <= 0) return;
    
    const timer = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [assessment, remainingTime]);

  // Handle time up
  const handleTimeUp = () => {
    toast.error("Time's up! Your assessment will be submitted automatically.");
    handleSubmitAssessment();
  };

  // Format time remaining
  const formatTimeRemaining = () => {
    const hours = Math.floor(remainingTime / 3600);
    const minutes = Math.floor((remainingTime % 3600) / 60);
    const seconds = remainingTime % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle answer change
  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => 
      prev.map(a => a.questionId === questionId ? { ...a, answer: value } : a)
    );
    
    // You would typically save this to the server periodically
    // This is where you'd call studentService.saveAnswer
  };

  // Navigate to next question
  const handleNextQuestion = () => {
    if (!assessment) return;
    
    if (currentQuestionIndex < assessment.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  // Navigate to previous question
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Handle webcam events
  const handleWebcamEvent = (eventType: string, details: any) => {
    if (eventType === 'warning') {
      setWebcamWarnings(prev => prev + 1);
      toast.warning(details.message);
      
      // In a real implementation, you would log this to the server
      // studentService.submitWebcamMonitorEvent(attemptId, { eventType, details });
    }
  };

  // Submit assessment
  const handleSubmitAssessment = async () => {
    if (!assessment || !attemptId) return;
    
    try {
      setIsSubmitting(true);
      
      // In a real app, you would call the API to submit
      // await studentService.submitAssessment(attemptId);
      
      toast.success("Assessment submitted successfully!");
      navigate('/user/exams'); // Redirect to exam list
      
    } catch (err) {
      console.error('Error submitting assessment:', err);
      toast.error("Failed to submit assessment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate progress
  const calculateProgress = () => {
    if (!assessment) return 0;
    
    const answeredCount = answers.filter(a => a.answer.trim() !== '').length;
    return Math.round((answeredCount / assessment.questions.length) * 100);
  };

  // Render current question based on type
  const renderCurrentQuestion = () => {
    if (!assessment) return null;
    
    const question = assessment.questions[currentQuestionIndex];
    if (!question) return null;
    
    const currentAnswer = answers.find(a => a.questionId === question.id)?.answer || '';
    
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
                <WebcamMonitor onEvent={handleWebcamEvent} />
                
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
    </div>
  );
};

export default TakingAssessment;
