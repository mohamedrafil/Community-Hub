import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/Landing/LandingPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import CommunityHomePage from './pages/Community/CommunityHomePage';
import DirectMessagesPage from './pages/Messages/DirectMessagesPage';
import AdminPanelPage from './pages/Admin/AdminPanelPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/community/:communityId"
              element={
                <ProtectedRoute>
                  <CommunityHomePage />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/community/:communityId/messages"
              element={
                <ProtectedRoute>
                  <DirectMessagesPage />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/community/:communityId/admin"
              element={
                <ProtectedRoute>
                  <AdminPanelPage />
                </ProtectedRoute>
              }
            />
          </Routes>

          {/* Toast notifications */}
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            className="mt-16"
          />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
