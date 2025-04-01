import {
  AssessmentDetails,
  AssessmentSettings,
  AsssessmentsStatistics,
} from "./../types/AssessmentTypes";

import { Assessment, AssessmentData } from "../types/AssessmentTypes";
import { mainApi } from "../utils/AxiosInterceptor";

const assessmentsService = {
  /**
   * Get all assessments
   * @param {number} page - Page number
   * @param {number} size - Number of assessments per page
   * @param {string} subject - Subject filter
   * @param {string} status - Status filter
   * @param {string} search - Search filter
   * @param {string} sort - Sort filter
   * @returns {Promise<any>} - Returns paginated list of assessments with optional filters
   */
  async getAllAssessments(
    page: number,
    size: number,
    subject: string,
    status: string,
    search: string,
    sort: string
  ): Promise<any> {
    try {
      const res = await mainApi.get(
        `/assessments?page=${page}&size=${size}&subject=${subject}&status=${status}&search=${search}&sort=${sort}`
      );
      return res.data;
    } catch (error) {
      throw new Error("Failed to get available assessments");
    }
  },

  /**
   * Create assessment
   * @param {AssessmentData} assessmentData - Assessment data
   * @returns {Promise<AssessmentDetails>} - Returns the created assessment
   */
  async createAssessment(
    assessmentData: AssessmentData
  ): Promise<AssessmentDetails> {
    try {
      const res = await mainApi.post("/assessments", assessmentData);
      const newAssessment: AssessmentDetails = res.data;
      return newAssessment;
    } catch (error) {
      throw new Error("Failed to create assessment");
    }
  },

  /**
   * Get assessment by ID
   * @param {string} id - Assessment ID
   * @returns {Promise<AssessmentDetails>} - Returns the assessment
   */
  async getAssessmentById(id: string): Promise<AssessmentDetails> {
    try {
      const res = await mainApi.get(`/assessments/${id}`);
      const assessment: AssessmentDetails = res.data;
      console.log(">>> check res assessment details:", assessment);
      return assessment;
    } catch (error) {
      throw new Error("Failed to get assessment");
    }
  },

  /**
   * Update assessment
   * @param {string} id - Assessment ID
   * @param {AssessmentData} assessmentData - Assessment data
   * @returns {Promise<AssessmentDetails>} - Returns the updated assessment
   */
  async updateAssessment(
    id: string,
    assessmentData: AssessmentData
  ): Promise<AssessmentDetails> {
    try {
      const res = await mainApi.put(`/assessments/${id}`, assessmentData);
      const updatedAssessment: AssessmentDetails = res.data;
      return updatedAssessment;
    } catch (error) {
      throw new Error("Failed to update assessment");
    }
  },

  /**
   * Delete assessment
   * @param {string} id - Assessment ID
   * @returns {Promise<void>}
   */
  async deleteAssessment(id: string): Promise<void> {
    try {
      await mainApi.delete(`/assessments/${id}`);
    } catch (error) {
      throw new Error("Failed to delete assessment");
    }
  },

  /**
   * Duplicate assessment
   * @param {string} id - Assessment ID
   * @param {string} newTitle - New assessment title
   * @param {boolean} copyQuestions - Copy questions
   * @param {boolean} copySettings - Copy settings
   * @param {boolean} setAsDraft - Set as draft
   * @returns {Promise<any>} - Returns the duplicated assessment
   */
  async duplicateAssessment(
    id: string,
    newTitle: string,
    copyQuestions: boolean,
    copySettings: boolean,
    setAsDraft: boolean
  ): Promise<Assessment> {
    try {
      const reqData = {
        newTitle,
        copyQuestions,
        copySettings,
        setAsDraft,
      };
      const res = await mainApi.post(`/assessments/${id}/duplicate`, reqData);
      const duplicatedAssessment: Assessment = res.data;
      return duplicatedAssessment;
    } catch (error) {
      throw new Error("Failed to duplicate assessment");
    }
  },

  /**
   * Update assessment settings
   * @param {string} id - Assessment ID
   * @param {AssessmentSettings} settings - Assessment settings
   * @returns {Promise<any>} - Returns updated res
   */
  async updateAssessmentSettings(
    id: string,
    settings: AssessmentSettings
  ): Promise<any> {
    try {
      const res = await mainApi.put(`/assessments/${id}/settings`, settings);
      return res.data;
    } catch (error) {
      throw new Error("Failed to update assessment settings");
    }
  },

  /**
   * Publish assessment
   * @param {string} id - Assessment ID
   * @returns {Promise<{id: string, title: string, status: string, updatedAt: string}>} - Returns updated res
   */
  async publishAssessment(
    id: string
  ): Promise<{ id: string; title: string; status: string; updatedAt: string }> {
    try {
      const res = await mainApi.post(`/assessments/${id}/publish`);
      const resResult = {
        id: res.data.id,
        title: res.data.title,
        status: res.data.status,
        updatedAt: res.data.updatedAt,
      };
      return resResult;
    } catch (error) {
      throw new Error("Failed to publish assessment");
    }
  },

  /**
   * Get recent assessments
   * @params {number} limit - Limit of recent assessments
   * @returns {Promise<Assessment[]>} - Returns list of recent assessments
   */
  async getRecentAssessments(limit: number): Promise<Assessment[]> {
    try {
      const res = await mainApi.get(`/assessments/recent/?limit=${limit}`);
      const assessments: Assessment[] = res.data;
      return assessments;
    } catch (error) {
      throw new Error("Failed to get recent assessments");
    }
  },

  /**
   * Get assessment statistics
   * @returns {Promise<AsssessmentsStatistics>} - Returns assessment statistics
   */
  async getAssessmentsStatistics(): Promise<AsssessmentsStatistics> {
    try {
      const res = await mainApi.get("/assessments/statistics");
      const statisticsData: AsssessmentsStatistics = res.data;
      return statisticsData;
    } catch (error) {
      throw new Error("Failed to get assessment statistics");
    }
  },

  /**
   * Get result for an assessment
   * @param {string} id - Assessment ID
   * @returns {Promise<any>} - Returns assessment result
   */
  async getAssessmentResult(id: string): Promise<any> {
    try {
      const res = await mainApi.get(`/assessments/${id}/results`);
      return res.data;
    } catch (error) {
      throw new Error("Failed to get assessment result");
    }
  },
};

export default assessmentsService;
