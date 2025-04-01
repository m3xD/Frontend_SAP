import React from "react";
import {
  Container,
  Button,
  Form,
  Row,
  Col,
  InputGroup,
  Card,
  Alert,
} from "react-bootstrap";
import { Search, Plus, X, Filter } from "react-feather";
import "./UserManagement.scss";
import UsersTable from "../../../components/UsersTable/UsersTable";
import UserModal from "../../../components/UserModal/UserModal";
import DeleteConfirmationModal from "../../../components/DeleteConfirmationModal/DeleteConfirmationModal";
import { useUserManagement } from "../../../hooks/useUserManagement";

const UserManagement: React.FC = () => {
  const {
    users,
    totalElements,
    totalPages,
    loading,
    error,
    filters,
    showModal,
    showDeleteConfirm,
    modalMode,
    userToDelete,
    form,
    
    setFilter,
    fetchUsers,
    handleInputChange,
    handleBlur,
    openCreateModal,
    closeModal,
    openDeleteModal,
    closeDeleteModal,
    handleSubmit,
    handleDeleteUser,
    handleSort
  } = useUserManagement();

  return (
    <Container fluid className="user-management-page">
      <div className="page-header">
        <h1>User Management</h1>
        <p>Manage system users and their access levels</p>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
          <Button
            variant="outline-danger"
            className="ms-3"
            onClick={fetchUsers}
          >
            Retry
          </Button>
        </Alert>
      )}

      {/* Filters and Actions */}
      <Card className="mb-4 filter-card">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>
                  <Search size={18} />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search users..."
                  value={filters.search}
                  onChange={(e) => setFilter('search', e.target.value)}
                />
                {filters.search && (
                  <Button
                    variant="outline-secondary"
                    onClick={() => setFilter('search', '')}
                  >
                    <X size={18} />
                  </Button>
                )}
              </InputGroup>
            </Col>
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>
                  <Filter size={18} />
                </InputGroup.Text>
                <Form.Select
                  value={filters.role}
                  onChange={(e) =>
                    setFilter('role', e.target.value as "all" | "user" | "admin")
                  }
                >
                  <option value="all">All Roles</option>
                  <option value="user">Users</option>
                  <option value="admin">Admins</option>
                </Form.Select>
              </InputGroup>
            </Col>
            <Col md={4} className="text-end">
              <Button variant="primary" onClick={openCreateModal}>
                <Plus size={18} className="me-2" /> Add New User
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Users Table - Now simplified with context */}
      <UsersTable />

      {/* Create/Edit User Modal */}
      <UserModal
        showModal={showModal}
        setShowModal={closeModal}
        modalMode={modalMode}
        userForm={form}
        formErrors={form.errors}
        handleInputChange={handleInputChange}
        handleBlur={handleBlur}
        handleSubmit={handleSubmit}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={showDeleteConfirm}
        onHide={closeDeleteModal}
        title="Delete User"
        message={`Are you sure you want to delete ${userToDelete?.name}?`}
        confirmButtonText="Delete User"
        onConfirm={handleDeleteUser}
      />
    </Container>
  );
};

export default UserManagement;
