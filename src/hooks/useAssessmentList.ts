import { useEffect, useCallback } from 'react';
import { useAssessmentContext } from '../contexts/AssessmentContext';
import assessmentsService from '../services/assessmentsService';

export const useAssessmentList = () => {
  const { state, dispatch } = useAssessmentContext();
  const { assessmentList, filters } = state;

  const fetchAssessments = useCallback(async () => {
    try {
      dispatch({ 
        type: 'SET_ASSESSMENTS_LIST', 
        payload: { loading: true, error: null } 
      });
      
      const response = await assessmentsService.getAllAssessments(
        filters.page,
        filters.size,
        filters.subject,
        filters.status,
        filters.search,
        filters.sort
      );

      dispatch({ 
        type: 'SET_ASSESSMENTS_LIST', 
        payload: { 
          content: response.content,
          totalElements: response.totalElements,
          totalPages: response.totalPages,
          loading: false
        } 
      });
    } catch (err) {
      console.error("Error fetching assessments:", err);
      dispatch({ 
        type: 'SET_ASSESSMENTS_LIST', 
        payload: { 
          error: "Failed to load assessments. Please try again.",
          loading: false
        } 
      });
    }
  }, [dispatch, filters]);

  const setFilter = useCallback((name: string, value: any) => {
    dispatch({ type: 'SET_FILTER', payload: { name, value } });
    
    // Reset page to 0 when changing filters other than page
    if (name !== 'page') {
      dispatch({ type: 'SET_FILTER', payload: { name: 'page', value: 0 } });
    }
  }, [dispatch]);

  const resetFilters = useCallback(() => {
    dispatch({ type: 'SET_FILTER', payload: { name: 'subject', value: '' } });
    dispatch({ type: 'SET_FILTER', payload: { name: 'status', value: '' } });
    dispatch({ type: 'SET_FILTER', payload: { name: 'search', value: '' } });
    dispatch({ type: 'SET_FILTER', payload: { name: 'sort', value: 'createdDate,desc' } });
    dispatch({ type: 'SET_FILTER', payload: { name: 'page', value: 0 } });
  }, [dispatch]);

  // Fetch assessments when filters change 
  // or when REFRESH_ASSESSMENTS_LIST action is dispatched
  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments, filters]);

  return {
    loading: assessmentList.loading,
    error: assessmentList.error,
    totalElements: assessmentList.totalElements,
    totalPages: assessmentList.totalPages,
    setFilter,
    resetFilters,
    fetchAssessments
  };
};
