import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '../../../../test-utils';
import TakingAssessment from '../../../../pages/user/TakingAssessment/TakingAssessment';
import { useTakingAssessment } from '../../../../hooks/useTakingAssessment';
import { useParams, useNavigate } from 'react-router-dom';

// Mock dependencies
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
  useNavigate: jest.fn()
}));

jest.mock('../../../../hooks/useTakingAssessment');

// Mock components that are used by TakingAssessment
jest.mock('../../../../components/FaceAttentionChecker/FaceAttentionChecker', () => {
  return function MockFaceAttentionChecker({
    onViolationDetected,
  }: {
    onViolationDetected: (reason: string) => void;
  }) {
    return (
      <div data-testid="face-checker">
        <button onClick={() => onViolationDetected('FACE_NOT_DETECTED')}>
          Simulate Violation
        </button>
      </div>
    );
  };
});

jest.mock('../../../../components/MultiChoiceQuestion/MultiChoiceQuestion', () => {
  type Option = { optionId: string; text: string };
  type Question = { text: string; options: Option[] };
  return function MockMultiChoiceQuestion({
    question,
    selectedAnswer,
    onChange,
  }: {
    question: Question;
    selectedAnswer: string;
    onChange: (value: string) => void;
  }) {
    return (
      <div data-testid="multi-choice-question">
        <p>{question.text}</p>
        <select
          data-testid="answer-select"
          value={selectedAnswer || ''}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select an answer</option>
          {question.options.map((option: Option) => (
            <option key={option.optionId} value={option.optionId}>
              {option.text}
            </option>
          ))}
        </select>
      </div>
    );
  };
});

jest.mock('../../../../components/TrueFalseQuestion/TrueFalseQuestion', () => {
  type Question = { text: string };
  return function MockTrueFalseQuestion({
    question,
    /* eslint-disable @typescript-eslint/no-unused-vars */
    selectedAnswer,
    onChange,
  }: {
    question: Question;
    selectedAnswer: string;
    onChange: (value: string) => void;
  }) {
    return (
      <div data-testid="true-false-question">
        <p>{question.text}</p>
        <button onClick={() => onChange('true')}>True</button>
        <button onClick={() => onChange('false')}>False</button>
      </div>
    );
  };
});

jest.mock('../../../../components/EssayQuestion/EssayQuestion', () => {
  type EssayQuestionProps = {
    question: { text: string };
    answer: string;
    onChange: (value: string) => void;
  };
  return function MockEssayQuestion({ question, answer, onChange }: EssayQuestionProps) {
    return (
      <div data-testid="essay-question">
        <p>{question.text}</p>
        <textarea 
          value={answer || ''} 
          onChange={(e) => onChange(e.target.value)}
          data-testid="essay-textarea"
        />
      </div>
    );
  };
});

jest.mock('../../../../components/ResultsModal/ResultsModal', () => {
  type ResultsModalProps = {
    onClose: () => void;
  };
  return function MockResultsModal({ onClose }: ResultsModalProps) {
    return (
      <div data-testid="results-modal">
        <button onClick={onClose}>Close Results</button>
      </div>
    );
  };
});

describe('TakingAssessment', () => {
  // Setup default mock values
  const mockAssessment = {
    attemptId: 'attempt-123',
    assessmentId: 'assessment-1',
    title: 'JavaScript Basics',
    questions: [
      {
        id: 'q1',
        text: 'What is JavaScript?',
        type: 'multiple-choice',
        options: [
          { optionId: 'a', text: 'A programming language' },
          { optionId: 'b', text: 'A markup language' }
        ]
      },
      {
        id: 'q2',
        text: 'Is JavaScript related to Java?',
        type: 'true-false'
      },
      {
        id: 'q3',
        text: 'Explain JavaScript closures.',
        type: 'essay'
      }
    ],
    settings: {
      timeLimit: 60,
      requireProctoring: true
    }
  };

  // Mock hook implementation
  const mockHookImplementation = {
    loading: false,
    error: null,
    assessment: mockAssessment,
    attemptId: 'attempt-123',
    currentQuestionIndex: 0,
    answers: [
      { questionId: 'q1', answer: '' },
      { questionId: 'q2', answer: '' },
      { questionId: 'q3', answer: '' }
    ],
    isSubmitting: false,
    webcamWarnings: 0,
    submittedResult: null,
    getCurrentQuestion: jest.fn().mockImplementation(() => mockAssessment.questions[0]),
    getCurrentAnswer: jest.fn().mockReturnValue(''),
    formatTimeRemaining: jest.fn().mockReturnValue('59:45'),
    handleAnswerChange: jest.fn(),
    handleNextQuestion: jest.fn(),
    handlePrevQuestion: jest.fn(),
    handleSubmitAssessment: jest.fn(),
    calculateProgress: jest.fn().mockReturnValue(0),
    handleViolationDetected: jest.fn(),
    handleCloseResultsModal: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up mocks
    (useParams as jest.Mock).mockReturnValue({ attemptId: 'attempt-123' });
    (useNavigate as jest.Mock).mockReturnValue(jest.fn());
    (useTakingAssessment as jest.Mock).mockReturnValue(mockHookImplementation);
  });

  it('should render loading state', () => {
    // Override the hook to return loading state
    (useTakingAssessment as jest.Mock).mockReturnValue({
      ...mockHookImplementation,
      loading: true
    });
    
    render(<TakingAssessment />);
    
    expect(screen.getByText('Loading assessment...')).toBeInTheDocument();
  });

  it('should render error state', () => {
    // Override the hook to return error state
    (useTakingAssessment as jest.Mock).mockReturnValue({
      ...mockHookImplementation,
      error: 'Failed to load assessment'
    });
    
    render(<TakingAssessment />);
    
    expect(screen.getByText(/Failed to load assessment/)).toBeInTheDocument();
  });

  it('should render the assessment with multiple-choice question', () => {
    render(<TakingAssessment />);
    
    // Check header content
    expect(screen.getByText('JavaScript Basics')).toBeInTheDocument();
    expect(screen.getByText('59:45')).toBeInTheDocument();
    
    // Check that the first question is displayed
    expect(screen.getByTestId('multi-choice-question')).toBeInTheDocument();
    expect(screen.getByText('What is JavaScript?')).toBeInTheDocument();
    
    // Check navigation buttons
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Previous')).toBeDisabled(); // First question
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  it('should navigate to next question when next button is clicked', () => {
    render(<TakingAssessment />);
    
    // Click next button
    fireEvent.click(screen.getByText('Next'));
    
    // Check that handleNextQuestion was called
    expect(mockHookImplementation.handleNextQuestion).toHaveBeenCalled();
  });

  it('should navigate to previous question when previous button is clicked', () => {
    // Override to show we're on the second question
    (useTakingAssessment as jest.Mock).mockReturnValue({
      ...mockHookImplementation,
      currentQuestionIndex: 1,
      getCurrentQuestion: jest.fn().mockImplementation(() => mockAssessment.questions[1])
    });
    
    render(<TakingAssessment />);
    
    // Click previous button
    fireEvent.click(screen.getByText('Previous'));
    
    // Check that handlePrevQuestion was called
    expect(mockHookImplementation.handlePrevQuestion).toHaveBeenCalled();
  });

  it('should render true-false question type correctly', () => {
    // Override to show we're on the second question
    (useTakingAssessment as jest.Mock).mockReturnValue({
      ...mockHookImplementation,
      currentQuestionIndex: 1,
      getCurrentQuestion: jest.fn().mockImplementation(() => mockAssessment.questions[1])
    });
    
    render(<TakingAssessment />);
    
    // Check that the second question is displayed (true-false)
    expect(screen.getByTestId('true-false-question')).toBeInTheDocument();
    expect(screen.getByText('Is JavaScript related to Java?')).toBeInTheDocument();
  });

  it('should render essay question type correctly', () => {
    // Override to show we're on the third question
    (useTakingAssessment as jest.Mock).mockReturnValue({
      ...mockHookImplementation,
      currentQuestionIndex: 2,
      getCurrentQuestion: jest.fn().mockImplementation(() => mockAssessment.questions[2])
    });
    
    render(<TakingAssessment />);
    
    // Check that the third question is displayed (essay)
    expect(screen.getByTestId('essay-question')).toBeInTheDocument();
    expect(screen.getByText('Explain JavaScript closures.')).toBeInTheDocument();
  });

  it('should show submit button on last question', () => {
    // Override to show we're on the last question
    (useTakingAssessment as jest.Mock).mockReturnValue({
      ...mockHookImplementation,
      currentQuestionIndex: 2,
      getCurrentQuestion: jest.fn().mockImplementation(() => mockAssessment.questions[2])
    });
    
    render(<TakingAssessment />);
    
    // Check that the submit button is displayed
    expect(screen.getByText('Submit Assessment')).toBeInTheDocument();
  });

  it('should submit assessment when submit button is clicked', () => {
    // Override to show we're on the last question
    (useTakingAssessment as jest.Mock).mockReturnValue({
      ...mockHookImplementation,
      currentQuestionIndex: 2,
      getCurrentQuestion: jest.fn().mockImplementation(() => mockAssessment.questions[2])
    });
    
    render(<TakingAssessment />);
    
    // Click submit button
    fireEvent.click(screen.getByText('Submit Assessment'));
    
    // Check that handleSubmitAssessment was called
    expect(mockHookImplementation.handleSubmitAssessment).toHaveBeenCalled();
  });

  it('should handle answer changes', () => {
    render(<TakingAssessment />);
    
    // Find answer select and change it
    const answerSelect = screen.getByTestId('answer-select');
    fireEvent.change(answerSelect, { target: { value: 'a' } });
    
    // Check that handleAnswerChange was called with the right parameters
    expect(mockHookImplementation.handleAnswerChange).toHaveBeenCalledWith('q1', 'a');
  });

  it('should handle webcam violations', () => {
    render(<TakingAssessment />);
    
    // Find the simulate violation button and click it
    const violationButton = screen.getByText('Simulate Violation');
    fireEvent.click(violationButton);
    
    // Check that handleViolationDetected was called with the right parameter
    expect(mockHookImplementation.handleViolationDetected).toHaveBeenCalledWith('FACE_NOT_DETECTED');
  });

  it('should show the results modal when assessment is submitted', () => {
    // Override to show submitted state
    (useTakingAssessment as jest.Mock).mockReturnValue({
      ...mockHookImplementation,
      submittedResult: { score: 80, passed: true }
    });
    
    render(<TakingAssessment />);
    
    // Check that the results modal is displayed
    expect(screen.getByTestId('results-modal')).toBeInTheDocument();
    
    // Click close button
    fireEvent.click(screen.getByText('Close Results'));
    
    // Check that handleCloseResultsModal was called
    expect(mockHookImplementation.handleCloseResultsModal).toHaveBeenCalled();
  });
});