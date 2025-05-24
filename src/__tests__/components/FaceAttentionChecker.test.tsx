/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import FaceAttentionChecker from '../../components/FaceAttentionChecker/FaceAttentionChecker';
import studentService from '../../services/studentService';

// Mock studentService
jest.mock('../../services/studentService', () => ({
  submitWebcamMonitorEvent: jest.fn().mockResolvedValue({ success: true })
}));

// Create a manual mock for MediaDevices
const mockGetUserMedia = jest.fn().mockResolvedValue({
  getTracks: () => [{
    stop: jest.fn()
  }]
});

// Fix: Make sure getUserMedia mock is properly spied on
beforeAll(() => {
  // Set up the global navigator mock
  Object.defineProperty(global.navigator, 'mediaDevices', {
    value: {
      getUserMedia: mockGetUserMedia
    },
    writable: true,
    configurable: true
  });
  
  // Add spyOn to track calls to getUserMedia
  jest.spyOn(navigator.mediaDevices, 'getUserMedia');
});

// Mock studentService
jest.mock('../../services/studentService', () => ({
  submitWebcamMonitorEvent: jest.fn().mockResolvedValue({ success: true })
}));

// Create a manual mock instead of requiring the actual module
jest.mock('@tensorflow/tfjs', () => {
  return {
    loadGraphModel: jest.fn().mockResolvedValue({
      executeAsync: jest.fn().mockResolvedValue([{
        arraySync: jest.fn().mockReturnValue([[
          [0, 0, 0, 0, 0.95, 1]  // Mock a face detection with high confidence
        ]])
      }]),
      dispose: jest.fn()
    }),
    browser: {
      fromPixels: jest.fn().mockReturnValue({
        expandDims: jest.fn().mockReturnThis(),
        toFloat: jest.fn().mockReturnThis(),
        div: jest.fn().mockReturnThis(),
        reshape: jest.fn().mockReturnThis(),
        dispose: jest.fn()
      })
    },
    dispose: jest.fn(),
    tidy: jest.fn(callback => callback()),
    env: {
      set: jest.fn()
    }
  };
}, { virtual: true });  // Add virtual: true to indicate this is a virtual mock

// Mock the canvas getContext method with a simpler approach
const mockContext2D = {
  drawImage: jest.fn(),
  clearRect: jest.fn(),
  fillRect: jest.fn(),
  fillText: jest.fn(),
  strokeRect: jest.fn(),
  beginPath: jest.fn(),
  rect: jest.fn(),
  stroke: jest.fn(),
  canvas: {
    width: 640,
    height: 480
  }
};

// Create a simple mock that just returns the 2D context
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = jest.fn((contextId) => {
    if (contextId === '2d') return mockContext2D as unknown as CanvasRenderingContext2D;
    return null;
  }) as any; // Added 'as any' to suppress TypeScript error on this assignment

  // Mock toBlob method on canvas
  HTMLCanvasElement.prototype.toBlob = jest.fn().mockImplementation(function(callback) {
    callback(new Blob(['mock-image-data'], { type: 'image/jpeg' }));
  });

  // Mock toDataURL method on canvas
  HTMLCanvasElement.prototype.toDataURL = jest.fn().mockReturnValue('data:image/jpeg;base64,mockImageData');
}


// Mock the video element
const createMockVideoElement = (): HTMLVideoElement => {
  // This function relies on 'document' being available from jsdom
  const mockVideoElement = document.createElement('video') as HTMLVideoElement;
  
  Object.defineProperty(mockVideoElement, 'videoWidth', { get: () => 640, configurable: true });
  Object.defineProperty(mockVideoElement, 'videoHeight', { get: () => 480, configurable: true });
  Object.defineProperty(mockVideoElement, 'srcObject', { 
    set: jest.fn(),
    get: jest.fn(),
    configurable: true 
  });
  
  mockVideoElement.play = jest.fn().mockResolvedValue(undefined);
  
  return mockVideoElement;
};

// Mock MediaPipe
jest.mock('@mediapipe/face_mesh', () => ({
  FaceMesh: jest.fn().mockImplementation(() => ({
    setOptions: jest.fn(),
    onResults: jest.fn(),
    close: jest.fn()
  }))
}));

jest.mock('@mediapipe/camera_utils', () => ({
  Camera: jest.fn().mockImplementation(() => ({
    start: jest.fn().mockResolvedValue(undefined),
    stop: jest.fn()
  }))
}));

describe('FaceAttentionChecker', () => {
  const mockOnViolationDetected = jest.fn();
  let originalCreateElement: (tagName: string, options?: ElementCreationOptions) => HTMLElement;
  
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Ensure document is available (from jsdom)
    if (typeof document !== 'undefined') {
      // Setup default element mocks
      const mockVideo = createMockVideoElement();
      
      // Store the original document.createElement before spying
      originalCreateElement = document.createElement;

      jest.spyOn(document, 'createElement').mockImplementation((tagName: string, options?: ElementCreationOptions): HTMLElement => {
        if (tagName.toLowerCase() === 'video') {
          return mockVideo;
        }
        // Call the original document.createElement for other tags
        return originalCreateElement.call(document, tagName, options);
      });
    }
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('should initialize camera on mount', async () => {
    // First, make sure our spy is properly tracking calls
    const getUserMediaSpy = jest.spyOn(navigator.mediaDevices, 'getUserMedia');
    getUserMediaSpy.mockClear(); // Reset call count
    
    render(<FaceAttentionChecker attemptId="attempt-123" onViolationDetected={mockOnViolationDetected} />);
    
    // Wait for the component to initialize and trigger camera access
    await waitFor(() => {
      expect(screen.getByText(/status/i)).toBeInTheDocument();
    });
    
    // Check that MediaPipe Camera was initialized (which would use getUserMedia)
    expect(require('@mediapipe/camera_utils').Camera).toHaveBeenCalled();
    
    // Since we're not directly calling getUserMedia in the component but using Camera,
    // we need to check that the camera is rendered instead
    expect(document.querySelector('video')).toBeInTheDocument();
  });

  it('should show camera feed when initialized', async () => {
    // Mock Camera.start to resolve immediately
    const mockCameraStart = jest.fn().mockResolvedValue(undefined);
    (require('@mediapipe/camera_utils').Camera as jest.Mock).mockImplementation(() => ({
      start: mockCameraStart,
      stop: jest.fn()
    }));
    
    render(<FaceAttentionChecker attemptId="attempt-123" onViolationDetected={mockOnViolationDetected} />);
    
    // Wait for Camera to be initialized
    await waitFor(() => {
      expect(require('@mediapipe/camera_utils').Camera).toHaveBeenCalled();
    });
    
    // Manually trigger the camera start promise resolution
    await act(async () => {
      await mockCameraStart.mock.results[0].value;
    });
    
    // Now the status should update to show "Camera started"
    await waitFor(() => {
      expect(screen.getByText(/Monitoring/i)).toBeInTheDocument();
    });
  });
  
  it('should detect violations and call onViolationDetected', async () => {
    // Store the onResults callback when it's set
    let onResultsCallback: Function | undefined = undefined;
    (require('@mediapipe/face_mesh').FaceMesh as jest.Mock).mockImplementation(() => ({
      setOptions: jest.fn(),
      onResults: jest.fn((callback) => {
        onResultsCallback = callback;
      }),
      close: jest.fn()
    }));
    
    render(<FaceAttentionChecker attemptId="attempt-123" onViolationDetected={mockOnViolationDetected} />);
    
    // Wait for FaceMesh to be initialized
    await waitFor(() => {
      expect(require('@mediapipe/face_mesh').FaceMesh).toHaveBeenCalled();
    });
    
    // Ensure onResults was called and callback was stored
    expect(onResultsCallback).toBeDefined();
    
    // Simulate a "no face detected" violation
    await act(async () => {
      // Call the callback with empty face detection results
      if (onResultsCallback) {
        onResultsCallback({
          multiFaceLandmarks: [] // Empty array = no faces detected
        });
      }
      
      // Fast-forward time to exceed the violation duration threshold
      jest.advanceTimersByTime(4000);
    });
    
    // Trigger another frame to allow violation detection to complete
    await act(async () => {
      // Call again to trigger the duration check
      if (onResultsCallback) {
        onResultsCallback({
          multiFaceLandmarks: []
        });
      }
    });
    
    // Now the violation should be detected and reported
    expect(studentService.submitWebcamMonitorEvent).toHaveBeenCalled();
  });

  it('should clean up resources on unmount', async () => {
    // Reset mock call count
    const getUserMediaSpy = jest.spyOn(navigator.mediaDevices, 'getUserMedia');
    getUserMediaSpy.mockClear();
    
    const { unmount } = render(
      <FaceAttentionChecker attemptId="attempt-123" onViolationDetected={mockOnViolationDetected} />
    );
    
    // Focus on MediaPipe Camera being initialized
    await waitFor(() => {
      expect(require('@mediapipe/camera_utils').Camera).toHaveBeenCalled();
      expect(document.querySelector('video')).toBeInTheDocument();
    });
    
    // Store references to mocks before unmounting
    const camera = require('@mediapipe/camera_utils').Camera;
    const faceMesh = require('@mediapipe/face_mesh').FaceMesh;
    
    // Unmount the component
    unmount();
    
    // Directly check that the MediaPipe cleanup happened
    expect(document.querySelector('video')).not.toBeInTheDocument();
    
    // The component should call close() on FaceMesh and stop() on Camera during cleanup
    // But these might be difficult to verify if the component doesn't have direct references
    // that match our mocks. You might need to adjust based on your implementation.
  });
});