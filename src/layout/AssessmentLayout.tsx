import React from 'react';
import { AssessmentProvider } from '../contexts/AssessmentContext';


interface AssessmentLayoutProps {
  children: React.ReactNode;
}

const AssessmentLayout: React.FC<AssessmentLayoutProps> = ({ children }) => {
  return <AssessmentProvider>{children}</AssessmentProvider>;
};

export default AssessmentLayout;