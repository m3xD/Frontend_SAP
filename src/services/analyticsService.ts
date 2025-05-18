/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  LogSuspiciousActivity,
  SuspiciousActivity,
} from "./../types/AnalyticTypes";
import { AssessmentPerformance, UserActivity } from "../types/AnalyticTypes";
import { mainApi, proctorApi } from "../utils/AxiosInterceptor";

const analyticsService = {
  /**
   * Returns aggregated analytics on user activity
   * @returns {Promise<UserActivity>} Promise object represents the analytics data
   */
  async getUserActivityAnalytics(): Promise<UserActivity> {
    try {
      const res = await mainApi.get("/analytics/user-activity");
      const userActivitData: UserActivity = res.data;
      return userActivitData;
    } catch (error) {
      throw new Error("Failed to get user activity analytics");
    }
  },

  /**
   * Returns analytics on assessment performance
   * @returns {Promise<AssessmentPerformance>} Promise object represents the analytics data
   */
  async getAssessmentPerformanceAnalytics(): Promise<AssessmentPerformance> {
    try {
      const res = await mainApi.get("/analytics/assessment-performance");
      const assessmentPerformanceData: AssessmentPerformance = res.data;
      return assessmentPerformanceData;
    } catch (error) {
      throw new Error("Failed to get assessment performance");
    }
  },

  /**
   * Reports suspicious activity during an assessment
   * @param {SuspiciousActivity} suspiciousActivity - The suspicious activity data to be logged
   * @returns {Promise<LogSuspiciousActivity>} Promise object represents the analytics data
   */
  async logSuspiciousActivity(
    suspiciousActivity: SuspiciousActivity
  ): Promise<LogSuspiciousActivity> {
    try {
      const logSuspiciousActivity: LogSuspiciousActivity = await proctorApi.post(
        `/analytics/suspicious`,
        suspiciousActivity
      );
      return logSuspiciousActivity;
    } catch (error) {
      throw new Error("Failed to log suspicious activity");
    }
  },

  
};
export default analyticsService;
