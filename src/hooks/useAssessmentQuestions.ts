import { useCallback } from "react";
import { useAssessmentContext } from "../contexts/AssessmentContext";
import { QuestionData } from "../types/QuestionTypes";
import { toast } from "react-toastify";
import questionsService from "../services/questionsService";

export const useAssessmentQuestions = (assessmentId: string | undefined) => {
  const { state, dispatch } = useAssessmentContext();
  const { questions } = state.currentAssessment;

  const addQuestion = useCallback(
    async (questionData: QuestionData) => {
      if (!assessmentId) return false;

      try {
        // Basic validation
        if (!questionData.text.trim()) {
          toast.error("Question text is required.");
          return false;
        }

        if (questionData.type !== "essay") {
          if (questionData.options.some((o) => !o.text.trim())) {
            toast.error("All options must have text.");
            return false;
          }

          if (!questionData.correctAnswer && questionData.type !== "essay") {
            toast.error("You must select a correct answer.");
            return false;
          }
        }

        // Add question to the API
        const addedQuestion = await questionsService.addQuestion(
          assessmentId,
          questionData
        );

        // Update questions in context
        dispatch({
          type: "ADD_QUESTION",
          payload: addedQuestion,
        });
        toast.success("Question added successfully!");
        return true;
      } catch (error) {
        console.error("Error adding question:", error);
        toast.error("Failed to add question. Please try again.");
        return false;
      }
    },
    [assessmentId, dispatch]
  );

  const updateQuestion = useCallback(
    async (questionId: string, questionData: QuestionData) => {
      if (!assessmentId) return false;

      try {
        const updatedQuestion = await questionsService.updateQuestion(
          assessmentId,
          questionId,
          questionData
        );

        // Update question in context
        dispatch({
          type: "UPDATE_QUESTION",
          payload: updatedQuestion,
        });
        toast.success("Question updated successfully!");
        return true;
      } catch (error) {
        console.error("Error updating question:", error);
        toast.error("Failed to update question. Please try again.");
        return false;
      }
    },
    [assessmentId, dispatch]
  );

  const deleteQuestion = useCallback(
    async (questionId: string) => {
      if (!assessmentId) return false;

      try {
        await questionsService.deleteQuestion(assessmentId, questionId);

        // Remove question from context
        dispatch({
          type: "DELETE_QUESTION",
          payload: questionId,
        });
        toast.success("Question deleted successfully!");
        return true;
      } catch (error) {
        console.error("Error deleting question:", error);
        toast.error("Failed to delete question. Please try again.");
        return false;
      }
    },
    [assessmentId, dispatch]
  );

  return {
    questions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
  };
};
