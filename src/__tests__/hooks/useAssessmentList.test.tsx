import { renderHook, act, waitFor } from '@testing-library/react';
import { useAssessmentList } from '../../hooks/useAssessmentList';
import { useAssessmentContext } from '../../contexts/AssessmentContext';
import assessmentsService from '../../services/assessmentsService';

// Mock dependencies
jest.mock('../../services/assessmentsService');
jest.mock('../../contexts/AssessmentContext');

describe('useAssessmentList', () => {
  // Mock data
  const mockAssessments = [
    {
      id: 'assessment-1',
      title: 'JavaScript Basics',
      subject: 'Programming',
      status: 'published',
      questionCount: 10,
      passingScore: 70,
      duration: 60
    },
    {
      id: 'assessment-2',
      title: 'React Fundamentals',
      subject: 'Web Development',
      status: 'draft',
      questionCount: 15,
      passingScore: 65,
      duration: 45
    }
  ];

  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock for context
    (useAssessmentContext as jest.Mock).mockReturnValue({
      state: {
        filters: {
          page: 0,
          size: 10,
          search: '',
          status: '',
          subject: '',
          sort: 'createdAt,desc'
        },
        assessmentList: {
          content: [],
          totalElements: 0,
          totalPages: 0,
          loading: false,
          error: null
        }
      },
      dispatch: mockDispatch
    });
    
    // Default mock for service
    (assessmentsService.getAllAssessments as jest.Mock).mockResolvedValue({
      content: mockAssessments,
      totalElements: 2,
      totalPages: 1
    });
  });

  it('should fetch assessments on initial render', async () => {
    const { result } = renderHook(() => useAssessmentList());
    
    // Initial state
    expect(result.current.loading).toBe(false);
    
    // Wait for the effect to run using waitFor instead of waitForNextUpdate
    await waitFor(() => {
      expect(assessmentsService.getAllAssessments).toHaveBeenCalledWith(
        0, 10, '', '', '', 'createdAt,desc'
      );
    });
    
    // Should have dispatched SET_ASSESSMENTS_LIST actions
    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: 'SET_ASSESSMENTS_LIST',
      payload: expect.objectContaining({
        loading: true
      })
    }));
    
    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: 'SET_ASSESSMENTS_LIST',
      payload: expect.objectContaining({
        content: mockAssessments,
        totalElements: 2,
        totalPages: 1,
        loading: false
      })
    }));
  });

  it('should handle filter changes', async () => {
    const { result } = renderHook(() => useAssessmentList());
    
    await act(async () => {
      result.current.setFilter('search', 'JavaScript');
    });
    
    // Should dispatch SET_FILTER action for the search
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_FILTER',
      payload: { name: 'search', value: 'JavaScript' }
    });
    
    // Should reset page to 0 when changing filters other than page
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_FILTER',
      payload: { name: 'page', value: 0 }
    });
    
    // Should fetch assessments with new filters
    expect(assessmentsService.getAllAssessments).toHaveBeenCalled();
  });

  it('should handle reset filters', async () => {
    const { result } = renderHook(() => useAssessmentList());
    
    await act(async () => {
      result.current.resetFilters();
    });
    
    // Should dispatch SET_FILTER actions for all filters
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_FILTER',
      payload: { name: 'subject', value: '' }
    });
    
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_FILTER',
      payload: { name: 'status', value: '' }
    });
    
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_FILTER',
      payload: { name: 'search', value: '' }
    });
    
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_FILTER',
      payload: { name: 'page', value: 0 }
    });
    
    // Should fetch assessments with reset filters
    expect(assessmentsService.getAllAssessments).toHaveBeenCalled();
  });

  it('should handle API errors', async () => {
    // Mock API failure
    (assessmentsService.getAllAssessments as jest.Mock).mockRejectedValueOnce(
      new Error('Failed to fetch assessments')
    );
    
    const { result } = renderHook(() => useAssessmentList());
    
    // Wait for error state using waitFor
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
        type: 'SET_ASSESSMENTS_LIST',
        payload: expect.objectContaining({
          error: 'Failed to load assessments. Please try again.',
          loading: false
        })
      }));
    });
  });

  it('should handle pagination', async () => {
    const { result } = renderHook(() => useAssessmentList());
    
    await act(async () => {
      result.current.setFilter('page', 1);
    });
    
    // Should dispatch SET_FILTER action for the page
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_FILTER',
      payload: { name: 'page', value: 1 }
    });
    
    // Should NOT reset page to 0 when changing page filter
    expect(mockDispatch).not.toHaveBeenCalledWith({
      type: 'SET_FILTER',
      payload: { name: 'page', value: 0 }
    });
    
    // Should fetch assessments with new page
    expect(assessmentsService.getAllAssessments).toHaveBeenCalled();
  });
});