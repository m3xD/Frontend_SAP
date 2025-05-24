import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '../../../../test-utils';
import RecentAssessmentsList from '../../../../pages/user/RecentAssessmentsList/RecentAssessmentsList';
import studentService from '../../../../services/studentService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Mock dependencies
jest.mock('../../../../services/studentService');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn()
}));
jest.mock('react-toastify');

describe('RecentAssessmentsList', () => {
  // Setup mocks before each test
  beforeEach(() => {
    // Mock navigate
    (useNavigate as jest.Mock).mockReturnValue(jest.fn());

    // Mock API calls
    (studentService.getAvailableAssessments as jest.Mock).mockResolvedValue({
      content: [
        {
          id: 'assessment-1',
          title: 'JavaScript Basics',
          subject: 'Programming',
          description: 'Learn JavaScript fundamentals',
          duration: 60,
          passingScore: 70
        },
        {
          id: 'assessment-2',
          title: 'React Fundamentals',
          subject: 'Web Development',
          description: 'Introduction to React library',
          duration: 45,
          passingScore: 65
        }
      ],
      totalElements: 2,
      totalPages: 1
    });
  });

  // Clear mocks after each test
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should display loading state initially', () => {
    render(<RecentAssessmentsList />);
    
    expect(screen.getByText('Loading assessments...')).toBeInTheDocument();
    expect(document.querySelector('.spinner-border')).toBeInTheDocument();
  });

  it('should display error message when API fails', async () => {
    // Mock API failure
    (studentService.getAvailableAssessments as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );
    
    render(<RecentAssessmentsList />);
    
    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText(/Failed to load assessments/)).toBeInTheDocument();
    });
  });

  it('should render assessments when data loads successfully', async () => {
    render(<RecentAssessmentsList />);
    
    await waitFor(() => {
      expect(screen.getByText('JavaScript Basics')).toBeInTheDocument();
      expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
    });
    
    // Check that assessment details are displayed
    expect(screen.getByText('Programming')).toBeInTheDocument();
    expect(screen.getByText(/60 min/)).toBeInTheDocument();
    expect(screen.getByText(/70% to pass/)).toBeInTheDocument();
    expect(screen.getByText('Learn JavaScript fundamentals')).toBeInTheDocument();
    
    // Check that there are two "Start Assessment" buttons
    const startButtons = screen.getAllByText(/Start Assessment/);
    expect(startButtons).toHaveLength(2);
  });

  it('should not display pagination when only one page exists', async () => {
    render(<RecentAssessmentsList />);
    
    await waitFor(() => {
      expect(screen.getByText('JavaScript Basics')).toBeInTheDocument();
    });
    
    expect(screen.queryByText('1')).not.toBeInTheDocument(); // No pagination number should be visible
  });

  it('should display pagination when multiple pages exist', async () => {
    // Mock response with multiple pages
    (studentService.getAvailableAssessments as jest.Mock).mockResolvedValue({
      content: [{ id: 'assessment-1', title: 'JavaScript Basics', subject: 'Programming', duration: 60, passingScore: 70 }],
      totalElements: 11, // More than pageSize
      totalPages: 2
    });
    
    render(<RecentAssessmentsList />);
    
    await waitFor(() => {
      expect(screen.getByText('JavaScript Basics')).toBeInTheDocument();
    });
    
    expect(screen.getByText('1')).toBeInTheDocument(); // First page
    expect(screen.getByText('2')).toBeInTheDocument(); // Second page
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
    const mockSessionStorage: { [key: string]: string } = {};
    Storage.prototype.setItem = jest.fn((key: string, value: string) => {
      mockSessionStorage[key] = value;
    });
    
    render(<RecentAssessmentsList />);
    
    // Wait for the start button to appear
    await waitFor(() => {
      const startButtons = screen.getAllByText(/Start Assessment/);
      fireEvent.click(startButtons[0]);
    });
    
    // Check that the assessment was started
    await waitFor(() => {
      expect(studentService.startAssessment).toHaveBeenCalledWith('assessment-1');
      expect(Storage.prototype.setItem).toHaveBeenCalledWith(
        'assessment_attempt-123',
        expect.any(String)
      );
      expect(navigate).toHaveBeenCalledWith('/user/assessments/take/attempt-123');
    });
  });

  it('should show error toast when starting assessment fails', async () => {
    // Mock API failure
    (studentService.startAssessment as jest.Mock).mockRejectedValueOnce(
      new Error('Failed to start')
    );
    
    render(<RecentAssessmentsList />);
    
    await waitFor(() => {
      const startButtons = screen.getAllByText(/Start Assessment/);
      fireEvent.click(startButtons[0]);
    });
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to start assessment. Please try again.');
    });
  });

  it('should show "No assessments available" when content is empty', async () => {
    // Mock empty response
    (studentService.getAvailableAssessments as jest.Mock).mockResolvedValueOnce({
      content: [],
      totalElements: 0,
      totalPages: 0
    });
    
    render(<RecentAssessmentsList />);
    
    await waitFor(() => {
      expect(screen.getByText('No assessments available at this time.')).toBeInTheDocument();
    });
  });

  it('should navigate back to dashboard when back button is clicked', async () => {
    const navigate = jest.fn();
    (useNavigate as jest.Mock).mockReturnValue(navigate);
    
    render(<RecentAssessmentsList />);
    
    await waitFor(() => {
      const backButton = screen.getByText('Back to Dashboard');
      fireEvent.click(backButton);
    });
    
    expect(navigate).toHaveBeenCalledWith('/user/dashboard');
  });
});