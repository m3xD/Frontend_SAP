import React from 'react';
import { Form } from 'react-bootstrap';
import { StartAssessmentQuestions } from '../../types/StudentServiceTypes';

interface MultiChoiceQuestionProps {
  question: StartAssessmentQuestions;
  selectedAnswer: string;
  onChange: (answer: string) => void;
}

const MultiChoiceQuestion: React.FC<MultiChoiceQuestionProps> = ({
  question,
  selectedAnswer,
  onChange
}) => {
  return (
    <div className="multiple-choice-question">
      <div className="question-text">{question.text}</div>
      
      <div className="options-list">
        {question.options.map(option => (
          <div 
            key={option.id}
            className={`option-item ${selectedAnswer === option.id ? 'selected' : ''}`}
            onClick={() => onChange(option.id)}
          >
            <Form.Check
              type="radio"
              id={`option-${option.id}`}
              label={option.text}
              checked={selectedAnswer === option.id}
              onChange={() => onChange(option.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultiChoiceQuestion;