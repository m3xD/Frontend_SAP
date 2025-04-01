import React from "react";
import {
  Container, Row, Col, Card, Button, Form, InputGroup, Pagination,
} from "react-bootstrap";
import { Search, Filter, Plus, Trash2 } from "react-feather";
import { useNavigate } from "react-router-dom";
import { useAssessmentContext } from "../../../contexts/AssessmentContext";
import { useAssessmentList } from "../../../hooks/useAssessmentList";
import AssessmentsTable from "../../../components/AssessmentsTable/AssessmentsTable";
import AssessmentModal from "../../../components/AssessmentModal/AssessmentModal";
import DeleteConfirmationAssessmentModal from "../../../components/DeleteConfirmationModal/DeleteConfirmationAssessmentModal";
import DuplicateAssessmentModal from "../../../components/DuplicateAssessmentModal/DuplicateAssessmentModal";
import "./AssessmentManagement.scss";

const AssessmentManagement: React.FC = () => {
  const { state, dispatch } = useAssessmentContext();
  const { filters, assessmentList } = state;
  const { 
    loading, 
    error, 
    totalElements, 
    totalPages, 
    setFilter, 
    resetFilters,
    fetchAssessments
  } = useAssessmentList();
  
  const navigate = useNavigate();
  
  // Handle search
  const handleSearch = () => {
    setFilter('page', 0);
  };
  
  // Handle create assessment click
  const handleCreateAssessmentClick = () => {
    dispatch({ type: 'OPEN_CREATE_MODAL' });
  };
  
  
  // Render pagination
  const renderPagination = () => {
    return (
      <Pagination className="mt-3 justify-content-center">
        <Pagination.First onClick={() => setFilter('page', 0)} disabled={filters.page === 0} />
        <Pagination.Prev
          onClick={() => setFilter('page', Math.max(0, filters.page - 1))}
          disabled={filters.page === 0}
        />

        {[...Array(totalPages)]
          .map((_, idx) => (
            <Pagination.Item
              key={idx}
              active={idx === filters.page}
              onClick={() => setFilter('page', idx)}
            >
              {idx + 1}
            </Pagination.Item>
          ))
          .slice(Math.max(0, filters.page - 2), Math.min(totalPages, filters.page + 3))}

        <Pagination.Next
          onClick={() => setFilter('page', Math.min(totalPages - 1, filters.page + 1))}
          disabled={filters.page === totalPages - 1}
        />
        <Pagination.Last
          onClick={() => setFilter('page', totalPages - 1)}
          disabled={filters.page === totalPages - 1}
        />
      </Pagination>
    );
  };

  return (
    <div className="assessment-management">
      <Container fluid>
        <Row className="mb-4">
          <Col>
            <h1>Assessments</h1>
            <p className="text-muted">
              Manage your assessments, questions, and settings
            </p>
          </Col>
          <Col xs="auto" className="d-flex align-items-center">
            <Button variant="primary" onClick={handleCreateAssessmentClick}>
              <Plus size={16} className="me-2" />
              Create Assessment
            </Button>
          </Col>
        </Row>

        <Card className="mb-4 filter-card">
          <Card.Body>
            <Row>
              <Col md={4}>
                <InputGroup>
                  <Form.Control
                    placeholder="Search assessments..."
                    value={filters.search}
                    onChange={(e) => setFilter('search', e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <Button variant="outline-secondary" onClick={handleSearch}>
                    <Search size={16} />
                  </Button>
                </InputGroup>
              </Col>

              <Col md={3}>
                <Form.Select
                  value={filters.subject}
                  onChange={(e) => setFilter('subject', e.target.value)}
                >
                  <option value="">All Subjects</option>
                  <option value="math">Mathematics</option>
                  <option value="science">Science</option>
                  <option value="english">English</option>
                  <option value="programming">Programming</option>
                </Form.Select>
              </Col>

              <Col md={3}>
                <Form.Select
                  value={filters.status}
                  onChange={(e) => setFilter('status', e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                  <option value="Expired">Expired</option>
                </Form.Select>
              </Col>

              <Col md={2} className="d-flex justify-content-end">
                <Button
                  variant="outline-secondary"
                  onClick={resetFilters}
                >
                  <Filter size={16} className="me-2" />
                  Reset
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body className="p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading assessments...</p>
              </div>
            ) : error ? (
              <div className="text-center py-5">
                <div className="text-danger mb-3">
                  <Trash2 size={48} />
                </div>
                <p>{error}</p>
                <Button variant="primary" onClick={() => fetchAssessments()}>
                  Try Again
                </Button>
              </div>
            ) : assessmentList.content.length === 0 ? (
              <div className="text-center py-5">
                <div className="text-muted mb-3">
                  <Filter size={48} />
                </div>
                <p>
                  No assessments found. Create your first assessment or try
                  different filters.
                </p>
                <Button variant="primary" onClick={handleCreateAssessmentClick}>
                  Create Assessment
                </Button>
              </div>
            ) : (
              <AssessmentsTable />
            )}
          </Card.Body>
        </Card>

        {!loading && !error && assessmentList.content.length > 0 && (
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div>
              <Form.Select
                value={filters.size}
                onChange={(e) => {
                  setFilter('size', Number(e.target.value));
                  setFilter('page', 0);
                }}
                style={{ width: "100px" }}
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </Form.Select>
            </div>

            {renderPagination()}

            <div className="text-muted">
              Total: {totalElements} assessments
            </div>
          </div>
        )}
      </Container>

      {/* Modals - now context-aware */}
      <AssessmentModal />
      <DeleteConfirmationAssessmentModal />
      <DuplicateAssessmentModal />
    </div>
  );
};

export default AssessmentManagement;
