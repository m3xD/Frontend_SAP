import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Nav, Form, Button, Alert, Table, Badge, Accordion, Modal, Tabs, Tab } from 'react-bootstrap';
import { ArrowLeft, Plus, Edit, Trash2, Eye, Settings, CheckSquare, FileText, HelpCircle, BarChart2 } from 'react-feather';
import { QuestionData } from '../../../types/QuestionTypes';
import DeleteConfirmationModal from '../../../components/DeleteConfirmationModal/DeleteConfirmationModal';
import { useAssessmentDetail } from '../../../hooks/useAssessmentDetail';
import { useAssessmentQuestions } from '../../../hooks/useAssessmentQuestions';
import './AssessmentDetail.scss';

const AssessmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Use our custom hooks
  const {
    assessment,
    questions,
    settings,
    loading,
    error,
    isEditingSettings,
    setIsEditingSettings,
    updateSettings,
    publishAssessment
  } = useAssessmentDetail(id);
  
  const {
    addQuestion,
    updateQuestion,
    deleteQuestion
  } = useAssessmentQuestions(id);
  
  // Local state
  const [activeTab, setActiveTab] = useState<string>('questions');
  const [showDeleteQuestionModal, setShowDeleteQuestionModal] = useState<boolean>(false);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);
  const [showAddQuestionModal, setShowAddQuestionModal] = useState<boolean>(false);
  const [newQuestion, setNewQuestion] = useState<QuestionData>({
    type: 'multiple-choice',
    text: '',
    options: [
      { optionId: 'o1', text: '' },
      { optionId: 'o2', text: '' }
    ],
    correctAnswer: '',
    points: 1
  });

  // Add option to new question
  const handleAddOption = () => {
    if (newQuestion.options.length >= 6) return;
    
    setNewQuestion(prev => ({
      ...prev,
      options: [
        ...prev.options,
        { optionId: `o${prev.options.length + 1}`, text: '' }
      ]
    }));
  };
  
  // Remove option from new question
  const handleRemoveOption = (optionId: string) => {
    if (newQuestion.options.length <= 2) return;
    
    setNewQuestion(prev => ({
      ...prev,
      options: prev.options.filter(o => o.optionId !== optionId),
      correctAnswer: prev.correctAnswer === optionId ? '' : prev.correctAnswer
    }));
  };
  
  // Handle question type change
  const handleQuestionTypeChange = (type: string) => {
    let options = newQuestion.options;
    
    if (type === 'true-false') {
      options = [
        { optionId: 'true', text: 'True' },
        { optionId: 'false', text: 'False' }
      ];
    } else if (type === 'essay') {
      options = [];
    } else if (newQuestion.type === 'true-false' || newQuestion.type === 'essay') {
      options = [
        { optionId: 'o1', text: '' },
        { optionId: 'o2', text: '' }
      ];
    }
    
    setNewQuestion(prev => ({
      ...prev,
      type,
      options,
      correctAnswer: ''
    }));
  };
  
  // Add new question
  const handleAddQuestionSubmit = async () => {
    const success = await addQuestion(newQuestion);
    if (success) {
      setShowAddQuestionModal(false);
      // Reset form
      setNewQuestion({
        type: 'multiple-choice',
        text: '',
        options: [
          { optionId: 'o1', text: '' },
          { optionId: 'o2', text: '' }
        ],
        correctAnswer: '',
        points: 1
      });
    }
  };
  
  // Handle settings form change
  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (settings) {
      const newSettings = {
        ...settings,
        [name]: type === 'checkbox' ? checked : value
      };
      setSettingsForm(newSettings);
    }
  };
  
  // Local state for settings form
  const [settingsForm, setSettingsForm] = useState(settings);
  
  // Handle save settings
  const handleSaveSettings = async () => {
    if (settingsForm) {
      await updateSettings(settingsForm);
    }
  };
  
  // Handle delete question
  const handleDeleteQuestionClick = (questionId: string) => {
    setQuestionToDelete(questionId);
    setShowDeleteQuestionModal(true);
  };
  
  // Delete question confirmation
  const handleDeleteQuestionConfirm = async () => {
    if (!questionToDelete) return;
    
    const success = await deleteQuestion(questionToDelete);
    if (success) {
      setShowDeleteQuestionModal(false);
      setQuestionToDelete(null);
    }
  };
  
  // Handle add question click
  const handleAddQuestionClick = () => {
    setNewQuestion({
      type: 'multiple-choice',
      text: '',
      options: [
        { optionId: 'o1', text: '' },
        { optionId: 'o2', text: '' }
      ],
      correctAnswer: '',
      points: 1
    });
    setShowAddQuestionModal(true);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="assessment-detail">
        <Container>
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading assessment details...</p>
          </div>
        </Container>
      </div>
    );
  }
  
  if (error || !assessment) {
    return (
      <div className="assessment-detail">
        <Container>
          <div className="d-flex align-items-center mb-4">
            <Button
              variant="outline-secondary"
              className="me-3"
              onClick={() => navigate('/admin/assessments')}
            >
              <ArrowLeft size={16} className="me-2" />
              Back to Assessments
            </Button>
          </div>
          
          <Alert variant="danger" className="my-4">
            <h4>Error</h4>
            <p>{error || 'Assessment not found'}</p>
            <Button 
              variant="outline-danger" 
              onClick={() => navigate('/admin/assessments')}
            >
              Return to Assessments
            </Button>
          </Alert>
        </Container>
      </div>
    );
  }
  
  return (
    <div className="assessment-detail">
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center">
            <Button
              variant="outline-secondary"
              className="me-3"
              onClick={() => navigate('/admin/assessments')}
            >
              <ArrowLeft size={16} className="me-2" />
              Back
            </Button>
            <div>
              <h1>{assessment.title}</h1>
              <div className="d-flex align-items-center">
                <Badge bg="info" pill className="me-2">{assessment.subject}</Badge>
                <Badge 
                  bg={assessment.status === 'active' ? 'success' : 'secondary'} 
                  className="me-2"
                >
                  {assessment.status}
                </Badge>
                <span className="text-muted small">
                  Created: {formatDate(assessment.createdDate)}
                </span>
              </div>
            </div>
          </div>
          
          <div>
            {assessment.status !== 'active' && (
              <Button 
                variant="success" 
                onClick={publishAssessment}
                disabled={questions.length === 0}
              >
                <CheckSquare size={16} className="me-2" />
                Publish Assessment
              </Button>
            )}
          </div>
        </div>
        
        <Row>
          <Col md={3}>
            <Card className="mb-4">
              <Card.Body>
                <div className="assessment-summary">
                  <div className="summary-item">
                    <div className="summary-label">Duration</div>
                    <div className="summary-value">{assessment.duration} min</div>
                  </div>
                  <div className="summary-item">
                    <div className="summary-label">Questions</div>
                    <div className="summary-value">{questions.length}</div>
                  </div>
                  <div className="summary-item">
                    <div className="summary-label">Passing Score</div>
                    <div className="summary-value">{assessment.passingScore}%</div>
                  </div>
                  <div className="summary-item">
                    <div className="summary-label">Due Date</div>
                    <div className="summary-value">
                      {assessment.dueDate ? 
                        formatDate(assessment.dueDate) : 
                        'No due date'
                      }
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
            
            <Card className="mb-4">
              <Card.Body>
                <Nav className="flex-column assessment-sidebar-nav">
                  <Nav.Item>
                    <Nav.Link 
                      active={activeTab === 'questions'} 
                      onClick={() => setActiveTab('questions')}
                    >
                      <FileText size={16} className="me-2" />
                      Questions
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link 
                      active={activeTab === 'settings'} 
                      onClick={() => setActiveTab('settings')}
                    >
                      <Settings size={16} className="me-2" />
                      Settings
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link 
                      active={activeTab === 'preview'} 
                      onClick={() => setActiveTab('preview')}
                    >
                      <Eye size={16} className="me-2" />
                      Preview
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link 
                      active={activeTab === 'help'} 
                      onClick={() => setActiveTab('help')}
                    >
                      <HelpCircle size={16} className="me-2" />
                      Help
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={9}>
            {activeTab === 'questions' && (
              <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Assessment Questions</h5>
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={handleAddQuestionClick}
                  >
                    <Plus size={16} className="me-2" />
                    Add Question
                  </Button>
                </Card.Header>
                <Card.Body>
                  {questions.length === 0 ? (
                    <div className="text-center py-4">
                      <FileText size={48} className="text-muted mb-3" />
                      <p>No questions added yet. Click "Add Question" to start building your assessment.</p>
                      <Button 
                        variant="primary" 
                        onClick={handleAddQuestionClick}
                      >
                        <Plus size={16} className="me-2" />
                        Add Question
                      </Button>
                    </div>
                  ) : (
                    <Accordion>
                      {questions.map((question, index) => (
                        <Accordion.Item key={question.id} eventKey={question.id}>
                          <Accordion.Header>
                            <div className="d-flex w-100 justify-content-between align-items-center pe-4">
                              <div>
                                <Badge bg="secondary" className="me-2">{index + 1}</Badge>
                                <Badge bg="info" className="me-2">{question.type}</Badge>
                                <span>{question.text.length > 50 ? `${question.text.substring(0, 50)}...` : question.text}</span>
                              </div>
                              <div>
                                <Badge bg="primary">{question.points} pts</Badge>
                              </div>
                            </div>
                          </Accordion.Header>
                          <Accordion.Body>
                            <div className="question-content mb-3">
                              <div className="question-text mb-3">{question.text}</div>
                              
                              {question.type !== 'essay' && (
                                <div className="question-options">
                                  <Table className="options-table">
                                    <thead>
                                      <tr>
                                        <th style={{ width: '70px' }}>Option</th>
                                        <th>Text</th>
                                        <th style={{ width: '100px' }}>Correct</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {question.options.map(option => (
                                        <tr key={option.optionId}>
                                          <td>{option.optionId}</td>
                                          <td>{option.text}</td>
                                          <td className="text-center">
                                            {option.optionId === question.correctAnswer && (
                                              <CheckSquare size={18} className="text-success" />
                                            )}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </Table>
                                </div>
                              )}
                            </div>
                            
                            <div className="d-flex justify-content-end">
                              <Button 
                                variant="outline-primary" 
                                size="sm" 
                                className="me-2"
                                onClick={() => navigate(`/admin/assessments/${id}/questions/${question.id}/edit`)}
                              >
                                <Edit size={16} className="me-2" />
                                Edit
                              </Button>
                              <Button 
                                variant="outline-danger" 
                                size="sm"
                                onClick={() => handleDeleteQuestionClick(question.id)}
                              >
                                <Trash2 size={16} className="me-2" />
                                Delete
                              </Button>
                            </div>
                          </Accordion.Body>
                        </Accordion.Item>
                      ))}
                    </Accordion>
                  )}
                </Card.Body>
              </Card>
            )}
            
            {activeTab === 'settings' && settingsForm && (
              <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Assessment Settings</h5>
                  {isEditingSettings ? (
                    <div>
                      <Button 
                        variant="outline-secondary" 
                        size="sm" 
                        className="me-2"
                        onClick={() => {
                          setSettingsForm(assessment.settings);
                          setIsEditingSettings(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={handleSaveSettings}
                      >
                        Save Changes
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => setIsEditingSettings(true)}
                    >
                      <Edit size={16} className="me-2" />
                      Edit Settings
                    </Button>
                  )}
                </Card.Header>
                <Card.Body>
                  <Form>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Question Delivery</Form.Label>
                          <Form.Check 
                            type="checkbox"
                            id="randomize-questions"
                            label="Randomize question order"
                            name="randomizeQuestions"
                            checked={settingsForm.randomizeQuestions}
                            onChange={handleSettingsChange}
                            disabled={!isEditingSettings}
                          />
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                          <Form.Label>Results & Feedback</Form.Label>
                          <Form.Check 
                            type="checkbox"
                            id="show-result"
                            label="Show results after completion"
                            name="showResult"
                            checked={settingsForm.showResult}
                            onChange={handleSettingsChange}
                            disabled={!isEditingSettings}
                          />
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                          <Form.Label>Attempts</Form.Label>
                          <Form.Check 
                            type="checkbox"
                            id="allow-retake"
                            label="Allow retaking assessment"
                            name="allowRetake"
                            checked={settingsForm.allowRetake}
                            onChange={handleSettingsChange}
                            disabled={!isEditingSettings}
                          />
                        </Form.Group>
                        
                        {settingsForm.allowRetake && (
                          <Form.Group className="mb-3">
                            <Form.Label>Maximum Attempts</Form.Label>
                            <Form.Control
                              type="number"
                              min="1"
                              name="maxAttempts"
                              value={settingsForm.maxAttempts}
                              onChange={handleSettingsChange}
                              disabled={!isEditingSettings}
                            />
                          </Form.Group>
                        )}
                      </Col>
                      
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Time Limit</Form.Label>
                          <Form.Check 
                            type="checkbox"
                            id="time-limit"
                            label="Enforce time limit"
                            name="timeLimitEnforced"
                            checked={settingsForm.timeLimitEnforced}
                            onChange={handleSettingsChange}
                            disabled={!isEditingSettings}
                          />
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                          <Form.Label>Proctoring</Form.Label>
                          <Form.Check 
                            type="checkbox"
                            id="webcam-required"
                            label="Require webcam monitoring"
                            name="requireWebcam"
                            checked={settingsForm.requireWebcam}
                            onChange={handleSettingsChange}
                            disabled={!isEditingSettings}
                          />
                          <Form.Check 
                            type="checkbox"
                            id="prevent-tab-switching"
                            label="Prevent tab switching"
                            name="preventTabSwitching"
                            checked={settingsForm.preventTabSwitching}
                            onChange={handleSettingsChange}
                            disabled={!isEditingSettings}
                          />
                          <Form.Check 
                            type="checkbox"
                            id="identity-verification"
                            label="Require identity verification"
                            name="requireIdentityVerification"
                            checked={settingsForm.requireIdentityVerification}
                            onChange={handleSettingsChange}
                            disabled={!isEditingSettings}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Form>
                </Card.Body>
              </Card>
            )}
            
            {activeTab === 'preview' && (
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Assessment Preview</h5>
                </Card.Header>
                <Card.Body>
                  <Tabs defaultActiveKey="studentView" className="mb-3">
                    <Tab eventKey="studentView" title="Student View">
                      <div className="preview-container">
                        <div className="assessment-preview-header">
                          <h3>{assessment.title}</h3>
                          <div className="d-flex align-items-center">
                            <Badge bg="info" pill className="me-2">{assessment.subject}</Badge>
                            <span className="me-3">Duration: {assessment.duration} min</span>
                            <span>Passing Score: {assessment.passingScore}%</span>
                          </div>
                        </div>
                        
                        {questions.length === 0 ? (
                          <div className="text-center py-4">
                            <p>No questions to preview. Add questions to see how the assessment will appear to students.</p>
                          </div>
                        ) : (
                          <div className="question-preview-list">
                            {questions.map((question, index) => (
                              <div key={question.id} className="question-preview-item">
                                <div className="question-number">Question {index + 1}</div>
                                <div className="question-text mb-3">{question.text}</div>
                                
                                {question.type === 'multiple-choice' && (
                                  <div className="options-list">
                                    {question.options.map(option => (
                                      <div key={option.optionId} className="option-item">
                                        <Form.Check
                                          type="radio"
                                          id={`preview-${question.id}-${option.optionId}`}
                                          name={`preview-${question.id}`}
                                          label={option.text}
                                          disabled
                                        />
                                      </div>
                                    ))}
                                  </div>
                                )}
                                
                                {question.type === 'true-false' && (
                                  <div className="options-list">
                                    <div className="option-item">
                                      <Form.Check
                                        type="radio"
                                        id={`preview-${question.id}-true`}
                                        name={`preview-${question.id}`}
                                        label="True"
                                        disabled
                                      />
                                    </div>
                                    <div className="option-item">
                                      <Form.Check
                                        type="radio"
                                        id={`preview-${question.id}-false`}
                                        name={`preview-${question.id}`}
                                        label="False"
                                        disabled
                                      />
                                    </div>
                                  </div>
                                )}
                                
                                {question.type === 'essay' && (
                                  <Form.Control
                                    as="textarea"
                                    rows={4}
                                    placeholder="Student's answer will appear here"
                                    disabled
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </Tab>
                    <Tab eventKey="resultsView" title="Results View">
                      <div className="preview-container">
                        <Alert variant="info">
                          This is a preview of how results will appear to students if "Show results after completion" is enabled.
                        </Alert>
                        
                        <div className="results-preview">
                          <div className="results-header">
                            <h4>Assessment Results</h4>
                            <div className="d-flex align-items-center">
                              <Badge bg="success" className="me-2">Passed</Badge>
                              <span className="score">Score: 85%</span>
                            </div>
                          </div>
                          
                          <div className="results-summary">
                            <Row>
                              <Col md={4}>
                                <div className="summary-box">
                                  <div className="summary-value">85%</div>
                                  <div className="summary-label">Overall Score</div>
                                </div>
                              </Col>
                              <Col md={4}>
                                <div className="summary-box">
                                  <div className="summary-value">8/10</div>
                                  <div className="summary-label">Correct Answers</div>
                                </div>
                              </Col>
                              <Col md={4}>
                                <div className="summary-box">
                                  <div className="summary-value">45 min</div>
                                  <div className="summary-label">Time Spent</div>
                                </div>
                              </Col>
                            </Row>
                          </div>
                          
                          <div className="feedback-section">
                            <h5>Feedback</h5>
                            <p>
                              Good work! You've demonstrated a solid understanding of the core concepts.
                              Continue to practice with more advanced examples to strengthen your skills.
                            </p>
                          </div>
                        </div>
                      </div>
                    </Tab>
                  </Tabs>
                </Card.Body>
              </Card>
            )}
            
            {activeTab === 'help' && (
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Help & Guidelines</h5>
                </Card.Header>
                <Card.Body>
                  <Accordion defaultActiveKey="0">
                    <Accordion.Item eventKey="0">
                      <Accordion.Header>
                        <div className="d-flex align-items-center">
                          <FileText size={16} className="me-2" />
                          Creating Effective Questions
                        </div>
                      </Accordion.Header>
                      <Accordion.Body>
                        <ul className="help-list">
                          <li>Use clear, concise language that students will understand</li>
                          <li>Make sure each question tests a specific learning objective</li>
                          <li>For multiple-choice, provide plausible distractors (wrong answers)</li>
                          <li>Avoid negatively worded questions (e.g., "Which is NOT...")</li>
                          <li>Ensure only one answer is correct for objective questions</li>
                          <li>For essay questions, clearly state what you're looking for</li>
                        </ul>
                      </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="1">
                      <Accordion.Header>
                        <div className="d-flex align-items-center">
                          <Settings size={16} className="me-2" />
                          Configuring Assessment Settings
                        </div>
                      </Accordion.Header>
                      <Accordion.Body>
                        <ul className="help-list">
                          <li><strong>Randomize Questions:</strong> Shuffles questions to reduce cheating</li>
                          <li><strong>Show Results:</strong> Determines if students see their scores and feedback immediately</li>
                          <li><strong>Retakes:</strong> Allow students to attempt the assessment multiple times</li>
                          <li><strong>Time Limit:</strong> Set a maximum duration for completing the assessment</li>
                          <li><strong>Proctoring:</strong> Enable webcam monitoring and other anti-cheating measures</li>
                        </ul>
                      </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="2">
                      <Accordion.Header>
                        <div className="d-flex align-items-center">
                          <BarChart2 size={16} className="me-2" />
                          Understanding Assessment Results
                        </div>
                      </Accordion.Header>
                      <Accordion.Body>
                        <p>
                          After students complete your assessment, you'll be able to view detailed analytics including:
                        </p>
                        <ul className="help-list">
                          <li>Overall pass/fail rates</li>
                          <li>Average scores and completion times</li>
                          <li>Most challenging questions</li>
                          <li>Individual student performance</li>
                          <li>Time spent on each question</li>
                        </ul>
                        <p>
                          These insights can help you improve your assessments and teaching strategies.
                        </p>
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
                  
                  <Alert variant="info" className="mt-4">
                    <h6>Need More Help?</h6>
                    <p className="mb-0">
                      Visit our <a href="#">documentation center</a> for detailed guides or contact <a href="mailto:support@example.com">support@example.com</a> for assistance.
                    </p>
                  </Alert>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>
      
      {/* Delete Question Modal */}
      <DeleteConfirmationModal
        show={showDeleteQuestionModal}
        onHide={() => setShowDeleteQuestionModal(false)}
        title="Delete Question"
        message="Are you sure you want to delete this question? This action cannot be undone."
        confirmButtonText="Delete Question"
        onConfirm={handleDeleteQuestionConfirm}
      />
      
      {/* Add Question Modal */}
      <Modal 
        show={showAddQuestionModal} 
        onHide={() => setShowAddQuestionModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Add New Question</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Question Type</Form.Label>
              <Form.Select
                value={newQuestion.type}
                onChange={(e) => handleQuestionTypeChange(e.target.value)}
              >
                <option value="multiple-choice">Multiple Choice</option>
                <option value="true-false">True/False</option>
                <option value="essay">Essay</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Question Text</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newQuestion.text}
                onChange={(e) => setNewQuestion(prev => ({ ...prev, text: e.target.value }))}
                placeholder="Enter your question here"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Points</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={newQuestion.points}
                onChange={(e) => setNewQuestion(prev => ({ ...prev, points: Number(e.target.value) }))}
              />
            </Form.Group>
            
            {newQuestion.type !== 'essay' && (
              <>
                <Form.Group className="mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <Form.Label>Options</Form.Label>
                    {newQuestion.type === 'multiple-choice' && (
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={handleAddOption}
                        disabled={newQuestion.options.length >= 6}
                      >
                        <Plus size={14} className="me-1" />
                        Add Option
                      </Button>
                    )}
                  </div>
                  
                  {newQuestion.options.map((option, index) => (
                    <div key={option.optionId} className="d-flex mb-2 align-items-center">
                      <Form.Check
                        type="radio"
                        id={`option-${option.optionId}`}
                        name="correctAnswer"
                        className="me-2"
                        checked={newQuestion.correctAnswer === option.optionId}
                        onChange={() => setNewQuestion(prev => ({ ...prev, correctAnswer: option.optionId }))}
                      />
                      <Form.Control
                        value={option.text}
                        onChange={(e) => {
                          const updatedOptions = [...newQuestion.options];
                          updatedOptions[index].text = e.target.value;
                          setNewQuestion(prev => ({ ...prev, options: updatedOptions }));
                        }}
                        placeholder={`Option ${index + 1}`}
                        disabled={newQuestion.type === 'true-false'}
                      />
                      {newQuestion.type === 'multiple-choice' && newQuestion.options.length > 2 && (
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          className="ms-2"
                          onClick={() => handleRemoveOption(option.optionId)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </div>
                  ))}
                </Form.Group>
                
                <Form.Text className="text-muted">
                  Select the radio button next to the correct answer.
                </Form.Text>
              </>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddQuestionModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddQuestionSubmit}>
            Add Question
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AssessmentDetail;
