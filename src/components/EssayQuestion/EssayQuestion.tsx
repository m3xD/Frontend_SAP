import React from 'react';
import { Form } from 'react-bootstrap';
import { StartAssessmentQuestions } from '../../types/StudentServiceTypes';

interface EssayQuestionProps {
  question: StartAssessmentQuestions;
  answer: string;
  onChange: (answer: string) => void;
}

const EssayQuestion: React.FC<EssayQuestionProps> = ({
  question,
  answer,
  onChange
}) => {
  return (
    <div className="essay-question">
      <div className="question-text">{question.text}</div>
      
      <Form.Group>
        <Form.Control
          as="textarea"
          rows={8}
          value={answer}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter your answer here..."
        />
      </Form.Group>
      
      <small className="text-muted d-block mt-2">
        Write a comprehensive answer. There is no character limit.
      </small>
    </div>
  );
};

export default EssayQuestion;