import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import LoadingScreen from './components/common/LoadingScreen';

const LandingPage = lazy(() => import('./pages/landing/LandingPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('./pages/auth/VerifyEmailPage'));

const ProviderDashboard = lazy(() => import('./pages/provider/DashboardPage'));
const ProfilePage = lazy(() => import('./pages/provider/ProfilePage'));
const DocumentsPage = lazy(() => import('./pages/provider/DocumentsPage'));
const ApplicationStatusPage = lazy(() => import('./pages/provider/ApplicationStatusPage'));

const AdminDashboard = lazy(() => import('./pages/admin/DashboardPage'));
const AdminProvidersPage = lazy(() => import('./pages/admin/ProvidersPage'));
const AdminProviderDetailPage = lazy(() => import('./pages/admin/ProviderDetailPage'));
const AdminAnalyticsPage = lazy(() => import('./pages/admin/AnalyticsPage'));

const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

export default function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
        </Route>

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

        <Route element={<ProtectedRoute allowedRoles={['provider']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<ProviderDashboard />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/application-status" element={<ApplicationStatusPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['admin', 'superadmin']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/providers" element={<AdminProvidersPage />} />
            <Route path="/admin/providers/:id" element={<AdminProviderDetailPage />} />
            <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
