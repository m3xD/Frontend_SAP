import React, { createContext, useReducer, useContext, ReactNode } from 'react';
import { User } from '../types/UserTypes';

// State interface
interface UserState {
  usersList: {
    content: User[];
    totalElements: number;
    totalPages: number;
    loading: boolean;
    error: string | null;
  };
  filters: {
    page: number;
    size: number;
    role: 'all' | 'user' | 'admin';
    search: string;
    sort: string;
  };
  ui: {
    showCreateEditModal: boolean;
    showDeleteModal: boolean;
    modalMode: 'create' | 'edit';
    selectedUser: User | null;
    userToDelete: User | null;
  };
  form: {
    name: string;
    email: string;
    password: string;
    role: 'user' | 'admin';
    errors: {
      name: string;
      email: string;
      password: string;
    }
  };
}

// Actions
type UserAction =
  | { type: 'SET_USERS_LIST', payload: any }
  | { type: 'SET_FILTER', payload: { name: string, value: any } }
  | { type: 'SET_LOADING', payload: boolean }
  | { type: 'SET_ERROR', payload: string | null }
  | { type: 'OPEN_CREATE_MODAL' }
  | { type: 'OPEN_EDIT_MODAL', payload: User }
  | { type: 'CLOSE_MODAL' }
  | { type: 'OPEN_DELETE_MODAL', payload: User }
  | { type: 'CLOSE_DELETE_MODAL' }
  | { type: 'SET_FORM_FIELD', payload: { name: string, value: string } }
  | { type: 'SET_FORM_ERROR', payload: { field: string, message: string } }
  | { type: 'CLEAR_FORM_ERRORS' }
  | { type: 'ADD_USER', payload: User }
  | { type: 'UPDATE_USER', payload: User }
  | { type: 'DELETE_USER', payload: string };

// Initial state
const initialState: UserState = {
  usersList: {
    content: [],
    totalElements: 0,
    totalPages: 0,
    loading: false,
    error: null
  },
  filters: {
    page: 1,
    size: 5,
    role: 'all',
    search: '',
    sort: ''
  },
  ui: {
    showCreateEditModal: false,
    showDeleteModal: false,
    modalMode: 'create',
    selectedUser: null,
    userToDelete: null
  },
  form: {
    name: '',
    email: '',
    password: '',
    role: 'user',
    errors: {
      name: '',
      email: '',
      password: ''
    }
  }
};

// Create context
const UserContext = createContext<{
  state: UserState;
  dispatch: React.Dispatch<UserAction>;
} | undefined>(undefined);

// Reducer function
const userReducer = (state: UserState, action: UserAction): UserState => {
  switch (action.type) {
    case 'SET_USERS_LIST':
      return {
        ...state,
        usersList: {
          ...state.usersList,
          ...action.payload,
          loading: false
        }
      };
    case 'SET_FILTER':
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.payload.name]: action.payload.value
        }
      };
    case 'SET_LOADING':
      return {
        ...state,
        usersList: {
          ...state.usersList,
          loading: action.payload
        }
      };
    case 'SET_ERROR':
      return {
        ...state,
        usersList: {
          ...state.usersList,
          error: action.payload
        }
      };
    case 'OPEN_CREATE_MODAL':
      return {
        ...state,
        ui: {
          ...state.ui,
          showCreateEditModal: true,
          modalMode: 'create',
          selectedUser: null
        },
        form: {
          name: '',
          email: '',
          password: '',
          role: 'user',
          errors: {
            name: '',
            email: '',
            password: ''
          }
        }
      };
    case 'OPEN_EDIT_MODAL':
      return {
        ...state,
        ui: {
          ...state.ui,
          showCreateEditModal: true,
          modalMode: 'edit',
          selectedUser: action.payload
        },
        form: {
          name: action.payload.name,
          email: action.payload.email,
          password: '',
          role: action.payload.role,
          errors: {
            name: '',
            email: '',
            password: ''
          }
        }
      };
    case 'CLOSE_MODAL':
      return {
        ...state,
        ui: {
          ...state.ui,
          showCreateEditModal: false
        }
      };
    case 'OPEN_DELETE_MODAL':
      return {
        ...state,
        ui: {
          ...state.ui,
          showDeleteModal: true,
          userToDelete: action.payload
        }
      };
    case 'CLOSE_DELETE_MODAL':
      return {
        ...state,
        ui: {
          ...state.ui,
          showDeleteModal: false,
          userToDelete: null
        }
      };
    case 'SET_FORM_FIELD':
      return {
        ...state,
        form: {
          ...state.form,
          [action.payload.name]: action.payload.value,
          errors: {
            ...state.form.errors,
            [action.payload.name]: ''
          }
        }
      };
    case 'SET_FORM_ERROR':
      return {
        ...state,
        form: {
          ...state.form,
          errors: {
            ...state.form.errors,
            [action.payload.field]: action.payload.message
          }
        }
      };
    case 'CLEAR_FORM_ERRORS':
      return {
        ...state,
        form: {
          ...state.form,
          errors: {
            name: '',
            email: '',
            password: ''
          }
        }
      };
    case 'ADD_USER':
      return {
        ...state,
        usersList: {
          ...state.usersList,
          content: [...state.usersList.content, action.payload],
          totalElements: state.usersList.totalElements + 1
        }
      };
    case 'UPDATE_USER':
      return {
        ...state,
        usersList: {
          ...state.usersList,
          content: state.usersList.content.map(user => 
            user.id === action.payload.id ? action.payload : user
          )
        }
      };
    case 'DELETE_USER':
      return {
        ...state,
        usersList: {
          ...state.usersList,
          content: state.usersList.content.filter(user => user.id !== action.payload),
          totalElements: state.usersList.totalElements - 1
        }
      };
    default:
      return state;
  }
};

// Provider component
export const UserProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);
  
  return (
    <UserContext.Provider value={{ state, dispatch }}>
      {children}
    </UserContext.Provider>
  );
};

// Context hook
export const useUserContext = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};