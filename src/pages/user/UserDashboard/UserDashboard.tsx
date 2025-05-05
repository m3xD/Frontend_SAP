import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Badge, Button, Alert, Spinner, Table } from "react-bootstrap";
import { Calendar, Clock, Award, BookOpen, CheckCircle, ArrowRight, AlertTriangle } from "react-feather";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import studentService from "../../../services/studentService";
import { StartAssessment, AssessmentResult } from "../../../types/StudentServiceTypes";
import { toast } from "react-toastify";
import "./UserDashboard.scss";
import { formatDate } from "../../../utils/dateUtils";
import FaceVerification from "../../../components/FaceVerification/FaceVerification";

const UserDashboard: React.FC = () => {
  const { authState } = useAuth();
  const navigate = useNavigate();
  
  // Dashboard state
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [availableAssessments, setAvailableAssessments] = useState<any>({ content: [], totalElements: 0 });
  const [recentResults, setRecentResults] = useState<AssessmentResult[]>([]);
  const [stats, setStats] = useState({
    availableCount: 0,
    completedCount: 0,
    averageScore: 0,
    upcomingAssessments: 0
  });
  const [startingAssessment, setStartingAssessment] = useState<string | null>(null);

  // Face verification modal state
  const [showVerificationModal, setShowVerificationModal] = useState<boolean>(false);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch available assessments and recent results in parallel
        const [assessmentsResponse] = await Promise.all([
          studentService.getAvailableAssessments(0, 5)
          // In a real app, you would also fetch recent results
          // studentService.getRecentResults(5)
        ]);
        
        setAvailableAssessments(assessmentsResponse);
        
        // Simulate recent results for demo purposes
        const mockResults: AssessmentResult[] = [
          {
            attemptId: "attempt-1",
            assessmentId: "assessment-1",
            title: "Introduction to JavaScript",
            // date: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
            score: 85,
            duration: 45,
            status: "passed",
            feedback: "Good work on JavaScript fundamentals!"
          },
          {
            attemptId: "attempt-2",
            assessmentId: "assessment-2",
            title: "React Fundamentals",
            // date: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
            score: 92,
            duration: 60,
            status: "passed",
            feedback: "Excellent understanding of React concepts!"
          }
        ];
        
        setRecentResults(mockResults);
        
        // Set summary stats
        setStats({
          availableCount: assessmentsResponse.totalElements || 3,
          completedCount: mockResults.length,
          averageScore: mockResults.reduce((acc, result) => acc + result.score, 0) / (mockResults.length || 1),
          upcomingAssessments: 2
        });
        
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Handle assessment selection for face verification
  const handleSelectAssessment = (assessmentId: string) => {
    setSelectedAssessmentId(assessmentId);
    setShowVerificationModal(true);
  };

  // Start an assessment after verification
  const handleVerificationSuccess = async () => {
    if (!selectedAssessmentId) return;
    
    try {
      setStartingAssessment(selectedAssessmentId);
      setShowVerificationModal(false);
      
      // Call the API to start the assessment
      const response = await studentService.startAssessment(selectedAssessmentId);
      
      // Save the assessment data to session storage
      sessionStorage.setItem(`assessment_${response.attemptId}`, JSON.stringify(response));
      
      // Navigate to the assessment taking page
      navigate(`/user/assessments/take/${response.attemptId}`);
      
    } catch (err) {
      console.error('Error starting assessment:', err);
      toast.error('Failed to start assessment. Please try again.');
    } finally {
      setStartingAssessment(null);
      setSelectedAssessmentId(null);
    }
  };

  if (loading) {
    return (
      <div className="user-dashboard">
        <Container className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading dashboard data...</p>
        </Container>
      </div>
    );
  }

  return (
    <div className="user-dashboard">
      <Container>
        <div className="dashboard-header">
          <h1>Welcome, {authState.user?.name}</h1>
          <p className="text-muted">Track your assessments and progress</p>
        </div>

        {error && (
          <Alert variant="danger" className="mb-4">
            <Alert.Heading>Error</Alert.Heading>
            <p>{error}</p>
          </Alert>
        )}

        {/* Stats Cards */}
        <Row className="stats-section">
          <Col md={3}>
            <Card className="stat-card">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="stat-icon">
                    <BookOpen size={24} />
                  </div>
                  <div className="stat-info">
                    <h3>{stats.availableCount}</h3>
                    <p>Available Assessments</p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3}>
            <Card className="stat-card">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="stat-icon">
                    <CheckCircle size={24} />
                  </div>
                  <div className="stat-info">
                    <h3>{stats.completedCount}</h3>
                    <p>Completed Assessments</p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3}>
            <Card className="stat-card">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="stat-icon">
                    <Award size={24} />
                  </div>
                  <div className="stat-info">
                    <h3>{stats.averageScore}%</h3>
                    <p>Average Score</p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3}>
            <Card className="stat-card">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="stat-icon">
                    <Calendar size={24} />
                  </div>
                  <div className="stat-info">
                    <h3>{stats.upcomingAssessments}</h3>
                    <p>Upcoming</p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Available Assessments and Recent Results */}
        <Row className="mt-4">
          <Col lg={8}>
            <Card className="assessment-card">
              <Card.Header>
                <h5 className="mb-0">Available Assessments</h5>
              </Card.Header>
              <Card.Body>
                {availableAssessments.content && availableAssessments.content.length > 0 ? (
                  <div className="assessment-list">
                    {availableAssessments.content.map((assessment: any) => (
                      <div key={assessment.id} className="assessment-item">
                        <div className="assessment-info">
                          <h6>{assessment.title}</h6>
                          <div className="assessment-meta">
                            <Badge bg="primary" className="me-2">{assessment.subject}</Badge>
                            <span className="me-3"><Clock size={14} className="me-1" /> {assessment.duration} min</span>
                            <span><Award size={14} className="me-1" /> {assessment.passingScore}% to pass</span>
                          </div>
                        </div>
                        <Button 
                          variant="primary" 
                          size="sm"
                          disabled={startingAssessment === assessment.id}
                          onClick={() => handleSelectAssessment(assessment.id)}
                        >
                          {startingAssessment === assessment.id ? (
                            <>
                              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                              <span className="ms-2">Starting...</span>
                            </>
                          ) : (
                            <>
                              Start Assessment <ArrowRight size={16} className="ms-1" />
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <BookOpen size={32} className="text-muted mb-2" />
                    <p>No assessments available at the moment.</p>
                  </div>
                )}
                
                {availableAssessments.totalElements > 5 && (
                  <div className="text-center mt-3">
                    <Button 
                      variant="outline-primary" 
                      onClick={() => navigate('/user/assessments')}
                    >
                      View All Assessments
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={4}>
            <Card className="results-card">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Recent Results</h5>
                <Badge bg="info" pill>Last 30 days</Badge>
              </Card.Header>
              <Card.Body>
                {recentResults.length > 0 ? (
                  <Table responsive className="results-table">
                    <thead>
                      <tr>
                        <th>Assessment</th>
                        <th>Score</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentResults.map(result => (
                        <tr key={result.attemptId}>
                          <td>
                            <div>
                              <div className="fw-medium">{result.title}</div>
                              <small className="text-muted">{formatDate(result.date)}</small>
                            </div>
                          </td>
                          <td>{result.score}%</td>
                          <td>
                            <Badge 
                              bg={result.status === 'passed' ? 'success' : 'danger'}
                            >
                              {result.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <div className="text-center py-4">
                    <Award size={32} className="text-muted mb-2" />
                    <p>No assessment results yet.</p>
                  </div>
                )}
                
                <div className="text-center mt-2">
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => navigate('/user/results')}
                  >
                    View All Results
                  </Button>
                </div>
              </Card.Body>
            </Card>
            
            <Card className="mt-4">
              <Card.Header>
                <h5 className="mb-0">Need Help?</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex align-items-start mb-3">
                  <AlertTriangle size={20} className="text-warning me-2 mt-1" />
                  <div>
                    <h6>Assessment Guidelines</h6>
                    <p className="small text-muted mb-0">
                      Make sure you have a stable internet connection and a working webcam before starting your assessment.
                    </p>
                  </div>
                </div>
                
                <div className="d-flex align-items-start">
                  <CheckCircle size={20} className="text-success me-2 mt-1" />
                  <div>
                    <h6>Technical Support</h6>
                    <p className="small text-muted mb-0">
                      If you encounter any issues, contact technical support at <a href="mailto:support@example.com">support@example.com</a>
                    </p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Face Verification Modal */}
      {authState.user && (
        <FaceVerification 
          show={showVerificationModal} 
          onHide={() => setShowVerificationModal(false)}
          onVerificationSuccess={handleVerificationSuccess}
          userId={authState.user.id}
          userName={authState.user.name}
        />
      )}
    </div>
  );
};

export default UserDashboard;