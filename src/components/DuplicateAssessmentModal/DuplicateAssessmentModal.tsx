import React, { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { useAssessmentContext } from "../../contexts/AssessmentContext";
import assessmentsService from "../../services/assessmentsService";
import { toast } from "react-toastify";

const DuplicateAssessmentModal: React.FC = () => {
  const { state, dispatch } = useAssessmentContext();
  const { ui } = state;
  const { showDuplicateModal, assessmentToDuplicate } = ui;
  
  const [newTitle, setNewTitle] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Set default title when modal opens
  React.useEffect(() => {
    if (assessmentToDuplicate) {
      setNewTitle(`${assessmentToDuplicate.title} (Copy)`);
    }
  }, [assessmentToDuplicate]);
  
  const handleClose = () => {
    dispatch({ type: "CLOSE_DUPLICATE_MODAL" });
    setNewTitle("");
  };
  
  const handleDuplicate = async () => {
    if (!assessmentToDuplicate || !newTitle.trim()) return;
    
    setIsSubmitting(true);
    try {
      await assessmentsService.duplicateAssessment(
        assessmentToDuplicate.id,
        newTitle,
        true, // copy questions
        true, // copy settings
        true  // set as draft
      );
      
      // Refresh assessment list
      dispatch({ type: "REFRESH_ASSESSMENTS_LIST" });
      toast.success("Assessment duplicated successfully");
      handleClose();
    } catch (error) {
      console.error("Error duplicating assessment:", error);
      toast.error("Failed to duplicate assessment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={showDuplicateModal} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Duplicate Assessment</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group>
          <Form.Label>New Assessment Title</Form.Label>
          <Form.Control
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Enter title for the duplicate assessment"
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleDuplicate}
          disabled={!newTitle.trim() || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Duplicating...
            </>
          ) : (
            "Duplicate"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DuplicateAssessmentModal;
