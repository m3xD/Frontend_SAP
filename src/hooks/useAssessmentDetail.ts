import { useCallback, useEffect, useState } from "react";
import { useAssessmentContext } from "../contexts/AssessmentContext";
import assessmentsService from "../services/assessmentsService";
import { AssessmentSettings } from "../types/AssessmentTypes";
import { toast } from "react-toastify";

export const useAssessmentDetail = (assessmentId: string | undefined) => {
  const { state, dispatch } = useAssessmentContext();
  const { currentAssessment } = state;
  const [isEditingSettings, setIsEditingSettings] = useState<boolean>(false);

  const fetchAssessmentDetails = useCallback(async () => {
    if (!assessmentId) return;

    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const assessmentDetails = await assessmentsService.getAssessmentById(
        assessmentId
      );
      dispatch({ type: "SET_CURRENT_ASSESSMENT", payload: assessmentDetails });
    } catch (error) {
      console.error("Error fetching assessment details:", error);
      dispatch({
        type: "SET_ERROR",
        payload: "Failed to load assessment details. Please try again.",
      });
    }
  }, [assessmentId, dispatch]);

  const updateSettings = useCallback(
    async (settings: AssessmentSettings) => {
      if (!assessmentId) return false;
      try {
        await assessmentsService.updateAssessmentSettings(
          assessmentId,
          settings
        );

        // Update context with new settings
        if (currentAssessment.data) {
          dispatch({
            type: "SET_CURRENT_ASSESSMENT",
            payload: { ...currentAssessment.data, settings },
          });
        }
        toast.success("Settings updated successfully!");
        setIsEditingSettings(false);
        return true;
      } catch (error) {
        console.error("Error updating settings:", error);
        toast.error("Failed to update settings. Please try again.");
        return false;
      }
    },
    [assessmentId, dispatch, currentAssessment.data]
  );

  const publishAssessment = useCallback(async () => {
    if (!assessmentId) return false;

    try {
      await assessmentsService.publishAssessment(assessmentId);

      // Update assessment status in context
      if (currentAssessment.data) {
        dispatch({
          type: "SET_CURRENT_ASSESSMENT",
          payload: { ...currentAssessment.data, status: "active" },
        });
      }
      toast.success("Assessment published successfully!");
      return true;
    } catch (error) {
      console.error("Error publishing assessment:", error);
      toast.error("Failed to publish assessment. Please try again.");
      return false;
    }
  }, [assessmentId, dispatch, currentAssessment.data]);

  useEffect(() => {
    fetchAssessmentDetails();
  }, [fetchAssessmentDetails]);

  return {
    assessment: currentAssessment.data,
    questions: currentAssessment.questions,
    settings: currentAssessment.settings,
    loading: currentAssessment.loading,
    error: currentAssessment.error,
    isEditingSettings,
    setIsEditingSettings,
    updateSettings,
    publishAssessment,
  };
};
