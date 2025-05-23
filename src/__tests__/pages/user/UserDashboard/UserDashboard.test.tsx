// src/__tests__/pages/user/UserDashboard/UserDashboard.test.tsx
import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react'; // Remove the render import
import { render } from '../../../../test-utils'; // Import the custom render function instead
import UserDashboard from '../../../../pages/user/UserDashboard/UserDashboard';
import { useAuth } from '../../../../hooks/useAuth';
import studentService from '../../../../services/studentService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Mock dependencies
jest.mock('../../../../hooks/useAuth');
jest.mock('../../../../services/studentService');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn()
}));
jest.mock('react-toastify');

describe('UserDashboard', () => {
  // Setup mocks before each test
  beforeEach(() => {
    // Mock auth state
    (useAuth as jest.Mock).mockReturnValue({
      authState: {
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user'
        },
        isAuthenticated: true
      }
    });

    // Mock navigate
    (useNavigate as jest.Mock).mockReturnValue(jest.fn());

    // Mock API calls
    (studentService.getAvailableAssessments as jest.Mock).mockResolvedValue({
      content: [
        {
          id: 'assessment-1',
          title: 'JavaScript Basics',
          subject: 'Programming',
          duration: 60,
          passingScore: 70
        },
        {
          id: 'assessment-2',
          title: 'React Fundamentals',
          subject: 'Web Development',
          duration: 45,
          passingScore: 65
        }
      ],
      totalElements: 6, // Set to 6 to make the button appear
      totalPages: 1
    });
  });

  // Clear mocks after each test
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Tests will go here
  it('should display loading state initially', () => {
    render(<UserDashboard />);
    expect(screen.getByText('Loading dashboard data...')).toBeInTheDocument();
    // Change from getByRole to querySelector to find the spinner
    expect(document.querySelector('.spinner-border')).toBeInTheDocument();
  });

  it('should display error message when API fails', async () => {
    // Mock API failure
    (studentService.getAvailableAssessments as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );
    
    render(<UserDashboard />);
    
    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText(/Failed to load dashboard data/)).toBeInTheDocument();
    });
  });

  it('should render dashboard content when data loads successfully', async () => {
    // Setup mocks that will resolve immediately
    (studentService.getAvailableAssessments as jest.Mock).mockResolvedValue({
      content: [
        {
          id: 'assessment-1',
          title: 'JavaScript Basics',
          subject: 'Programming',
          duration: 60,
          passingScore: 70
        }
      ],
      totalElements: 1,
      totalPages: 1
    });
    
    render(<UserDashboard />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading dashboard data...')).not.toBeInTheDocument();
    });
    
    // Then check for rendered content
    expect(screen.getByText('Welcome, Test User')).toBeInTheDocument();
    
    // Be more specific with your queries to avoid multiple matches
    expect(screen.getByRole('heading', { name: 'Available Assessments' })).toBeInTheDocument();
    expect(screen.getByText('Completed Assessments', { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByText('Average Score', { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByText('Upcoming', { selector: 'p' })).toBeInTheDocument();
  });

  it('should start an assessment when clicking the start button', async () => {
    // Mock successful assessment start
    const mockAttemptData = { 
      attemptId: 'attempt-123',
      assessmentId: 'assessment-1',
      title: 'JavaScript Basics',
      questions: [],
      duration: 60,
      settings: {}
    };
    
    (studentService.startAssessment as jest.Mock).mockResolvedValueOnce(mockAttemptData);
    const navigate = jest.fn();
    (useNavigate as jest.Mock).mockReturnValue(navigate);
    
    // Storage mock
    const mockSessionStorage = {};
    Storage.prototype.setItem = jest.fn((key, value) => {
      mockSessionStorage[key] = value;
    });
    
    render(<UserDashboard />);
    
    // Wait for the start button to appear
    await waitFor(() => {
      const startButtons = screen.getAllByText(/Start Assessment/);
      expect(startButtons.length).toBeGreaterThan(0);
      
      // Click the first start button
      fireEvent.click(startButtons[0]);
    });
    
    // Check that the assessment was started
    await waitFor(() => {
      expect(studentService.startAssessment).toHaveBeenCalledWith('assessment-1');
      expect(sessionStorage.setItem).toHaveBeenCalled();
      expect(navigate).toHaveBeenCalledWith('/user/assessments/take/attempt-123');
    });
  });

  it('should show error toast when starting assessment fails', async () => {
    // Mock API failure
    (studentService.startAssessment as jest.Mock).mockRejectedValueOnce(
      new Error('Failed to start')
    );
    
    render(<UserDashboard />);
    
    await waitFor(() => {
      const startButtons = screen.getAllByText(/Start Assessment/);
      fireEvent.click(startButtons[0]);
    });
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to start assessment. Please try again.');
    });
  });

  it('should navigate to assessments page when "View All Assessments" is clicked', async () => {
    const navigate = jest.fn();
    (useNavigate as jest.Mock).mockReturnValue(navigate);
    
    render(<UserDashboard />);
    
    await waitFor(() => {
      const viewAllButton = screen.getByText('View All Assessments');
      fireEvent.click(viewAllButton);
      expect(navigate).toHaveBeenCalledWith('/user/assessments');
    });
  });

  it('should navigate to results page when "View All Results" is clicked', async () => {
    const navigate = jest.fn();
    (useNavigate as jest.Mock).mockReturnValue(navigate);
    
    render(<UserDashboard />);
    
    await waitFor(() => {
      const viewAllButton = screen.getByText('View All Results');
      fireEvent.click(viewAllButton);
      expect(navigate).toHaveBeenCalledWith('/user/results');
    });
  });
});