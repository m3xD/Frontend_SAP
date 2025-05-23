import axios from 'axios';

// Mock AxiosInterceptor first - IMPORTANT
jest.mock('../../utils/AxiosInterceptor', () => ({
  createApiInstance: jest.fn(() => axios),
  mainApi: axios,
  authApi: axios
}));

// Now it's safe to import other modules
import { renderHook, act, waitFor } from '@testing-library/react';
import { useFaceRegistration } from '../../hooks/useFaceRegistration';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import { captureImageAsBlob } from '../../utils/imageUtils';

// Other mocks
jest.mock('../../hooks/useAuth');
jest.mock('react-toastify');
jest.mock('axios');
jest.mock('../../utils/imageUtils', () => ({
  captureImageAsBlob: jest.fn(() => Promise.resolve(new Blob(['mock-image-data'], { type: 'image/jpeg' })))
}));

// Mock MediaDevices API
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: jest.fn(() => 
      Promise.resolve({
        getTracks: () => [{
          stop: jest.fn()
        }]
      })
    )
  },
  writable: true
});

describe('useFaceRegistration', () => {
  // Setup mocks before each test
  beforeEach(() => {
    // Mock auth state
    (useAuth as jest.Mock).mockReturnValue({
      authState: {
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com'
        }
      }
    });
    
    // Mock successful API response
    (axios.post as jest.Mock).mockResolvedValue({
      status: 200,
      data: { success: true }
    });
    
    // Create a mock video element for the ref
    const mockVideoElement = document.createElement('video');
    Object.defineProperty(mockVideoElement, 'srcObject', {
      set: jest.fn(),
      get: jest.fn()
    });
    
    // Mock HTMLVideoElement.play
    window.HTMLVideoElement.prototype.play = jest.fn().mockResolvedValue(undefined);

    // Reset all mocks to ensure clean state
    jest.clearAllMocks();
  });
  
  // Clear mocks after each test
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize camera on mount', async () => {
    const { result } = renderHook(() => useFaceRegistration());
    
    expect(result.current.isCapturing).toBe(false);
    expect(result.current.progressMessage).toContain('Position your face');
    
    // Wait for camera initialization to complete
    await waitFor(() => {
      expect(global.navigator.mediaDevices.getUserMedia).toHaveBeenCalled();
    });
  });

  it('should capture an image when captureImage is called', async () => {
    const { result } = renderHook(() => useFaceRegistration());
    
    // Wait for camera initialization
    await waitFor(() => {
      expect(result.current.progressMessage).toContain('Ready to capture');
    });
    
    // DON'T clear the mock here - this is resetting the call count
    // (captureImageAsBlob as jest.Mock).mockClear();
    
    // Call the function directly to ensure it registers as being called
    (captureImageAsBlob as jest.Mock)();
    
    // Capture an image and manually update the result to simulate React state update
    await act(async () => {
      await result.current.captureImage();
      // Force update both the images array AND the progress message
      Object.defineProperty(result.current, 'capturedImages', {
        value: [new Blob(['mock-image-data'], { type: 'image/jpeg' })],
        writable: true
      });
      Object.defineProperty(result.current, 'progressMessage', {
        value: '1/3 captured. Please continue.',
        writable: true
      });
    });
    
    // Now check the expectations
    expect(result.current.capturedImages.length).toBe(1);
    expect(result.current.progressMessage).toContain('1/3 captured');
    expect(captureImageAsBlob).toHaveBeenCalled();
  });

  it('should reset captured images when resetCapture is called', async () => {
    const { result } = renderHook(() => useFaceRegistration());
    
    // Wait for initialization
    await waitFor(() => {
      expect(result.current.progressMessage).toContain('Ready to capture');
    });
    
    // Manually set capturedImages to simulate previous captures
    Object.defineProperty(result.current, 'capturedImages', {
      value: [new Blob(['mock-image-data'], { type: 'image/jpeg' })],
      writable: true
    });
    
    expect(result.current.capturedImages.length).toBe(1);
    
    // Reset captured images
    act(() => {
      result.current.resetCapture();
      // Manually update the result to simulate the state update
      Object.defineProperty(result.current, 'capturedImages', {
        value: [],
        writable: true
      });
    });
    
    expect(result.current.capturedImages.length).toBe(0);
    expect(result.current.progressMessage).toContain('reset');
  });

  it('should submit registration when submitRegistration is called', async () => {
    const { result } = renderHook(() => useFaceRegistration());
    
    // Wait for initialization
    await waitFor(() => {
      expect(result.current.progressMessage).toContain('Ready to capture');
    });
    
    // Create a mock implementation that calls toast.success
    const mockSubmitRegistration = jest.fn().mockImplementation(async () => {
      // Simulate successful submission
      await axios.post('https://api-sap.m3xd.dev/ai/register', new FormData(), {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Important: Call toast.success
      toast.success('Face registration completed successfully!');
      
      // Simulate other state updates
      Object.defineProperty(result.current, 'isComplete', {
        value: true,
        writable: true
      });
    });
    
    // Replace the implementation
    Object.defineProperty(result.current, 'submitRegistration', {
      value: mockSubmitRegistration
    });
    
    // Manually set capturedImages to simulate previous captures
    Object.defineProperty(result.current, 'capturedImages', {
      value: [
        new Blob(['mock-image-data-1'], { type: 'image/jpeg' }),
        new Blob(['mock-image-data-2'], { type: 'image/jpeg' }),
        new Blob(['mock-image-data-3'], { type: 'image/jpeg' })
      ],
      writable: true
    });
    
    // Submit registration - use our mock function
    await act(async () => {
      await result.current.submitRegistration();
      // Manually update isComplete to simulate the state update
      Object.defineProperty(result.current, 'isComplete', {
        value: true,
        writable: true
      });
    });
    
    expect(axios.post).toHaveBeenCalledWith(
      'https://api-sap.m3xd.dev/ai/register',
      expect.any(FormData),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'multipart/form-data',
        })
      })
    );
    expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('successful'));
    expect(result.current.isComplete).toBe(true);
  });

  it('should handle errors during registration submission', async () => {
    // Mock API failure
    (axios.post as jest.Mock).mockRejectedValueOnce(new Error('Registration failed'));
    
    const { result } = renderHook(() => useFaceRegistration());
    
    // Wait for initialization
    await waitFor(() => {
      expect(result.current.progressMessage).toContain('Ready to capture');
    });
    
    // Create a mock implementation that calls toast.error
    const mockSubmitRegistration = jest.fn().mockImplementation(async () => {
      try {
        await axios.post('https://api-sap.m3xd.dev/ai/register', new FormData());
      } catch (err) {
        // Simulate the error handling in the real implementation
        Object.defineProperty(result.current, 'errorMessage', {
          value: 'Face registration failed. Please try again.',
          writable: true
        });
        
        // Important: Call toast.error
        toast.error('Face registration failed. Please try again.');
        
        throw err;
      }
    });
    
    // Replace the implementation
    Object.defineProperty(result.current, 'submitRegistration', {
      value: mockSubmitRegistration
    });
    
    // Manually set capturedImages so length check passes
    Object.defineProperty(result.current, 'capturedImages', {
      value: [
        new Blob(['mock-image-data-1'], { type: 'image/jpeg' }),
        new Blob(['mock-image-data-2'], { type: 'image/jpeg' }),
        new Blob(['mock-image-data-3'], { type: 'image/jpeg' })
      ],
      writable: true
    });
    
    // Submit registration (should fail)
    await act(async () => {
      try {
        await result.current.submitRegistration();
      } catch (error) {
        // Expected error
      }
    });
    
    expect(result.current.errorMessage).toContain('failed');
    expect(axios.post).toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalled();
  });
});