import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { useAuth } from './hooks/useAuth';

// Layout
import { DashboardLayout } from './components/layout/DashboardLayout';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

// Student Pages
import { StudentDashboard } from './pages/student/Dashboard';
import { StudentProfile } from './pages/student/Profile';
import { StudentMaterials } from './pages/student/Materials';
import { StudentTests } from './pages/student/Tests';
import { TakeTest } from './pages/student/TakeTest';
import { StudentResult } from './pages/student/Result';
import { ReviewPaper } from './pages/student/ReviewPaper';
import { StudentLeaderboard } from './pages/student/Leaderboard';
import { StudentNotifications } from './pages/student/Notifications';

// Admin Pages
import { AdminDashboard } from './pages/admin/Dashboard';
import { Students as AdminStudents } from './pages/admin/Students';
import { Colleges } from './pages/admin/Colleges';
import { AdminMaterials } from './pages/admin/Materials';
import { UploadMaterial } from './pages/admin/UploadMaterial';
import { CreateTest } from './pages/admin/CreateTest';
import { QuestionBank } from './pages/admin/QuestionBank';
import { AIQuestionGenerator } from './pages/admin/AIQuestionGenerator';
import { Reports } from './pages/admin/Reports';
import { Analytics } from './pages/admin/Analytics';
import { AdminLeaderboard } from './pages/admin/Leaderboard';
import { AdminNotifications } from './pages/admin/Notifications';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'Admin' ? '/admin/dashboard' : '/student/dashboard'} replace />;
  }

  return children;
};

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Student Routes */}
              <Route
                path="/student/*"
                element={
                  <ProtectedRoute allowedRole="Student">
                    <Routes>
                      <Route path="dashboard" element={<DashboardLayout><StudentDashboard /></DashboardLayout>} />
                      <Route path="profile" element={<DashboardLayout><StudentProfile /></DashboardLayout>} />
                      <Route path="materials" element={<DashboardLayout><StudentMaterials /></DashboardLayout>} />
                      <Route path="tests" element={<DashboardLayout><StudentTests /></DashboardLayout>} />
                      <Route path="take-test/:testId" element={<TakeTest />} />
                      <Route path="results/:id" element={<DashboardLayout><StudentResult /></DashboardLayout>} />
                      <Route path="review-paper/:resultId" element={<DashboardLayout><ReviewPaper /></DashboardLayout>} />
                      <Route path="leaderboard" element={<DashboardLayout><StudentLeaderboard /></DashboardLayout>} />
                      <Route path="notifications" element={<DashboardLayout><StudentNotifications /></DashboardLayout>} />
                      <Route path="*" element={<Navigate to="dashboard" replace />} />
                    </Routes>
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute allowedRole="Admin">
                    <Routes>
                      <Route path="dashboard" element={<DashboardLayout><AdminDashboard /></DashboardLayout>} />
                      <Route path="students" element={<DashboardLayout><AdminStudents /></DashboardLayout>} />
                      <Route path="colleges" element={<DashboardLayout><Colleges /></DashboardLayout>} />
                      <Route path="materials" element={<DashboardLayout><AdminMaterials /></DashboardLayout>} />
                      <Route path="upload-material" element={<DashboardLayout><UploadMaterial /></DashboardLayout>} />
                      <Route path="create-test" element={<DashboardLayout><CreateTest /></DashboardLayout>} />
                      <Route path="question-bank" element={<DashboardLayout><QuestionBank /></DashboardLayout>} />
                      <Route path="ai-generator" element={<DashboardLayout><AIQuestionGenerator /></DashboardLayout>} />
                      <Route path="reports" element={<DashboardLayout><Reports /></DashboardLayout>} />
                      <Route path="analytics" element={<DashboardLayout><Analytics /></DashboardLayout>} />
                      <Route path="leaderboard" element={<DashboardLayout><AdminLeaderboard /></DashboardLayout>} />
                      <Route path="notifications" element={<DashboardLayout><AdminNotifications /></DashboardLayout>} />
                      <Route path="*" element={<Navigate to="dashboard" replace />} />
                    </Routes>
                  </ProtectedRoute>
                }
              />

              {/* Root Fallback Redirect */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
