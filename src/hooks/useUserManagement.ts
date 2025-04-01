import { useEffect, useCallback, useRef } from 'react';
import { useUserContext } from '../contexts/UserContext';
import { useUserService } from './useUserService';
import { validateField, validationPatterns } from '../utils/validationUtils';
import { toast } from 'react-toastify';
import { User } from '../types/UserTypes';

export const useUserManagement = () => {
  const { state, dispatch } = useUserContext();
  const { listUsers, createUser, updateUser, deleteUser } = useUserService();
  const { filters, usersList, ui, form } = state;
  
  // Use a ref to track if this is the first render
  const initialRender = useRef(true);

  // Fetch users from API - Remove filters from dependency array
  const fetchUsers = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // Get current filters from state directly in this function
      const currentFilters = state.filters;
      const apiRoleFilter = currentFilters.role === 'all' ? '' : currentFilters.role;

      const response = await listUsers(
        currentFilters.page - 1, // API uses 0-based indexing
        currentFilters.size,
        apiRoleFilter,
        currentFilters.search,
        currentFilters.sort
      );

      dispatch({
        type: 'SET_USERS_LIST',
        payload: {
          content: response.content || [],
          totalElements: response.totalElements || 0,
          totalPages: response.totalPages || 1,
          loading: false
        }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch users';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [dispatch, listUsers, state]); // state instead of filters

  // Set filter and trigger fetch separately
  const setFilter = useCallback((name: string, value: any) => {
    dispatch({ type: 'SET_FILTER', payload: { name, value } });
    
    // Reset to page 1 when changing filters other than page
    if (name !== 'page') {
      dispatch({ type: 'SET_FILTER', payload: { name: 'page', value: 1 } });
    }
  }, [dispatch]);

  // Validate a form field
  const validateFormField = useCallback((field: string, value: string) => {
    if (field in validationPatterns) {
      const result = validateField(
        field as keyof typeof validationPatterns,
        value
      );
      
      if (!result.isValid) {
        dispatch({
          type: 'SET_FORM_ERROR',
          payload: { field, message: result.errorMessage || '' }
        });
        return false;
      }
    }
    return true;
  }, [dispatch]);

  // Validate the entire form
  const validateForm = useCallback(() => {
    let isValid = true;

    // Validate name
    if (!validateFormField('name', form.name)) {
      isValid = false;
    }

    // Validate email
    if (!validateFormField('email', form.email)) {
      isValid = false;
    }

    // Validate password (only for create mode)
    if (ui.modalMode === 'create' && !validateFormField('password', form.password)) {
      isValid = false;
    }

    return isValid;
  }, [form, ui.modalMode, validateFormField]);

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLElement>) => {
    const { name, value } = e.target as HTMLInputElement | HTMLSelectElement;
    dispatch({
      type: 'SET_FORM_FIELD',
      payload: { name, value }
    });
  }, [dispatch]);

  // Handle form field blur for validation
  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    validateFormField(name, value);
  }, [validateFormField]);

  // Open create user modal
  const openCreateModal = useCallback(() => {
    dispatch({ type: 'OPEN_CREATE_MODAL' });
  }, [dispatch]);

  // Open edit user modal
  const openEditModal = useCallback((user: User) => {
    dispatch({ type: 'OPEN_EDIT_MODAL', payload: user });
  }, [dispatch]);

  // Close modal
  const closeModal = useCallback(() => {
    dispatch({ type: 'CLOSE_MODAL' });
  }, [dispatch]);

  // Open delete confirmation modal
  const openDeleteModal = useCallback((user: User) => {
    dispatch({ type: 'OPEN_DELETE_MODAL', payload: user });
  }, [dispatch]);

  // Close delete confirmation modal
  const closeDeleteModal = useCallback(() => {
    dispatch({ type: 'CLOSE_DELETE_MODAL' });
  }, [dispatch]);

  // Handle form submission (create or update)
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (ui.modalMode === 'create') {
        // Create new user
        const newUser = await createUser(
          form.name,
          form.email,
          form.password,
          form.role
        );

        dispatch({ type: 'ADD_USER', payload: newUser });
        toast.success('User created successfully!');
      } else if (ui.selectedUser) {
        // Update existing user
        const updatedUser = await updateUser(
          ui.selectedUser.id,
          form.name,
          form.email,
          form.role
        );

        dispatch({ type: 'UPDATE_USER', payload: updatedUser });
        toast.success('User updated successfully!');
      }

      closeModal();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Operation failed. Please try again.');
    }
  }, [createUser, updateUser, form, ui.modalMode, ui.selectedUser, validateForm, closeModal, dispatch]);

  // Handle user deletion
  const handleDeleteUser = useCallback(async () => {
    if (!ui.userToDelete) return;

    try {
      await deleteUser(ui.userToDelete.id);
      dispatch({ type: 'DELETE_USER', payload: ui.userToDelete.id });
      toast.success('User deleted successfully!');
      closeDeleteModal();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user. Please try again.');
    }
  }, [deleteUser, ui.userToDelete, closeDeleteModal, dispatch]);

  // Handle sorting
  const handleSort = useCallback((field: string) => {
    let newSort = field;
    
    if (filters.sort === field) {
      // Currently ascending, switch to descending
      newSort = `-${field}`;
    } else if (filters.sort === `-${field}`) {
      // Currently descending, clear sort
      newSort = '';
    }
    
    setFilter('sort', newSort);
  }, [filters.sort, setFilter]);

  // Fetch users when filters change, not when fetchUsers changes
  useEffect(() => {
    // Skip initial render to prevent double fetching
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }
    
    fetchUsers();
  }, [
    filters.page, 
    filters.size, 
    filters.role, 
    filters.search, 
    filters.sort
  ]); // Depend on specific filter properties, not fetchUsers

  return {
    // State
    users: usersList.content,
    totalElements: usersList.totalElements,
    totalPages: usersList.totalPages,
    loading: usersList.loading,
    error: usersList.error,
    filters,
    showModal: ui.showCreateEditModal,
    showDeleteConfirm: ui.showDeleteModal,
    modalMode: ui.modalMode,
    selectedUser: ui.selectedUser,
    userToDelete: ui.userToDelete,
    form,
    
    // Actions
    setFilter,
    fetchUsers,
    handleInputChange,
    handleBlur,
    openCreateModal,
    openEditModal,
    closeModal,
    openDeleteModal,
    closeDeleteModal,
    handleSubmit,
    handleDeleteUser,
    handleSort
  };
};