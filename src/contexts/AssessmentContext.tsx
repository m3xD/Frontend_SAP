import React, { createContext, useContext, useReducer } from "react";
import {
  Assessment,
  AssessmentDetails,
  AssessmentSettings,
} from "../types/AssessmentTypes";
import { Question } from "../types/QuestionTypes";

// State interfaces
interface AssessmentState {
  assessmentList: {
    content: Assessment[];
    totalElements: number;
    totalPages: number;
    loading: boolean;
    error: string | null;
  };
  filters: {
    page: number;
    size: number;
    subject: string;
    status: string;
    search: string;
    sort: string;
  };
  currentAssessment: {
    data: AssessmentDetails | null;
    questions: Question[];
    settings: AssessmentSettings | null;
    loading: boolean;
    error: string | null;
  };
  ui: {
    showCreateEditModal: boolean;
    showDeleteModal: boolean;
    showDuplicateModal: boolean;
    modalMode: "create" | "edit";
    selectedAssessment: Assessment & { id: string } | null;
    assessmentToDelete: string | null;
    assessmentToDuplicate: any | null;
    isEditingSettings: boolean;
    showAddQuestionModal: boolean;
    showDeleteQuestionModal: boolean;
    questionToDelete: string | null;
  };
}

// Actions
type AssessmentAction =
  | { type: "SET_ASSESSMENTS_LIST"; payload: any }
  | { type: "SET_FILTER"; payload: { name: string; value: any } }
  | { type: "SET_CURRENT_ASSESSMENT"; payload: AssessmentDetails }
  | { type: "SET_QUESTIONS"; payload: Question[] }
  | { type: "ADD_QUESTION"; payload: Question }
  | { type: "UPDATE_QUESTION"; payload: Question }
  | { type: "DELETE_QUESTION"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "OPEN_CREATE_MODAL" }
  | { type: "OPEN_EDIT_MODAL"; payload: Assessment & { id: string } }
  | { type: "CLOSE_MODAL" }
  | { type: "OPEN_DELETE_MODAL"; payload: string }
  | { type: "CLOSE_DELETE_MODAL" }
  | { type: "OPEN_DUPLICATE_MODAL"; payload: any }
  | { type: "CLOSE_DUPLICATE_MODAL" }
  | { type: "SET_EDITING_SETTINGS"; payload: boolean }
  | { type: "OPEN_ADD_QUESTION_MODAL" }
  | { type: "CLOSE_ADD_QUESTION_MODAL" }
  | { type: "OPEN_DELETE_QUESTION_MODAL"; payload: string }
  | { type: "CLOSE_DELETE_QUESTION_MODAL" }
  | { type: "ADD_ASSESSMENT"; payload: any }
  | { type: "UPDATE_ASSESSMENT"; payload: any }
  | { type: "DELETE_ASSESSMENT"; payload: string }
  | { type: "REFRESH_ASSESSMENTS_LIST" };

// Initial state
const initialState: AssessmentState = {
  assessmentList: {
    content: [],
    totalElements: 0,
    totalPages: 0,
    loading: false,
    error: null,
  },
  filters: {
    page: 0,
    size: 10,
    subject: "",
    status: "",
    search: "",
    sort: "createdAt,desc",
  },
  currentAssessment: {
    data: null,
    questions: [],
    settings: null,
    loading: false,
    error: null,
  },
  ui: {
    showCreateEditModal: false,
    showDeleteModal: false,
    showDuplicateModal: false,
    modalMode: "create",
    selectedAssessment: null,
    assessmentToDelete: null,
    assessmentToDuplicate: null,
    isEditingSettings: false,
    showAddQuestionModal: false,
    showDeleteQuestionModal: false,
    questionToDelete: null,
  },
};

// Create Context
const AssessmentContext = createContext<
  | {
      state: AssessmentState;
      dispatch: React.Dispatch<AssessmentAction>;
    }
  | undefined
>(undefined);

// Reducer function
const assessmentReducer = (
  state: AssessmentState,
  action: AssessmentAction
): AssessmentState => {
  switch (action.type) {
    case "SET_ASSESSMENTS_LIST":
      return {
        ...state,
        assessmentList: {
          ...state.assessmentList,
          ...action.payload,
          loading: false,
        },
      };
    case "SET_FILTER":
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.payload.name]: action.payload.value,
        },
      };
    case "SET_CURRENT_ASSESSMENT":
      return {
        ...state,
        currentAssessment: {
          ...state.currentAssessment,
          data: action.payload,
          questions: action.payload.questions,
          settings: action.payload.settings,
          loading: false,
        },
      };
    case "SET_QUESTIONS":
      return {
        ...state,
        currentAssessment: {
          ...state.currentAssessment,
          questions: action.payload,
        },
      };
    case "ADD_QUESTION":
      return {
        ...state,
        currentAssessment: {
          ...state.currentAssessment,
          questions: [...state.currentAssessment.questions, action.payload],
        },
      };
    case "UPDATE_QUESTION":
      return {
        ...state,
        currentAssessment: {
          ...state.currentAssessment,
          questions: state.currentAssessment.questions.map((question) =>
            question.id === action.payload.id ? action.payload : question
          ),
        },
      };
    case "DELETE_QUESTION":
      return {
        ...state,
        currentAssessment: {
          ...state.currentAssessment,
          questions: state.currentAssessment.questions.filter(
            (question) => question.id !== action.payload
          ),
        },
      };
    case "SET_LOADING":
      return {
        ...state,
        currentAssessment: {
          ...state.currentAssessment,
          loading: action.payload,
        },
      };
    case "SET_ERROR":
      return {
        ...state,
        currentAssessment: {
          ...state.currentAssessment,
          error: action.payload,
        },
      };
    case "OPEN_CREATE_MODAL":
      return {
        ...state,
        ui: {
          ...state.ui,
          showCreateEditModal: true,
          modalMode: "create",
          selectedAssessment: null,
        },
      };
    case "OPEN_EDIT_MODAL":
      return {
        ...state,
        ui: {
          ...state.ui,
          showCreateEditModal: true,
          modalMode: "edit",
          selectedAssessment: action.payload,
        },
      };
    case "CLOSE_MODAL":
      return {
        ...state,
        ui: {
          ...state.ui,
          showCreateEditModal: false,
        },
      };
    case "OPEN_DELETE_MODAL":
      return {
        ...state,
        ui: {
          ...state.ui,
          showDeleteModal: true,
          assessmentToDelete: action.payload,
        },
      };
    case "CLOSE_DELETE_MODAL":
      return {
        ...state,
        ui: {
          ...state.ui,
          showDeleteModal: false,
          assessmentToDelete: null,
        },
      };
    case "OPEN_DUPLICATE_MODAL":
      return {
        ...state,
        ui: {
          ...state.ui,
          showDuplicateModal: true,
          assessmentToDuplicate: action.payload,
        },
      };
    case "CLOSE_DUPLICATE_MODAL":
      return {
        ...state,
        ui: {
          ...state.ui,
          showDuplicateModal: false,
          assessmentToDuplicate: null,
        },
      };
    case "SET_EDITING_SETTINGS":
      return {
        ...state,
        ui: {
          ...state.ui,
          isEditingSettings: action.payload,
        },
      };
    case "OPEN_ADD_QUESTION_MODAL":
      return {
        ...state,
        ui: {
          ...state.ui,
          showAddQuestionModal: true,
        },
      };
    case "CLOSE_ADD_QUESTION_MODAL":
      return {
        ...state,
        ui: {
          ...state.ui,
          showAddQuestionModal: false,
        },
      };
    case "OPEN_DELETE_QUESTION_MODAL":
      return {
        ...state,
        ui: {
          ...state.ui,
          showDeleteQuestionModal: true,
          questionToDelete: action.payload,
        },
      };
    case "CLOSE_DELETE_QUESTION_MODAL":
      return {
        ...state,
        ui: {
          ...state.ui,
          showDeleteQuestionModal: false,
          questionToDelete: null,
        },
      };
    case "ADD_ASSESSMENT":
      return {
        ...state,
        assessmentList: {
          ...state.assessmentList,
          content: [...state.assessmentList.content, action.payload],
          totalElements: state.assessmentList.totalElements + 1,
        },
      };
    case "UPDATE_ASSESSMENT":
      return {
        ...state,
        assessmentList: {
          ...state.assessmentList,
          content: state.assessmentList.content.map((a) =>
            a.id === action.payload.id ? action.payload : a
          ),
        },
      };
    case "DELETE_ASSESSMENT":
      return {
        ...state,
        assessmentList: {
          ...state.assessmentList,
          content: state.assessmentList.content.filter(
            (a) => a.id !== action.payload
          ),
          totalElements: state.assessmentList.totalElements - 1,
        },
      };
    case "REFRESH_ASSESSMENTS_LIST":
      return state;
    default:
      return state;
  }
};

// Provider component
export const AssessmentProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(assessmentReducer, initialState);

  return (
    <AssessmentContext.Provider value={{ state, dispatch }}>
      {children}
    </AssessmentContext.Provider>
  );
};

// Context hook
export const useAssessmentContext = () => {
  const context = useContext(AssessmentContext);
  if (context === undefined) {
    throw new Error(
      "useAssessmentContext must be used within an AssessmentProvider"
    );
  }
  return context;
};
