/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  StartAssessment,
  AssessmentResult,
  Attempt,
  Answer,
  SubmitAssessmentResponse,
  WebcamEvent,
} from "./../types/StudentServiceTypes";

import { aiApi, mainApi } from "../utils/AxiosInterceptor";

const studentService = {
  /**
   * Returns assessments available to the current student
   * @param {number} page - Page number
   * @param {number} size - Page size
   * @returns {Promise<any>} - Available assessments
   */
  async getAvailableAssessments(page: number, size: number): Promise<any> {
    try {
      const res = await mainApi.get(
        `/student/assessments/available?page=${page}&size=${size}`
      );
      return res.data;
    } catch (error) {
      throw new Error("Failed to get available assessments");
    }
  },

  /**
   * Begin an assessment attempt
   * @param {string} id - Assessment ID
   * @returns {Promise<StartAssessment>} - Start assessment response
   */
  async startAssessment(id: string): Promise<StartAssessment> {
    try {
      const res = await mainApi.post(`/student/assessments/${id}/start`);
      const startAssessmentData: StartAssessment = res.data;
      return startAssessmentData;
    } catch (error) {
      throw new Error("Failed to start assessment");
    }
  },

  /**
   * Returns a student's results for a specific assessment
   * @param {string} id - Assessment ID
   * @returns {Promise<AssessmentResult[]>} - Student's results for the assessment
   */
  async getAssessmentResultsHistory(id: string): Promise<AssessmentResult[]> {
    try {
      const res = await mainApi.get(`/student/assessments/${id}/results`);
      const assessmentResultHistoryData: AssessmentResult[] = res.data;
      return assessmentResultHistoryData;
    } catch (error) {
      throw new Error("Failed to get assessment results");
    }
  },

  /**
   * Returns the details of an assessment attempt
   * @param {string} attemptId - Attempt ID
   * @returns {Promise<Attempt>} - Details of the assessment attempt
   */
  async getAttemptDetails(attemptId: string): Promise<Attempt> {
    try {
      const res = await mainApi.get(`/student/attempts/${attemptId}`);
      const attemptData: Attempt = res.data;
      return attemptData;
    } catch (error) {
      throw new Error("Failed to get attempt details");
    }
  },

  /**
   * Saves an answer for a question in an attempt
   * @param {string} attemptId - Attempt ID
   * @param {Answer} aswerData - Answer data
   * @returns {Promise<any>} - Response from the server
   */
  async saveAnswer(attemptId: string, answerData: Answer): Promise<any> {
    try {
      const res = await mainApi.post(
        `/student/attempts/${attemptId}/answers`,
        answerData
      );
      return res.data;
    } catch (error) {
      throw new Error("Failed to save answer");
    }
  },

  /**
   * Completes an assessment attempt
   * @param {string} attemptId - Attempt ID
   * @returns {Promise<SubmitAssessmentResponse>} - Submit assessment response
   */
  async submitAssessment(attemptId: string): Promise<SubmitAssessmentResponse> {
    try {
      const res = await mainApi.post(`/student/attempts/${attemptId}/submit`);
      const submitAssessmentData: SubmitAssessmentResponse = res.data;
      return submitAssessmentData;
    } catch (error) {
      throw new Error("Failed to submit assessment");
    }
  },


  /**
   * Reports a monitoring event during an assessment
   * @param {string} attemptId - Attempt ID
   * @param {WebcamEvent} webcamEventData - Webcam event data
   * @return {Promise<{received: boolean, severity: string, message: string}>} - Response from the server
   */
  async submitWebcamMonitorEvent(
    attemptId: string,
    webcamEventData: WebcamEvent
  ): Promise<{ received: boolean; severity: string; message: string }> {
    try {
      const res = await mainApi.post(
        `/student/attempts/${attemptId}/monitor`,
        webcamEventData
      );
      return res.data;
    } catch (error) {
      throw new Error("Failed to submit webcam monitor event");
    }
  },


  /**
   * Verifies a user's face identity before starting an assessment
   * @param {FormData} formData - Form data containing the face image and user ID
   * @param {string} expectedName - Expected user name to match against API response
   * @returns {Promise<any>} - Verification response
   */
  async verifyFaceIdentity(formData: FormData, expectedName: string): Promise<any> {
    try {
      const res = await aiApi.post(
        '/recognition', 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );
      
      // Response is now an array, get the first (and likely only) item
      const responseData = Array.isArray(res.data) && res.data.length > 0 
        ? res.data[0] 
        : res.data;
      
      // Add a 'verified' field based on the confidence threshold
      const CONFIDENCE_THRESHOLD = 0.7; // You can adjust this threshold as needed
      
      // Check if the name in the response matches the expected name
      const nameMatches = responseData.name.toLowerCase() === expectedName.toLowerCase();
      
      return {
        ...responseData,
        verified: responseData.confidence >= CONFIDENCE_THRESHOLD && nameMatches,
        nameMatches: nameMatches
      };
    } catch (error) {
      console.error('Error verifying face identity:', error);
      throw new Error("Failed to verify face identity");
    }
  },
};


export default studentService;
