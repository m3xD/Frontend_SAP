import { renderHook, act } from '@testing-library/react';
import { useAssessmentQuestions } from '../../hooks/useAssessmentQuestions';
import questionsService from '../../services/questionsService';
import { toast } from 'react-toastify';

// Mock dependencies
jest.mock('../../services/questionsService');
jest.mock('react-toastify');
jest.mock('../../contexts/AssessmentContext', () => ({
  useAssessmentContext: () => ({
    state: {
      currentAssessment: {
        questions: [
          {
            id: 'q1',
            type: 'multiple-choice',
            text: 'What is React?',
            options: [
              { optionId: 'o1', text: 'A JavaScript library' },
              { optionId: 'o2', text: 'A programming language' }
            ],
            correctAnswer: 'o1',
            points: 1
          }
        ]
      }
    },
    dispatch: mockDispatch
  })
}));

// Mock dispatch function
const mockDispatch = jest.fn();

describe('useAssessmentQuestions', () => {
  const assessmentId = 'assessment-123';
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should return the questions from context', () => {
    const { result } = renderHook(() => useAssessmentQuestions(assessmentId));
    
    expect(result.current.questions).toHaveLength(1);
    expect(result.current.questions[0].text).toBe('What is React?');
  });
  
  it('should add a question successfully', async () => {
    // Mock API success
    const newQuestion = {
      type: 'multiple-choice',
      text: 'What is JavaScript?',
      options: [
        { optionId: 'o1', text: 'A programming language' },
        { optionId: 'o2', text: 'A markup language' }
      ],
      correctAnswer: 'o1',
      points: 1
    };
    
    const addedQuestion = {
      id: 'q2',
      ...newQuestion
    };
    
    (questionsService.addQuestion as jest.Mock).mockResolvedValueOnce(addedQuestion);
    
    const { result } = renderHook(() => useAssessmentQuestions(assessmentId));
    
    let success;
    await act(async () => {
      success = await result.current.addQuestion(newQuestion);
    });
    
    expect(success).toBe(true);
    expect(questionsService.addQuestion).toHaveBeenCalledWith(assessmentId, newQuestion);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'ADD_QUESTION',
      payload: addedQuestion
    });
    expect(toast.success).toHaveBeenCalledWith('Question added successfully!');
  });
  
  it('should handle add question failure', async () => {
    // Mock API failure
    (questionsService.addQuestion as jest.Mock).mockRejectedValueOnce(
      new Error('Failed to add')
    );
    
    const { result } = renderHook(() => useAssessmentQuestions(assessmentId));
    
    let success;
    await act(async () => {
      success = await result.current.addQuestion({
        type: 'multiple-choice',
        text: 'Test question',
        options: [{ optionId: 'o1', text: 'Option 1' }],
        correctAnswer: 'o1',
        points: 1
      });
    });
    
    expect(success).toBe(false);
    expect(toast.error).toHaveBeenCalledWith('Failed to add question. Please try again.');
  });
  
  it('should update a question successfully', async () => {
    const questionId = 'q1';
    const updatedQuestion = {
      type: 'multiple-choice',
      text: 'Updated question text',
      options: [
        { optionId: 'o1', text: 'Updated option 1' },
        { optionId: 'o2', text: 'Updated option 2' }
      ],
      correctAnswer: 'o1',
      points: 2
    };
    
    const returnedQuestion = {
      id: questionId,
      ...updatedQuestion
    };
    
    (questionsService.updateQuestion as jest.Mock).mockResolvedValueOnce(returnedQuestion);
    
    const { result } = renderHook(() => useAssessmentQuestions(assessmentId));
    
    let success;
    await act(async () => {
      success = await result.current.updateQuestion(questionId, updatedQuestion);
    });
    
    expect(success).toBe(true);
    expect(questionsService.updateQuestion).toHaveBeenCalledWith(
      assessmentId, 
      questionId, 
      updatedQuestion
    );
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'UPDATE_QUESTION',
      payload: returnedQuestion
    });
    expect(toast.success).toHaveBeenCalledWith('Question updated successfully!');
  });
  
  it('should handle update question failure', async () => {
    (questionsService.updateQuestion as jest.Mock).mockRejectedValueOnce(
      new Error('Failed to update')
    );
    
    const { result } = renderHook(() => useAssessmentQuestions(assessmentId));
    
    let success;
    await act(async () => {
      success = await result.current.updateQuestion('q1', {
        type: 'multiple-choice',
        text: 'Updated question',
        options: [{ optionId: 'o1', text: 'Option 1' }],
        correctAnswer: 'o1',
        points: 1
      });
    });
    
    expect(success).toBe(false);
    expect(toast.error).toHaveBeenCalledWith('Failed to update question. Please try again.');
  });
  
  it('should delete a question successfully', async () => {
    (questionsService.deleteQuestion as jest.Mock).mockResolvedValueOnce(true);
    
    const { result } = renderHook(() => useAssessmentQuestions(assessmentId));
    
    let success;
    await act(async () => {
      success = await result.current.deleteQuestion('q1');
    });
    
    expect(success).toBe(true);
    expect(questionsService.deleteQuestion).toHaveBeenCalledWith(assessmentId, 'q1');
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'DELETE_QUESTION',
      payload: 'q1'
    });
    expect(toast.success).toHaveBeenCalledWith('Question deleted successfully!');
  });
  
  it('should handle delete question failure', async () => {
    (questionsService.deleteQuestion as jest.Mock).mockRejectedValueOnce(
      new Error('Failed to delete')
    );
    
    const { result } = renderHook(() => useAssessmentQuestions(assessmentId));
    
    let success;
    await act(async () => {
      success = await result.current.deleteQuestion('q1');
    });
    
    expect(success).toBe(false);
    expect(toast.error).toHaveBeenCalledWith('Failed to delete question. Please try again.');
  });
  
  it('should validate question text when adding a question', async () => {
    const { result } = renderHook(() => useAssessmentQuestions(assessmentId));
    
    let success;
    await act(async () => {
      success = await result.current.addQuestion({
        type: 'multiple-choice',
        text: '',  // Empty text should fail validation
        options: [
          { optionId: 'o1', text: 'Option 1' },
          { optionId: 'o2', text: 'Option 2' }
        ],
        correctAnswer: 'o1',
        points: 1
      });
    });
    
    expect(success).toBe(false);
    expect(toast.error).toHaveBeenCalledWith('Question text is required.');
    expect(questionsService.addQuestion).not.toHaveBeenCalled();
  });
  
  it('should validate options when adding a multiple-choice question', async () => {
    const { result } = renderHook(() => useAssessmentQuestions(assessmentId));
    
    let success;
    await act(async () => {
      success = await result.current.addQuestion({
        type: 'multiple-choice',
        text: 'Valid question',
        options: [
          { optionId: 'o1', text: 'Option 1' },
          { optionId: 'o2', text: '' }  // Empty option should fail validation
        ],
        correctAnswer: 'o1',
        points: 1
      });
    });
    
    expect(success).toBe(false);
    expect(toast.error).toHaveBeenCalledWith('All options must have text.');
    expect(questionsService.addQuestion).not.toHaveBeenCalled();
  });
  
  it('should validate correct answer when adding a multiple-choice question', async () => {
    const { result } = renderHook(() => useAssessmentQuestions(assessmentId));
    
    let success;
    await act(async () => {
      success = await result.current.addQuestion({
        type: 'multiple-choice',
        text: 'Valid question',
        options: [
          { optionId: 'o1', text: 'Option 1' },
          { optionId: 'o2', text: 'Option 2' }
        ],
        correctAnswer: '',  // Empty correct answer should fail validation
        points: 1
      });
    });
    
    expect(success).toBe(false);
    expect(toast.error).toHaveBeenCalledWith('You must select a correct answer.');
    expect(questionsService.addQuestion).not.toHaveBeenCalled();
  });
});