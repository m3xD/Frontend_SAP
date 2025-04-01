import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { AssessmentData } from "../../types/AssessmentTypes";
import { useAssessmentContext } from "../../contexts/AssessmentContext";
import assessmentsService from "../../services/assessmentsService";
import { toast } from "react-toastify";

const AssessmentModal: React.FC = () => {
  const { state, dispatch } = useAssessmentContext();
  const { ui } = state;
  const { showCreateEditModal, modalMode, selectedAssessment } = ui;

  // Initialize form state
  const defaultFormState: AssessmentData = {
    title: "",
    subject: "programming",
    description: "",
    duration: 60,
    dueDate: "",
    status: "draft",
    passingScore: 70,
  };

  const [formData, setFormData] = useState<AssessmentData>(defaultFormState);
  const [errors, setErrors] = useState<Partial<Record<keyof AssessmentData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Update form data when assessment changes
  useEffect(() => {
    if (modalMode === "edit" && selectedAssessment) {
      setFormData(selectedAssessment);
    } else {
      setFormData(defaultFormState);
    }
  }, [selectedAssessment, modalMode]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Handle number inputs
    if (type === "number") {
      setFormData({
        ...formData,
        [name]: Number(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Partial<Record<keyof AssessmentData, string>> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    
    if (!formData.subject) {
      newErrors.subject = "Subject is required";
    }
    
    if (formData.duration <= 0) {
      newErrors.duration = "Duration must be greater than 0";
    }
    
    if (formData.passingScore < 0 || formData.passingScore > 100) {
      newErrors.passingScore = "Passing score must be between 0 and 100";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Close modal
  const handleClose = () => {
    dispatch({ type: "CLOSE_MODAL" });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (modalMode === "create") {
        const newAssessment = await assessmentsService.createAssessment(formData);
        dispatch({ type: "ADD_ASSESSMENT", payload: newAssessment });
        toast.success("Assessment created successfully");
      } else if (selectedAssessment) {
        const updated = await assessmentsService.updateAssessment(
          selectedAssessment.id,
          formData
        );
        dispatch({ type: "UPDATE_ASSESSMENT", payload: updated });
        toast.success("Assessment updated successfully");
      }
      
      handleClose();
    } catch (error) {
      console.error("Error submitting assessment:", error);
      toast.error("Failed to process assessment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={showCreateEditModal} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {modalMode === "create" ? "Create New Assessment" : "Edit Assessment"}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row>
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  isInvalid={!!errors.title}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.title}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Subject</Form.Label>
                <Form.Select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  isInvalid={!!errors.subject}
                  required
                >
                  <option value="">Select Subject</option>
                  <option value="programming">Programming</option>
                  <option value="math">Mathematics</option>
                  <option value="science">Science</option>
                  <option value="english">English</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.subject}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              isInvalid={!!errors.description}
            />
            <Form.Control.Feedback type="invalid">
              {errors.description}
            </Form.Control.Feedback>
          </Form.Group>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Duration (minutes)</Form.Label>
                <Form.Control
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  min="1"
                  isInvalid={!!errors.duration}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.duration}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Passing Score (%)</Form.Label>
                <Form.Control
                  type="number"
                  name="passingScore"
                  value={formData.passingScore}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  isInvalid={!!errors.passingScore}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.passingScore}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  isInvalid={!!errors.status}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.status}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Due Date (Optional)</Form.Label>
            <Form.Control
              type="datetime-local"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              isInvalid={!!errors.dueDate}
            />
            <Form.Control.Feedback type="invalid">
              {errors.dueDate}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              Leave blank for no due date
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {modalMode === "create" ? "Creating..." : "Updating..."}
              </>
            ) : (
              modalMode === "create" ? "Create Assessment" : "Update Assessment"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AssessmentModal;