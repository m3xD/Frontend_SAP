import { renderHook, act } from '@testing-library/react';
import { useTakingAssessment } from '../../hooks/useTakingAssessment';
import { useNavigate } from 'react-router-dom';
import studentService from '../../services/studentService';
import { toast } from 'react-toastify';

// Mock dependencies
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn()
}));
jest.mock('../../services/studentService');
jest.mock('react-toastify');
jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    authState: { 
      user: { id: 'user-1', name: 'Test User' }
    }
  })
}));

// Mock hooks used by useTakingAssessment
jest.mock('../../hooks/useSuspiciousActivityTracking', () => ({
  useSuspiciousActivityTracking: () => ({
    trackTabSwitching: jest.fn()
  })
}));

jest.mock('../../hooks/usePreventCheating', () => ({
  usePreventCheating: () => ({
    isActive: true
  })
}));

// Mock sessionStorage
const mockSessionStorage = {};
Storage.prototype.getItem = jest.fn((key) => mockSessionStorage[key] || null);
Storage.prototype.setItem = jest.fn((key, value) => { mockSessionStorage[key] = value; });

// Mock context
const mockDispatch = jest.fn();
const mockState = {
  loading: false,
  error: null,
  assessment: {
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
      }
    ],
    settings: {}
  },
  currentQuestionIndex: 0,
  answers: [{ questionId: 'q1', answer: '' }],
  remainingTime: 600,
  isSubmitting: false,
  webcamWarnings: 0,
  attemptId: 'attempt-123',
  submittedResult: null,
  ui: { showResultModal: false },
  suspiciousActivity: { type: null, tabSwitches: 0 }
};

jest.mock('../../contexts/AssessmentTakingContext', () => ({
  useAssessmentTakingContext: () => ({
    state: mockState,
    dispatch: mockDispatch
  })
}));

describe('useTakingAssessment', () => {
  const mockNavigate = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });
  
  it('should handle answer change', async () => {
    // Mock API success
    (studentService.saveAnswer as jest.Mock).mockResolvedValue({ success: true });
    
    const { result } = renderHook(() => useTakingAssessment('attempt-123'));
    
    // Act - use handleAnswerChange instead of handleAnswerSubmit
    await act(async () => {
      result.current.handleAnswerChange('q1', 'a');
    });
    
    // Check that dispatch was called with the correct action type
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'UPDATE_ANSWER',
      payload: { questionId: 'q1', value: 'a' }
    });
  });
  
  it('should handle assessment submission', async () => {
    // Mock API success
    (studentService.submitAssessment as jest.Mock).mockResolvedValue({ 
      attemptId: 'attempt-123', 
      score: 80,
      passed: true 
    });
    
    const { result } = renderHook(() => useTakingAssessment('attempt-123'));
    
    await act(async () => {
      await result.current.handleSubmitAssessment();
    });
    
    expect(studentService.submitAssessment).toHaveBeenCalledWith('attempt-123');
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'SET_SUBMITTING', payload: true });
    expect(toast.success).toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'OPEN_RESULT_MODAL',
      payload: expect.any(Object)
    });
  });
  
  it('should handle navigation between questions', () => {
    const { result } = renderHook(() => useTakingAssessment('attempt-123'));
    
    act(() => {
      result.current.handleNextQuestion();
    });
    
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'NEXT_QUESTION' });
    
    act(() => {
      result.current.handlePrevQuestion();
    });
    
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'PREV_QUESTION' });
  });
  
  it('should handle errors during API calls', async () => {
    // Mock API failure for submitAssessment
    const error = new Error('Failed to submit assessment');
    (studentService.submitAssessment as jest.Mock).mockRejectedValue(error);
    
    const { result } = renderHook(() => useTakingAssessment('attempt-123'));
    
    await act(async () => {
      await result.current.handleSubmitAssessment();
    });
    
    expect(toast.error).toHaveBeenCalledWith('Failed to submit assessment. Please try again.');
  });
});