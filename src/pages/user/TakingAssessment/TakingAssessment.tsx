/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect } from 'react';
import { Alert, Button, Card, Col, Container, ProgressBar, Row } from 'react-bootstrap';
import { ArrowLeft, ArrowRight, CheckCircle, Clock } from 'react-feather';
// Use attemptId from URL params
import { useNavigate, useParams } from 'react-router-dom';

import EssayQuestion from '../../../components/EssayQuestion/EssayQuestion';
import FaceAttentionChecker from '../../../components/FaceAttentionChecker/FaceAttentionChecker';
import MultiChoiceQuestion from '../../../components/MultiChoiceQuestion/MultiChoiceQuestion';
import ResultsModal from '../../../components/ResultsModal/ResultsModal';
import TrueFalseQuestion from '../../../components/TrueFalseQuestion/TrueFalseQuestion';
// Context import might not be needed if hook manages all state
// import { useAssessmentTakingContext } from "../contexts/AssessmentTakingContext";
import { useTakingAssessment } from '../../../hooks/useTakingAssessment';
import './TakingAssessment.scss';

const TakingAssessment: React.FC = () => {
	// Get attemptId from URL, not assessmentId
	const { attemptId: urlAttemptId } = useParams<{ attemptId: string }>();
	const navigate = useNavigate();

	// --- Call the hook unconditionally at the top level ---
	// Pass the attemptId from the URL to the hook
	const {
		loading: assessmentLoading,
		error: assessmentError,
		assessment,
		attemptId, // Hook confirms/returns the attemptId
		currentQuestionIndex,
		answers,
		isSubmitting,
		webcamWarnings,
		submittedResult, // <-- Destructure submittedResult
		getCurrentQuestion,
		getCurrentAnswer,
		formatTimeRemaining,
		handleAnswerChange,
		handleNextQuestion,
		handlePrevQuestion,
		handleSubmitAssessment,
		calculateProgress,
		handleViolationDetected, // Get the callback from the hook
		handleCloseResultsModal, // <-- Destructure the handler
	} = useTakingAssessment(urlAttemptId); // Pass attemptId from URL

	// Optional: Handle navigation if attemptId is missing early
	useEffect(() => {
		if (!urlAttemptId) { // Check the ID from the URL
			console.error("Attempt ID is missing from URL.");
			// navigate('/user/dashboard'); // Or show error
		}
	}, [urlAttemptId, navigate]); // Depend on the ID from the URL


	// --- Early returns based on the hook's state ---
	if (assessmentLoading) {
		// ... loading spinner ...
		return (
			<Container className="taking-assessment">
				<div className="text-center py-5">
					<div className="spinner-border text-primary" role="status">
						<span className="visually-hidden">Loading...</span>
					</div>
					<p className="mt-3">Loading assessment...</p>
				</div>
			</Container>
		);
	}

	if (assessmentError) {
		// ... error display ...
		return (
			<Container className="taking-assessment">
				<Alert variant="danger">Error loading assessment: {assessmentError}</Alert>
				<Button variant="secondary" onClick={() => navigate(-1)}>Go Back</Button>
			</Container>
		);
	}

	// Ensure attemptId provided by the hook is available after loading
	if (!attemptId && !assessmentLoading && !assessmentError) {
		// ... error display for missing attemptId after load ...
		return (
			<Container className="taking-assessment">
				<Alert variant="danger">Error: Could not retrieve assessment attempt ID.</Alert>
				<Button variant="secondary" onClick={() => navigate(-1)}>Go Back</Button>
			</Container>
		);
	}


	// --- Render current question ---
	const renderCurrentQuestion = () => {
		// ... (renderCurrentQuestion function remains the same) ...
		const question = getCurrentQuestion();
		if (!question) return null;

		const currentAnswer = getCurrentAnswer();

		switch (question.type) {
			case 'multiple-choice':
				return (
					<MultiChoiceQuestion
						question={question}
						selectedAnswer={currentAnswer}
						onChange={(value) => handleAnswerChange(question.id, value)}
					/>
				);
			case 'true-false':
				return (
					<TrueFalseQuestion
						question={question}
						selectedAnswer={currentAnswer}
						onChange={(value) => handleAnswerChange(question.id, value)}
					/>
				);
			case 'essay':
				return (
					<EssayQuestion
						question={question}
						answer={currentAnswer}
						onChange={(value) => handleAnswerChange(question.id, value)}
					/>
				);
			default:
				return <p>Unsupported question type</p>;
		}
	};

	// --- Render the main assessment UI ---
	return (
		<div className="taking-assessment">
			<Container fluid>
				{/* Header */}
				<Row className="assessment-header">
					{/* ... Header content ... */}
					<Col>
						<h1>{assessment?.title || 'Assessment'}</h1>
						<div className="d-flex align-items-center">
							<Clock size={18} className="me-2" />
							<span className="remaining-time">{formatTimeRemaining()}</span>
						</div>
					</Col>
				</Row>

				 {/* --- Conditionally render content based on submission status --- */}
				{!submittedResult ? ( // <-- Only render if NOT submitted
					<Row className="assessment-content">
						{/* Sidebar */}
						<Col md={3} className="webcam-sidebar">
							<Card className="webcam-card">
								<Card.Body>
									<h5>Monitoring</h5>
									{/* Pass the attemptId AND the callback */}
									<FaceAttentionChecker
										attemptId={attemptId!}
										onViolationDetected={handleViolationDetected} // Pass the callback here
									/>

									{/* Display warnings */}
									{webcamWarnings > 0 && (
										<Alert variant="warning" className="mt-3">
											<small>Warnings Recorded: {webcamWarnings}</small>
										</Alert>
									)}
								</Card.Body>
							</Card>

							{/* Progress Card */}
							<Card className="progress-card mt-3">
								{/* ... Progress card content ... */}
								<Card.Body>
									<h5>Progress</h5>
									<ProgressBar
										now={calculateProgress()}
										label={`${calculateProgress()}%`}
										variant="primary"
									/>
									<div className="d-flex justify-content-between mt-2">
										<small>{answers.filter(a => a.answer?.trim() !== '').length} of {assessment?.questions.length || 0} answered</small>
									</div>
								</Card.Body>
							</Card>
						</Col>

						{/* Question Area */}
						<Col md={9}>
							<Card className="question-card">
								{/* ... Question card content ... */}
								<Card.Body>
									<div className="question-header">
										<h5>Question {currentQuestionIndex + 1} of {assessment?.questions.length || 0}</h5>
									</div>

									<div className="question-content">
										{renderCurrentQuestion()}
									</div>

									<div className="question-footer d-flex justify-content-between mt-4">
										<Button
											variant="outline-secondary"
											onClick={handlePrevQuestion}
											disabled={currentQuestionIndex === 0}
										>
											<ArrowLeft size={16} className="me-2" /> Previous
										</Button>

										<div>
											{currentQuestionIndex === (assessment?.questions.length || 0) - 1 ? (
												<Button
													variant="success"
													onClick={handleSubmitAssessment}
													disabled={isSubmitting}
												>
													<CheckCircle size={16} className="me-2" />
													{isSubmitting ? 'Submitting...' : 'Submit Assessment'}
												</Button>
											) : (
												<Button
													variant="primary"
													onClick={handleNextQuestion}
												>
													Next <ArrowRight size={16} className="ms-2" />
												</Button>
											)}
										</div>
									</div>
								</Card.Body>
							</Card>
						</Col>
					</Row>
				) : (
					// Optional: Show a message indicating submission is complete while modal is visible
					<Row className="assessment-content justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
						<Col xs="auto" className="text-center">
							<CheckCircle size={48} className="text-success mb-3" />
							<h4>Assessment Submitted</h4>
							<p>Processing your results...</p>
						</Col>
					</Row>
				)}
			</Container>
			{/* Results Modal */}
			<ResultsModal onClose={handleCloseResultsModal} />
		</div>
	);
};

export default TakingAssessment;
