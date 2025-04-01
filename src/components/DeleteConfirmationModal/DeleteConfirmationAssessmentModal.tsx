import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useAssessmentContext } from "../../contexts/AssessmentContext";
import assessmentsService from "../../services/assessmentsService";
import { toast } from "react-toastify";

const DeleteConfirmationAssessmentModal: React.FC = () => {
  const { state, dispatch } = useAssessmentContext();
  const { ui } = state;
  const { showDeleteModal, assessmentToDelete } = ui;
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleClose = () => {
    dispatch({ type: "CLOSE_DELETE_MODAL" });
  };
  
  const handleConfirm = async () => {
    if (!assessmentToDelete) return;
    
    setIsDeleting(true);
    try {
      await assessmentsService.deleteAssessment(assessmentToDelete);
      dispatch({ type: "DELETE_ASSESSMENT", payload: assessmentToDelete });
      toast.success("Assessment deleted successfully");
      handleClose();
    } catch (error) {
      console.error("Error deleting assessment:", error);
      toast.error("Failed to delete assessment. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal show={showDeleteModal} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Delete Assessment</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure you want to delete this assessment? This action cannot be undone.
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button 
          variant="danger" 
          onClick={handleConfirm}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Deleting...
            </>
          ) : (
            "Delete Assessment"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteConfirmationAssessmentModal;