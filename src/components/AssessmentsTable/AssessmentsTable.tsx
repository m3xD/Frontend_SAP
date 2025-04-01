import React from "react";
import { Badge, Button, Table } from "react-bootstrap";
import { ArrowDown, ArrowUp, Copy, Edit, Eye, Trash2 } from "react-feather";
import { useNavigate } from "react-router-dom";
import { useAssessmentContext } from "../../contexts/AssessmentContext";

// Render status badge
const renderStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case "active":
      return <Badge bg="success">Active</Badge>;
    case "draft":
      return <Badge bg="secondary">Draft</Badge>;
    case "expired":
      return <Badge bg="danger">Expired</Badge>;
    default:
      return <Badge bg="info">{status}</Badge>;
  }
};

const AssessmentsTable: React.FC = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useAssessmentContext();
  const { assessmentList, filters } = state;
  const assessments = assessmentList.content;

  // Handler functions that were previously passed as props
  const handleSortChange = (field: string) => {
    const currentDirection = filters.sort.split(",")[1];
    const newDirection = currentDirection === "asc" ? "desc" : "asc";
    dispatch({ 
      type: "SET_FILTER", 
      payload: { name: 'sort', value: `${field},${newDirection}` } 
    });
  };

  const handleViewAssessment = (id: string) => {
    navigate(`/admin/assessments/${id}`);
  };

  const handleEditClick = (assessment: any) => {
    dispatch({ 
      type: "OPEN_EDIT_MODAL", 
      payload: {
        title: assessment.title,
        subject: assessment.subject,
        description: assessment.description || "",
        duration: assessment.duration,
        dueDate: assessment.dueDate || "",
        status: assessment.status.toLowerCase(),
        passingScore: assessment.passingScore,
        id: assessment.id,
        createdBy: assessment.createdBy,
        createdDate: assessment.createdDate,
        attempts: assessment.attempts,
        questionCount: assessment.questionCount
      }
    });
  };

  const handleDuplicateClick = (assessment: any) => {
    dispatch({ 
      type: "OPEN_DUPLICATE_MODAL", 
      payload: assessment 
    });
  };

  const handleDeleteClick = (id: string) => {
    dispatch({ 
      type: "OPEN_DELETE_MODAL", 
      payload: id 
    });
  };

  return (
    <Table responsive className="assessment-table mb-0">
      <thead>
        <tr>
          <th className="clickable" onClick={() => handleSortChange("title")}>
            Title
            {filters.sort.startsWith("title") &&
              (filters.sort.endsWith("asc") ? (
                <ArrowUp size={14} className="ms-1" />
              ) : (
                <ArrowDown size={14} className="ms-1" />
              ))}
          </th>
          <th>Subject</th>
          <th className="clickable" onClick={() => handleSortChange("status")}>
            Status
            {filters.sort.startsWith("status") &&
              (filters.sort.endsWith("asc") ? (
                <ArrowUp size={14} className="ms-1" />
              ) : (
                <ArrowDown size={14} className="ms-1" />
              ))}
          </th>
          <th>Questions</th>
          <th
            className="clickable"
            onClick={() => handleSortChange("duration")}
          >
            Duration
            {filters.sort.startsWith("duration") &&
              (filters.sort.endsWith("asc") ? (
                <ArrowUp size={14} className="ms-1" />
              ) : (
                <ArrowDown size={14} className="ms-1" />
              ))}
          </th>
          <th
            className="clickable"
            onClick={() => handleSortChange("createdDate")}
          >
            Created
            {filters.sort.startsWith("createdDate") &&
              (filters.sort.endsWith("asc") ? (
                <ArrowUp size={14} className="ms-1" />
              ) : (
                <ArrowDown size={14} className="ms-1" />
              ))}
          </th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {assessments.map((assessment: any) => (
          <tr key={assessment.id}>
            <td>
              <div className="assessment-title">{assessment.title}</div>
            </td>
            <td>
              <Badge bg="info" pill>
                {assessment.subject}
              </Badge>
            </td>
            <td>{renderStatusBadge(assessment.status)}</td>
            <td>{assessment.questionCount}</td>
            <td>{assessment.duration} min</td>
            <td>{new Date(assessment.createdDate).toLocaleDateString()}</td>
            <td>
              <div className="d-flex">
                <Button
                  variant="light"
                  size="sm"
                  className="icon-button"
                  onClick={() => handleViewAssessment(assessment.id)}
                  title="View Details"
                >
                  <Eye size={16} />
                </Button>
                <Button
                  variant="light"
                  size="sm"
                  className="icon-button"
                  onClick={() => handleEditClick(assessment)}
                  title="Edit"
                >
                  <Edit size={16} />
                </Button>
                <Button
                  variant="light"
                  size="sm"
                  className="icon-button"
                  onClick={() => handleDuplicateClick(assessment)}
                  title="Duplicate"
                >
                  <Copy size={16} />
                </Button>
                <Button
                  variant="light"
                  size="sm"
                  className="icon-button text-danger"
                  onClick={() => handleDeleteClick(assessment.id)}
                  title="Delete"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default AssessmentsTable;
