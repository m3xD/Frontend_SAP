import React from "react";
import { Table, Button, Badge, Form, Pagination, Card } from "react-bootstrap";
import { Edit, Trash2 } from "react-feather";
import { useUserManagement } from "../../hooks/useUserManagement";

const UsersTable: React.FC = () => {
  const {
    users,
    totalElements,
    totalPages,
    loading,
    filters,
    setFilter,
    openEditModal,
    openDeleteModal,
    handleSort,
  } = useUserManagement();

  // Render pagination
  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, filters.page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust start page if end page is at maximum
    if (endPage === totalPages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Pagination.Item
          key={i}
          active={i === filters.page}
          onClick={() => setFilter("page", i)}
        >
          {i}
        </Pagination.Item>
      );
    }

    return (
      <Pagination className="mb-0">
        <Pagination.First
          onClick={() => setFilter("page", 1)}
          disabled={filters.page === 1}
        />
        <Pagination.Prev
          onClick={() => setFilter("page", Math.max(1, filters.page - 1))}
          disabled={filters.page === 1}
        />
        {pages}
        <Pagination.Next
          onClick={() =>
            setFilter("page", Math.min(totalPages, filters.page + 1))
          }
          disabled={filters.page === totalPages}
        />
        <Pagination.Last
          onClick={() => setFilter("page", totalPages)}
          disabled={filters.page === totalPages}
        />
      </Pagination>
    );
  };

  if (loading) {
    return (
      <Card>
        <Card.Body className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading users...</p>
        </Card.Body>
      </Card>
    );
  }

  if (users.length === 0) {
    return (
      <Card>
        <Card.Body className="text-center py-5">
          <p>No users found.</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      <Table responsive hover className="align-middle users-table">
        <thead>
          <tr>
            <th
              onClick={() => handleSort("name")}
              className={filters.sort.includes("name") ? "sorted" : ""}
            >
              Name
              {filters.sort === "name" && (
                <span className="sort-indicator">↑</span>
              )}
              {filters.sort === "-name" && (
                <span className="sort-indicator">↓</span>
              )}
            </th>
            <th
              onClick={() => handleSort("email")}
              className={filters.sort.includes("email") ? "sorted" : ""}
            >
              Email
              {filters.sort === "email" && (
                <span className="sort-indicator">↑</span>
              )}
              {filters.sort === "-email" && (
                <span className="sort-indicator">↓</span>
              )}
            </th>
            <th
              onClick={() => handleSort("role")}
              className={filters.sort.includes("role") ? "sorted" : ""}
            >
              Role
              {filters.sort === "role" && (
                <span className="sort-indicator">↑</span>
              )}
              {filters.sort === "-role" && (
                <span className="sort-indicator">↓</span>
              )}
            </th>
            <th className="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <Badge bg={user.role === "admin" ? "danger" : "primary"}>
                  {user.role}
                </Badge>
              </td>
              <td className="text-end">
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="me-2"
                  onClick={() => openEditModal(user)}
                >
                  <Edit size={16} />
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => openDeleteModal(user)}
                >
                  <Trash2 size={16} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="d-flex justify-content-between align-items-center mt-3">
        <div>
          <Form.Select
            value={filters.size}
            onChange={(e) => setFilter("size", parseInt(e.target.value))}
            style={{ width: "80px" }}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </Form.Select>
        </div>
        {renderPagination()}
        <div className="text-muted">Total: {totalElements} users</div>
      </div>
    </>
  );
};

export default UsersTable;
