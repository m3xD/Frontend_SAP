import { renderHook, act } from '@testing-library/react';
import { useSuspiciousActivityTracking } from '../../hooks/useSuspiciousActivityTracking';
import { useAuth } from '../../hooks/useAuth';
import analyticsService from '../../services/analyticsService';
import { toast } from 'react-toastify';

// Mock dependencies
jest.mock('../../hooks/useAuth');
jest.mock('../../services/analyticsService');
jest.mock('react-toastify');

describe('useSuspiciousActivityTracking', () => {
  const mockAttemptId = 'attempt-123';
  const mockAssessmentId = 'assessment-456';
  const mockOnExceedThreshold = jest.fn();
  
  const mockUserId = 'user-789';
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock auth state
    (useAuth as jest.Mock).mockReturnValue({
      authState: {
        user: {
          id: mockUserId,
          name: 'Test User'
        }
      }
    });
    
    // Mock successful API response
    (analyticsService.logSuspiciousActivity as jest.Mock).mockResolvedValue({
      success: true
    });
  });
  
  it('should track tab switching activity', async () => {
    const { result } = renderHook(() => useSuspiciousActivityTracking({
      attemptId: mockAttemptId,
      assessmentId: mockAssessmentId,
      onExceedThreshold: mockOnExceedThreshold
    }));
    
    await act(async () => {
      await result.current.trackTabSwitching();
    });
    
    expect(analyticsService.logSuspiciousActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        attemptId: mockAttemptId,
        assessmentId: mockAssessmentId,
        type: 'TAB_SWITCHING'
      })
    );
    expect(toast.warning).toHaveBeenCalled();
  });
  
  it('should track face not detected', async () => {
    const { result } = renderHook(() => useSuspiciousActivityTracking({
      attemptId: mockAttemptId,
      assessmentId: mockAssessmentId,
      onExceedThreshold: mockOnExceedThreshold
    }));
    
    await act(async () => {
      await result.current.trackFaceNotDetected();
    });
    
    expect(analyticsService.logSuspiciousActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'FACE_NOT_DETECTED'
      })
    );
  });
  
  it('should track multiple faces detected', async () => {
    const { result } = renderHook(() => useSuspiciousActivityTracking({
      attemptId: mockAttemptId,
      assessmentId: mockAssessmentId,
      onExceedThreshold: mockOnExceedThreshold
    }));
    
    await act(async () => {
      await result.current.trackMultipleFaces();
    });
    
    expect(analyticsService.logSuspiciousActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'MULTIPLE_FACES'
      })
    );
  });
  
  it('should track looking away', async () => {
    const { result } = renderHook(() => useSuspiciousActivityTracking({
      attemptId: mockAttemptId,
      assessmentId: mockAssessmentId,
      onExceedThreshold: mockOnExceedThreshold
    }));
    
    await act(async () => {
      await result.current.trackLookingAway();
    });
    
    expect(analyticsService.logSuspiciousActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'LOOKING_AWAY'
      })
    );
  });
  
  it('should call onExceedThreshold when a threshold is exceeded', async () => {
    const { result } = renderHook(() => useSuspiciousActivityTracking({
      attemptId: mockAttemptId,
      assessmentId: mockAssessmentId,
      onExceedThreshold: mockOnExceedThreshold,
      thresholds: {
        TAB_SWITCHING: 2  // Set a low threshold for testing
      }
    }));
    
    // First call (count = 1)
    await act(async () => {
      await result.current.trackTabSwitching();
    });
    
    // Second call (count = 2) - should exceed threshold
    await act(async () => {
      await result.current.trackTabSwitching();
    });
    
    expect(mockOnExceedThreshold).toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalled();
  });
  
  it('should reset specific activity counter', async () => {
    const { result } = renderHook(() => useSuspiciousActivityTracking({
      attemptId: mockAttemptId,
      assessmentId: mockAssessmentId,
      onExceedThreshold: mockOnExceedThreshold,
      thresholds: {
        TAB_SWITCHING: 3
      }
    }));
    
    // Track tab switching twice
    await act(async () => {
      await result.current.trackTabSwitching();
      await result.current.trackTabSwitching();
    });
    
    // Reset counter
    act(() => {
      result.current.resetActivityCounter('TAB_SWITCHING');
    });
    
    // Track again - should not exceed threshold yet
    await act(async () => {
      await result.current.trackTabSwitching();
    });
    
    expect(mockOnExceedThreshold).not.toHaveBeenCalled();
  });
  
  it('should reset all counters', async () => {
    const { result } = renderHook(() => useSuspiciousActivityTracking({
      attemptId: mockAttemptId,
      assessmentId: mockAssessmentId,
      onExceedThreshold: mockOnExceedThreshold,
      thresholds: {
        TAB_SWITCHING: 3,
        FACE_NOT_DETECTED: 2
      }
    }));
    
    // Track different activities
    await act(async () => {
      await result.current.trackTabSwitching();
      await result.current.trackTabSwitching();
      await result.current.trackFaceNotDetected();
    });
    
    // Reset all counters
    act(() => {
      result.current.resetAllCounters();
    });
    
    // Track again - should not exceed thresholds
    await act(async () => {
      await result.current.trackTabSwitching();
      await result.current.trackFaceNotDetected();
    });
    
    expect(mockOnExceedThreshold).not.toHaveBeenCalled();
  });
});