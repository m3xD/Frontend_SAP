import "bootstrap/dist/css/bootstrap.min.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import SignUpPage from "./pages/auth/SignUpPage/SignUpPage";
import SignInPage from "./pages/auth/SignInPage/SignInPage";
import Header from "./components/Header/Header";
import { useAuth } from "./hooks/useAuth";
import ToastComponent from "./components/Toast/ToastComponent";
import UserDashboard from "./pages/user/UserDashboard/UserDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard/AdminDashboard";
import ProfilePage from "./pages/profile/ProfilePage";
import UserManagement from "./pages/admin/UserManagement/UserManagement";
import AssessmentManagement from "./pages/admin/AssessmentManagement/AssessmentManagement";
import TakingAssessment from "./pages/user/TakingAssessment/TakingAssessment";
import AssessmentDetail from "./pages/admin/AssessmentDetail/AssessmentDetail";
import AssessmentLayout from "./layout/AssessmentLayout";
import UserLayout from "./layout/UserLayout";

// Create a protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { authState } = useAuth();
  const location = useLocation();

  if (!authState.isAuthenticated) {
    // Redirect to signin if not authenticated
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Create a route that redirects authenticated users
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { authState } = useAuth();

  if (authState.isAuthenticated) {
    // Redirect to appropriate dashboard based on role
    if (authState.user?.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/user/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  const { authState } = useAuth();

  if (authState.loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      {authState.isAuthenticated && <Header />}
      <Routes>
        {/* Default route */}
        <Route
          path="/"
          element={
            authState.isAuthenticated ? (
              authState.user?.role === "admin" ? (
                <Navigate to="/admin/dashboard" />
              ) : (
                <Navigate to="/user/dashboard" />
              )
            ) : (
              <Navigate to="/signin" />
            )
          }
        />

        {/* Auth routes - redirect if already authenticated */}
        <Route
          path="/signup"
          element={
            <AuthRoute>
              <SignUpPage />
            </AuthRoute>
          }
        />
        <Route
          path="/signin"
          element={
            <AuthRoute>
              <SignInPage />
            </AuthRoute>
          }
        />

        {/* Both routes - protected */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* User routes - protected */}

        <Route
          path="/user/dashboard"
          element={
            <ProtectedRoute>
              {authState.user?.role === "user" ? (
                <UserDashboard />
              ) : (
                <Navigate to="/" />
              )}
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/assessments/take/:attemptId"
          element={
            <ProtectedRoute>
              {authState.user?.role === "user" ? (
                <TakingAssessment />
              ) : (
                <Navigate to="/" />
              )}
            </ProtectedRoute>
          }
        />

        {/* Admin routes - protected */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              {authState.user?.role === "admin" ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/" />
              )}
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              {authState.user?.role === "admin" ? (
                <UserLayout>
                  <UserManagement />
                </UserLayout>
              ) : (
                <Navigate to="/" />
              )}
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/assessments"
          element={
            <ProtectedRoute>
              {authState.user?.role === "admin" ? (
                <AssessmentLayout>
                  <AssessmentManagement />
                </AssessmentLayout>
              ) : (
                <Navigate to="/" />
              )}
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/assessments/:id"
          element={
            <ProtectedRoute>
              {authState.user?.role === "admin" ? (
                <AssessmentLayout>
                  <AssessmentDetail />
                </AssessmentLayout>
              ) : (
                <Navigate to="/" />
              )}
            </ProtectedRoute>
          }
        />

        {/* 404 page */}
        <Route path="*" element={<div>Page not found</div>} />
      </Routes>
      <ToastComponent />
    </Router>
  );
}

export default App;
