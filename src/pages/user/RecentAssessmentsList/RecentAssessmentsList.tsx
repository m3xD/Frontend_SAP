import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Badge, Button, Alert, Spinner, Pagination } from "react-bootstrap";
import { Clock, Award, ArrowRight, BookOpen } from "react-feather";
import { useNavigate } from "react-router-dom";
import studentService from "../../../services/studentService";
import { toast } from "react-toastify";
import "./RecentAssessmentsList.scss";
import FaceVerification from "../../../components/FaceVerification/FaceVerification";
import { useAuth } from "../../../hooks/useAuth";

const RecentAssessmentsList: React.FC = () => {
	const navigate = useNavigate();
  const { authState } = useAuth();

	// State
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [assessments, setAssessments] = useState<any>({ content: [], totalElements: 0, totalPages: 0 });
	const [startingAssessment, setStartingAssessment] = useState<string | null>(null);
	const [page, setPage] = useState<number>(0);
	const pageSize = 10;
  
  // Face verification modal state
  const [showVerificationModal, setShowVerificationModal] = useState<boolean>(false);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);

	// Fetch assessments
	useEffect(() => {
		const fetchAssessments = async () => {
			try {
				setLoading(true);
				setError(null);

				const assessmentsResponse = await studentService.getAvailableAssessments(page, pageSize);
				setAssessments(assessmentsResponse);
			} catch (err) {
				console.error('Error loading assessments:', err);
				setError("Failed to load assessments. Please try again later.");
			} finally {
				setLoading(false);
			}
		};

		fetchAssessments();
	}, [page]);

	// Handle assessment selection and start face verification
	const handleSelectAssessment = (assessmentId: string) => {
		setSelectedAssessmentId(assessmentId);
		setShowVerificationModal(true);
	};

	// Start an assessment after successful verification
	const handleVerificationSuccess = async () => {
		if (!selectedAssessmentId) return;
		
		try {
			setStartingAssessment(selectedAssessmentId);
			setShowVerificationModal(false);

			// Call the API to start the assessment
			const response = await studentService.startAssessment(selectedAssessmentId);

			// Save the assessment data to session storage
			sessionStorage.setItem(`assessment_${response.attemptId}`, JSON.stringify(response));

			// Navigate to the assessment taking page
			navigate(`/user/assessments/take/${response.attemptId}`);

		} catch (err) {
			console.error('Error starting assessment:', err);
			toast.error('Failed to start assessment. Please try again.');
		} finally {
			setStartingAssessment(null);
			setSelectedAssessmentId(null);
		}
	};

	// Render pagination
	const renderPagination = () => {
		return (
			<Pagination className="justify-content-center mt-4">
				<Pagination.First onClick={() => setPage(0)} disabled={page === 0} />
				<Pagination.Prev onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} />

				{[...Array(assessments.totalPages)].map((_, idx) => (
					<Pagination.Item
						key={idx}
						active={idx === page}
						onClick={() => setPage(idx)}
					>
						{idx + 1}
					</Pagination.Item>
				)).slice(Math.max(0, page - 2), Math.min(assessments.totalPages, page + 3))}

				<Pagination.Next onClick={() => setPage(Math.min(assessments.totalPages - 1, page + 1))} disabled={page === assessments.totalPages - 1} />
				<Pagination.Last onClick={() => setPage(assessments.totalPages - 1)} disabled={page === assessments.totalPages - 1} />
			</Pagination>
		);
	};

	if (loading && page === 0) {
		return (
			<div className="assessments-list">
				<Container className="text-center py-5">
					<Spinner animation="border" variant="primary" />
					<p className="mt-3">Loading assessments...</p>
				</Container>
			</div>
		);
	}

	return (
		<div className="assessments-list">
			<Container>
				<div className="d-flex justify-content-between align-items-center mb-4">
					<div>
						<h1>Available Assessments</h1>
						<p className="text-muted">Browse and take assessments assigned to you</p>
					</div>
					<Button variant="outline-secondary" onClick={() => navigate('/user/dashboard')}>
						Back to Dashboard
					</Button>
				</div>

				{error && (
					<Alert variant="danger" className="mb-4">
						<Alert.Heading>Error</Alert.Heading>
						<p>{error}</p>
					</Alert>
				)}

				<Card>
					<Card.Body>
						{loading ? (
							<div className="text-center py-3">
								<Spinner animation="border" size="sm" />
								<span className="ms-2">Loading assessments...</span>
							</div>
						) : assessments.content.length === 0 ? (
							<div className="text-center py-5">
								<BookOpen size={32} className="text-muted mb-2" />
								<p>No assessments available at this time.</p>
								<Button variant="primary" onClick={() => navigate('/user/dashboard')}>
									Return to Dashboard
								</Button>
							</div>
						) : (
							<div className="assessment-list">
								{assessments.content.map((assessment: any) => (
									<div key={assessment.id} className="assessment-item">
										<div className="assessment-info">
											<h5>{assessment.title}</h5>
											<div className="assessment-meta">
												<Badge bg="primary" className="me-2">{assessment.subject}</Badge>
												<span className="me-3"><Clock size={14} className="me-1" /> {assessment.duration} min</span>
												<span><Award size={14} className="me-1" /> {assessment.passingScore}% to pass</span>
											</div>
											<p className="mt-2 text-muted">{assessment.description}</p>
										</div>
										<div>
											<Button
												variant="primary"
												disabled={startingAssessment === assessment.id}
												onClick={() => handleSelectAssessment(assessment.id)}
											>
												{startingAssessment === assessment.id ? (
													<>
														<Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
														<span className="ms-2">Starting...</span>
													</>
												) : (
													<>
														Start Assessment <ArrowRight size={16} className="ms-1" />
													</>
												)}
											</Button>
										</div>
									</div>
								))}
							</div>
						)}
					</Card.Body>
				</Card>

				{!loading && assessments.totalPages > 1 && renderPagination()}
			</Container>

			{/* Face Verification Modal */}
			{authState.user && (
				<FaceVerification
					show={showVerificationModal}
					onHide={() => setShowVerificationModal(false)}
					onVerificationSuccess={handleVerificationSuccess}
					userId={authState.user.id}
					userName={authState.user.name}
				/>
			)}
		</div>
	);
};

export default RecentAssessmentsList;