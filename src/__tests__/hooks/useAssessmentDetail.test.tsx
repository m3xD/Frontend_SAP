import { renderHook, act, waitFor } from '@testing-library/react';
import { useAssessmentDetail } from '../../hooks/useAssessmentDetail';
import { useAssessmentContext } from '../../contexts/AssessmentContext';
import assessmentsService from '../../services/assessmentsService';
import { toast } from 'react-toastify';

// Mock dependencies
jest.mock('../../services/assessmentsService');
jest.mock('../../contexts/AssessmentContext');
jest.mock('react-toastify');

describe('useAssessmentDetail', () => {
  // Mock data
  const assessmentId = 'assessment-123';
  
  const mockAssessment = {
    id: assessmentId,
    title: 'JavaScript Basics',
    subject: 'Programming',
    description: 'Learn JavaScript fundamentals',
    duration: 60,
    status: 'draft',
    passingScore: 70,
    questionCount: 10,
    settings: {
      randomizeQuestions: true,
      showResult: true,
      allowRetake: false,
      maxAttempts: 1,
      timeLimitEnforced: true,
      requireWebcam: true,
      preventTabSwitching: true,
      requireIdentityVerification: false
    }
  };
  
  const mockQuestions = [
    {
      id: 'q1',
      text: 'What is JavaScript?',
      type: 'multiple-choice',
      options: [
        { optionId: 'o1', text: 'A programming language' },
        { optionId: 'o2', text: 'A markup language' }
      ],
      correctAnswer: 'o1',
      points: 1
    }
  ];
  
  const mockStudentSubmissions = [
    {
      studentId: 'student-1',
      name: 'John Doe',
      email: 'john@example.com',
      submittedAt: '2023-06-01T10:00:00Z',
      score: 80,
      passed: true
    }
  ];
  
  const mockDispatch = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock for context
    (useAssessmentContext as jest.Mock).mockReturnValue({
      state: {
        currentAssessment: {
          data: mockAssessment,
          questions: mockQuestions,
          settings: mockAssessment.settings,
          studentSubmissions: [],
          loading: false,
          error: null
        }
      },
      dispatch: mockDispatch
    });
    
    // Default mocks for service functions
    (assessmentsService.getAssessmentById as jest.Mock).mockResolvedValue(mockAssessment);
    (assessmentsService.getStudentSubmissions as jest.Mock).mockResolvedValue(mockStudentSubmissions);
    (assessmentsService.updateAssessmentSettings as jest.Mock).mockResolvedValue({ success: true });
    (assessmentsService.publishAssessment as jest.Mock).mockResolvedValue({ success: true });
  });
  
  it('should fetch assessment details and student submissions on initial render', async () => {
    const { result } = renderHook(() => useAssessmentDetail(assessmentId));
    
    // Wait for the effect to run using waitFor
    await waitFor(() => {
      expect(assessmentsService.getAssessmentById).toHaveBeenCalledWith(assessmentId);
    });
    
    // Rest of the test remains the same
    expect(assessmentsService.getStudentSubmissions).toHaveBeenCalledWith(assessmentId);
    
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_CURRENT_ASSESSMENT',
      payload: mockAssessment
    });
    
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_STUDENT_SUBMISSIONS',
      payload: mockStudentSubmissions
    });
  });
  
  it('should update assessment settings', async () => {
    const { result } = renderHook(() => useAssessmentDetail(assessmentId));
    
    const updatedSettings = {
      ...mockAssessment.settings,
      randomizeQuestions: false,
      requireWebcam: false
    };
    
    let success;
    await act(async () => {
      success = await result.current.updateSettings(updatedSettings);
    });
    
    expect(success).toBe(true);
    expect(assessmentsService.updateAssessmentSettings).toHaveBeenCalledWith(
      assessmentId,
      updatedSettings
    );
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_CURRENT_ASSESSMENT',
      payload: { ...mockAssessment, settings: updatedSettings }
    });
    expect(toast.success).toHaveBeenCalledWith('Settings updated successfully!');
    expect(result.current.isEditingSettings).toBe(false);
  });
  
  it('should handle settings update failure', async () => {
    // Mock API failure
    (assessmentsService.updateAssessmentSettings as jest.Mock).mockRejectedValueOnce(
      new Error('Failed to update settings')
    );
    
    const { result } = renderHook(() => useAssessmentDetail(assessmentId));
    
    let success;
    await act(async () => {
      success = await result.current.updateSettings(mockAssessment.settings);
    });
    
    expect(success).toBe(false);
    expect(toast.error).toHaveBeenCalledWith('Failed to update settings. Please try again.');
  });
  
  it('should publish an assessment', async () => {
    const { result } = renderHook(() => useAssessmentDetail(assessmentId));
    
    let success;
    await act(async () => {
      success = await result.current.publishAssessment();
    });
    
    expect(success).toBe(true);
    expect(assessmentsService.publishAssessment).toHaveBeenCalledWith(assessmentId);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_CURRENT_ASSESSMENT',
      payload: { ...mockAssessment, status: 'active' }
    });
    expect(toast.success).toHaveBeenCalledWith('Assessment published successfully!');
  });
  
  it('should handle publish failure', async () => {
    // Mock API failure
    (assessmentsService.publishAssessment as jest.Mock).mockRejectedValueOnce(
      new Error('Failed to publish assessment')
    );
    
    const { result } = renderHook(() => useAssessmentDetail(assessmentId));
    
    let success;
    await act(async () => {
      success = await result.current.publishAssessment();
    });
    
    expect(success).toBe(false);
    expect(toast.error).toHaveBeenCalledWith('Failed to publish assessment. Please try again.');
  });
  
  it('should toggle editing settings state', async () => {
    const { result } = renderHook(() => useAssessmentDetail(assessmentId));
    
    // Initial state should be false
    expect(result.current.isEditingSettings).toBe(false);
    
    // Toggle to true
    act(() => {
      result.current.setIsEditingSettings(true);
    });
    
    expect(result.current.isEditingSettings).toBe(true);
    
    // Toggle back to false
    act(() => {
      result.current.setIsEditingSettings(false);
    });
    
    expect(result.current.isEditingSettings).toBe(false);
  });
  
  it('should handle API errors when fetching assessment details', async () => {
    // Mock API failure
    (assessmentsService.getAssessmentById as jest.Mock).mockRejectedValueOnce(
      new Error('Failed to fetch assessment')
    );
    
    const { result } = renderHook(() => useAssessmentDetail(assessmentId));
    
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SET_ERROR',
        payload: 'Failed to load assessment details. Please try again.'
      });
    });
  });
  
  it('should handle API errors when fetching student submissions', async () => {
    // Mock API failure
    (assessmentsService.getStudentSubmissions as jest.Mock).mockRejectedValueOnce(
      new Error('Failed to fetch student submissions')
    );
    
    const { result } = renderHook(() => useAssessmentDetail(assessmentId));
    
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SET_ERROR',
        payload: 'Failed to load student submissions. Please try again.'
      });
    });
  });
});