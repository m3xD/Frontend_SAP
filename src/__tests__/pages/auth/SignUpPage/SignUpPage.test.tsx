import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '../../../../test-utils';
import SignUpPage from '../../../../pages/auth/SignUpPage/SignUpPage';
import { useAuth } from '../../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Mock dependencies
jest.mock('../../../../hooks/useAuth');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn()
}));
jest.mock('react-toastify');

describe('SignUpPage', () => {
  // Setup mocks
  const mockSignup = jest.fn();
  const mockNavigate = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    (useAuth as jest.Mock).mockReturnValue({
      signup: mockSignup,
      authState: { isAuthenticated: false, loading: false }
    });
    
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    
    // Mock successful signup
    mockSignup.mockResolvedValue(undefined);
  });
  
  it('should render the sign-up form correctly', () => {
    render(<SignUpPage />);
    
    // Check that the form is displayed - be more specific with our queries
    expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Create a password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm your password')).toBeInTheDocument();
    expect(screen.getByText(/Already have an account/i)).toBeInTheDocument();
  });
  
  it('should validate form inputs', () => {
    render(<SignUpPage />);
    
    // Button should be disabled when fields are empty
    const createAccountButton = screen.getByRole('button', { name: /Create Account/i });
    expect(createAccountButton).toBeDisabled();
    
    // Fill in name only
    fireEvent.change(screen.getByPlaceholderText('Enter your name'), {
      target: { value: 'Test User' }
    });
    expect(createAccountButton).toBeDisabled();
    
    // Fill in email
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'test@example.com' }
    });
    expect(createAccountButton).toBeDisabled();
    
    // Fill in password
    fireEvent.change(screen.getByPlaceholderText('Create a password'), {
      target: { value: 'password123' }
    });
    expect(createAccountButton).toBeDisabled();
    
    // Fill in confirm password
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), {
      target: { value: 'password123' }
    });
    
    // Now button should be enabled
    expect(createAccountButton).not.toBeDisabled();
  });
  
  it('should show error when passwords do not match', async () => {
    render(<SignUpPage />);
    
    // Fill in all fields but with mismatched passwords
    fireEvent.change(screen.getByPlaceholderText('Enter your name'), {
      target: { value: 'Test User' }
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Create a password'), {
      target: { value: 'password123' }
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), {
      target: { value: 'password456' } // Different password
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));
    
    // Check that error message is displayed
    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    
    // The signup function should not have been called
    expect(mockSignup).not.toHaveBeenCalled();
  });
  
  it('should handle successful sign-up', async () => {
    render(<SignUpPage />);
    
    // Fill in form with valid data
    fireEvent.change(screen.getByPlaceholderText('Enter your name'), {
      target: { value: 'Test User' }
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Create a password'), {
      target: { value: 'password123' }
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), {
      target: { value: 'password123' }
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));
    
    // Check that signup was called with correct params
    expect(mockSignup).toHaveBeenCalledWith('Test User', 'test@example.com', 'password123');
    
    // Wait for the async operation to complete
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('Account created successfully'));
      expect(mockNavigate).toHaveBeenCalledWith('/signin');
    });
  });
  
  it('should handle sign-up errors', async () => {
    // Mock signup to reject
    mockSignup.mockRejectedValueOnce(new Error('Registration failed'));
    
    render(<SignUpPage />);
    
    // Fill in form with valid data
    fireEvent.change(screen.getByPlaceholderText('Enter your name'), {
      target: { value: 'Test User' }
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Create a password'), {
      target: { value: 'password123' }
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), {
      target: { value: 'password123' }
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));
    
    // Check that error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Failed to create account. Please try again.')).toBeInTheDocument();
    });
  });
  
  it('should show loading state during sign-up', async () => {
    // Use a promise that we can control to make loading state visible
    let resolveSignup: () => void;
    const signupPromise = new Promise<void>(resolve => {
      resolveSignup = resolve;
    });
    
    mockSignup.mockReturnValueOnce(signupPromise);
    
    render(<SignUpPage />);
    
    // Fill in form with valid data
    fireEvent.change(screen.getByPlaceholderText('Enter your name'), {
      target: { value: 'Test User' }
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Create a password'), {
      target: { value: 'password123' }
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), {
      target: { value: 'password123' }
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));
    
    // Check loading state
    expect(screen.getByText('Creating account...')).toBeInTheDocument();
    
    // Resolve the promise
    resolveSignup!();
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Creating account...')).not.toBeInTheDocument();
    });
  });
  
  it('should navigate to sign-in page when sign-in link is clicked', () => {
    render(<SignUpPage />);
    
    // Find and verify the sign in link has the correct href
    const signInLink = screen.getByText('Sign in');
    expect(signInLink.getAttribute('href')).toBe('/signin');
  });
});