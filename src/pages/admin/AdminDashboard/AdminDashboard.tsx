import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table, Badge, Spinner, Alert } from "react-bootstrap";
import { Users, FileText, BarChart2, Activity, CheckCircle, AlertTriangle, XCircle, Clock } from "react-feather";
import { useAuth } from "../../../hooks/useAuth";
import adminService from "../../../services/adminService";
import { AdminDashboardSummary, ActivityTimeline, SystemStatus } from "../../../types/AdminServiceTypes";
import "./AdminDashboard.scss";

const AdminDashboard: React.FC = () => {
  const { authState } = useAuth();
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
  const [activityTimeline, setActivityTimeline] = useState<ActivityTimeline | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch data in parallel
        const [summaryData, activityData, statusData] = await Promise.all([
          adminService.getAdminDashboardSummary(),
          adminService.getActivityTimeline(),
          adminService.getSystemStatus()
        ]);
        
        setSummary(summaryData);
        setActivityTimeline(activityData);
        setSystemStatus(statusData);
      } catch (err) {
        setError("Failed to load dashboard data. Please try again later.");
        console.error("Dashboard data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Helper function to render status icon
  const renderStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="text-success" size={18} />;
      case 'degraded':
        return <AlertTriangle className="text-warning" size={18} />;
      case 'down':
        return <XCircle className="text-danger" size={18} />;
      default:
        return <Activity size={18} />;
    }
  };

  // Format date for timeline
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <Container className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading dashboard data...</p>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <Container className="py-4">
          <Alert variant="danger">
            <Alert.Heading>Error Loading Dashboard</Alert.Heading>
            <p>{error}</p>
          </Alert>
        </Container>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <Container>
        <div className="dashboard-header">
          <h1>Welcome, {authState.user?.name}</h1>
          <p className="text-muted">Here's what's happening with your platform today</p>
        </div>

        {/* Summary Stats */}
        <Row className="stats-section">
          <Col md={3} className="mb-4 mb-md-0">
            <Card className="stat-card">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="stat-icon bg-primary-light">
                    <Users size={22} className="text-primary" />
                  </div>
                  <div className="ms-3">
                    <h3>{summary?.users.total || 0}</h3>
                    <p>Total Users</p>
                  </div>
                </div>
                <div className="stat-footer">
                  <Badge bg="success">+{summary?.users.newThisWeek || 0} this week</Badge>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3} className="mb-4 mb-md-0">
            <Card className="stat-card">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="stat-icon bg-success-light">
                    <FileText size={22} className="text-success" />
                  </div>
                  <div className="ms-3">
                    <h3>{summary?.assessments.total || 0}</h3>
                    <p>Assessments</p>
                  </div>
                </div>
                <div className="stat-footer">
                  <span>{summary?.assessments.active || 0} active</span>
                  <span className="mx-2">•</span>
                  <span>{summary?.assessments.draft || 0} drafts</span>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3} className="mb-4 mb-md-0">
            <Card className="stat-card">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="stat-icon bg-warning-light">
                    <Activity size={22} className="text-warning" />
                  </div>
                  <div className="ms-3">
                    <h3>{summary?.activity.assessmentAttempts.total || 0}</h3>
                    <p>Attempts</p>
                  </div>
                </div>
                <div className="stat-footer">
                  <span>Pass rate: {summary?.activity.assessmentAttempts.passRate || 0}%</span>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3}>
            <Card className="stat-card">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="stat-icon bg-danger-light">
                    <Clock size={22} className="text-danger" />
                  </div>
                  <div className="ms-3">
                    <h3>{summary?.activity.usersOnline || 0}</h3>
                    <p>Users Online</p>
                  </div>
                </div>
                <div className="stat-footer">
                  <span>{summary?.activity.recentSuspiciousActivity || 0} suspicious activities</span>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Activity and System Status */}
        <Row className="mt-4">
          <Col lg={8}>
            <Card className="dashboard-card">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Recent Activity</h5>
                <Badge bg="info" pill>Last 24 hours</Badge>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="timeline-container">
                  {activityTimeline?.timeline && activityTimeline.timeline.length > 0 ? (
                    activityTimeline.timeline.map((activity, index) => (
                      <div key={activity.id} className="timeline-item">
                        <div className="timeline-marker"></div>
                        <div className="timeline-content">
                          <h6>{activity.type}</h6>
                          <p>
                            User <strong>{activity.user}</strong> {activity.type.toLowerCase()} 
                            {activity.assessment && ` in assessment "${activity.assessment}"`}
                            {activity.result && 
                              <Badge bg={activity.result.status === 'passed' ? 'success' : 'danger'} className="ms-2">
                                {activity.result.score}% - {activity.result.status}
                              </Badge>
                            }
                          </p>
                          <small className="text-muted">{formatDate(activity.timestamp)}</small>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-muted">
                      <Activity size={24} className="mb-2" />
                      <p>No recent activity to display</p>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={4} className="mt-4 mt-lg-0">
            <Card className="dashboard-card">
              <Card.Header>
                <h5 className="mb-0">System Status</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex align-items-center mb-3">
                  <div className={`status-indicator ${systemStatus?.status}`}></div>
                  <div className="ms-2">
                    <h6 className="mb-0">Overall System Status</h6>
                    <span className="text-capitalize">{systemStatus?.status}</span>
                  </div>
                </div>
                
                <Table className="system-services-table">
                  <thead>
                    <tr>
                      <th>Service</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {systemStatus && Object.entries(systemStatus.services).map(([service, status]) => (
                      <tr key={service}>
                        <td className="text-capitalize">{service}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            {renderStatusIcon(status)}
                            <span className="ms-2 text-capitalize">{status}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                
                <div className="system-stats mt-3">
                  <div className="d-flex justify-content-between">
                    <span>CPU Usage</span>
                    <span>{systemStatus?.statistics.cpuUsage}%</span>
                  </div>
                  <div className="progress mb-2">
                    <div 
                      className="progress-bar" 
                      role="progressbar" 
                      style={{ width: `${systemStatus?.statistics.cpuUsage}%` }}
                      aria-valuenow={systemStatus?.statistics.cpuUsage || 0} 
                      aria-valuemin={0} 
                      aria-valuemax={100}
                    ></div>
                  </div>
                  
                  <div className="d-flex justify-content-between">
                    <span>Memory Usage</span>
                    <span>{systemStatus?.statistics.memoryUsage}%</span>
                  </div>
                  <div className="progress">
                    <div 
                      className="progress-bar" 
                      role="progressbar" 
                      style={{ width: `${systemStatus?.statistics.memoryUsage}%` }}
                      aria-valuenow={systemStatus?.statistics.memoryUsage || 0} 
                      aria-valuemin={0} 
                      aria-valuemax={100}
                    ></div>
                  </div>
                </div>
                
                <small className="d-block text-muted mt-3">
                  Last checked: {systemStatus?.lastChecked ? formatDate(systemStatus.lastChecked) : 'Unknown'}
                </small>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AdminDashboard;
