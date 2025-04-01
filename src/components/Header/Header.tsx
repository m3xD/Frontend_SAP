import React from "react";
import { Container, Navbar, Nav, NavDropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./Header.scss";
import { useAuth } from "../../hooks/useAuth";
import { getRefreshTokenFromLocalStorage } from "../../utils/localStorageUtils";

const Header: React.FC = () => {
  const { authState, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(getRefreshTokenFromLocalStorage() || "");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userData");
    navigate("/signin");
  };

  return (
    <Navbar expand="lg" className="header">
      <Container>
        <Navbar.Brand href="/">Quiz Monitor</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          {authState.isAuthenticated ? (
            <>
              <Nav className="me-auto">
                {authState.user?.role === "user" ? (
                  <>
                    <Nav.Link href="/user/dashboard">Dashboard</Nav.Link>
                    <Nav.Link href="/user/quizzes">My Quizzes</Nav.Link>
                    <Nav.Link href="/user/exams">My Exams List</Nav.Link>
                  </>
                ) : (
                  <>
                    <Nav.Link href="/admin/dashboard">Dashboard</Nav.Link>
                    <Nav.Link href="/admin/assessments">Manage Assessment</Nav.Link>
                    <Nav.Link href="/admin/users">Manage User</Nav.Link>
                  </>
                )}
              </Nav>
              <Nav>
                <NavDropdown
                  title={authState.user?.name || "User"}
                  id="basic-nav-dropdown"
                >
                  <NavDropdown.Item href="/profile">Profile</NavDropdown.Item>
                  <NavDropdown.Item href="/settings">Settings</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </Nav>
            </>
          ) : (
            <Nav className="ms-auto">
              <Nav.Link href="/signin">Sign In</Nav.Link>
              <Nav.Link href="/signup">Sign Up</Nav.Link>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
