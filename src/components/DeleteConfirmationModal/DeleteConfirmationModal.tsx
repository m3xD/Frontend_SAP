import React from "react";
import { Button, Modal } from "react-bootstrap";

interface DeleteConfirmationModalProps {
  // Generic modal control props
  show: boolean;
  onHide: () => void;
  
  // Customizable content
  title?: string;
  message?: string;
  confirmButtonText?: string;
  
  // Action handler
  onConfirm: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  show,
  onHide,
  title = "Confirm Deletion",
  message = "Are you sure you want to delete this item?",
  confirmButtonText = "Delete",
  onConfirm,
}) => {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{message}</p>
        <p className="text-danger">This action cannot be undone.</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          {confirmButtonText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteConfirmationModal;
