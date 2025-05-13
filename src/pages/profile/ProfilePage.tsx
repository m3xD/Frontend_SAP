import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
} from "react-bootstrap";
import { User, Edit, Camera, Key, Save } from "react-feather";
import { useAuth } from "../../hooks/useAuth";
import "./ProfilePage.scss";
import { toast } from "react-toastify";
import { useUserService } from "../../hooks/useUserService";
import defaultAvatar from "../../assets/avatar.jpg";
import { useNavigate } from "react-router-dom";
import userService from "../../services/userService";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const { updateUser } = useUserService();
  const [editing, setEditing] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [profileForm, setProfileForm] = useState({
    name: authState.user?.name || "",
    email: authState.user?.email || "",
  });
  const [passwordError, setPasswordError] = useState("");

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Gọi API cập nhật thông tin người dùng
      const updatedUser = await updateUser(
        authState.user?.id || "",
        profileForm.name,
        profileForm.email,
        authState.user?.role || "user"
      );

      if (updatedUser) {
        console.log("Updated user:", updatedUser);
      }

      toast.success("Profile updated successfully!");
      setEditing(false);
    } catch (error) {
      toast.error("Failed to update profile. Please try again.");
      console.error("Profile update failed:", error);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    // Trim passwords to avoid accidental spaces
    const current = passwordForm.current.trim();
    const newPassword = passwordForm.new.trim();
    const confirm = passwordForm.confirm.trim();

    if (newPassword !== confirm) {
      setPasswordError("New passwords don't match");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    const passwordData = {
      currentPassword: current,
      newPassword,
    };
    try {
      await userService.changePassword(authState.user?.id || "", passwordData);
      toast.success("Password updated successfully!");
      setPasswordForm({ current: "", new: "", confirm: "" });
    } catch (error) {
      setPasswordError("Failed to update password. Please try again.");
      console.error("Password update failed:", error);
    }
  };

  return (
    <Container className="profile-page">
      <div className="page-header">
        <h1>Profile Settings</h1>
        <p>Manage your account information and settings</p>
      </div>

      <Row>
        <Col lg={4} className="mb-4">
          <Card className="profile-card">
            <div className="profile-header">
              <div className="avatar-container">
                <img
                  src={defaultAvatar}
                  alt="Profile"
                  className="profile-avatar"
                />
                <button
                  className="avatar-edit-btn"
                  onClick={() => navigate("/user/face-register")}
                >
                  <Camera size={16} />
                </button>
              </div>
              <h3>{authState.user?.name}</h3>
              <p className="role-badge">{authState.user?.role}</p>
            </div>
            <div className="profile-info">
              <div className="info-item">
                <div className="info-label">Email</div>
                <div className="info-value">{authState.user?.email}</div>
              </div>

              <div className="info-item">
                <div className="info-label">User ID</div>
                <div className="info-value">{authState.user?.id}</div>
              </div>
            </div>
          </Card>
        </Col>

        <Col lg={8}>
          <Card className="settings-card">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <User size={18} />
                <h5 className="mb-0">Personal Information</h5>
              </div>
              <Button
                variant={editing ? "outline-secondary" : "outline-primary"}
                size="sm"
                onClick={() => setEditing(!editing)}
              >
                {editing ? (
                  "Cancel"
                ) : (
                  <>
                    <Edit size={14} className="me-1" /> Edit
                  </>
                )}
              </Button>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleProfileSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={profileForm.name}
                        disabled={!editing}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            name: e.target.value,
                          })
                        }
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email address</Form.Label>
                      <Form.Control
                        type="email"
                        value={profileForm.email}
                        disabled={!editing}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            email: e.target.value,
                          })
                        }
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {editing && (
                  <div className="d-flex justify-content-end">
                    <Button variant="primary" type="submit">
                      <Save size={16} className="me-2" /> Save Changes
                    </Button>
                  </div>
                )}
              </Form>
            </Card.Body>
          </Card>

          <Card className="settings-card mt-4">
            <Card.Header className="d-flex align-items-center gap-2">
              <Key size={18} />
              <h5 className="mb-0">Change Password</h5>
            </Card.Header>
            <Card.Body>
              {passwordError && <Alert variant="danger">{passwordError}</Alert>}

              <Form onSubmit={handlePasswordSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Current Password</Form.Label>
                      <Form.Control
                        type="password"
                        value={passwordForm.current}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            current: e.target.value,
                          })
                        }
                        placeholder="Enter your current password"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>New Password</Form.Label>
                      <Form.Control
                        type="password"
                        value={passwordForm.new}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            new: e.target.value,
                          })
                        }
                        placeholder="Enter new password"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Confirm New Password</Form.Label>
                      <Form.Control
                        type="password"
                        value={passwordForm.confirm}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            confirm: e.target.value,
                          })
                        }
                        placeholder="Confirm new password"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <div className="d-flex justify-content-end">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={
                      !passwordForm.current ||
                      !passwordForm.new ||
                      !passwordForm.confirm
                    }
                  >
                    Update Password
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfilePage;
