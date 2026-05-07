import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/shared/ErrorBoundary';
import ToastProvider from './components/shared/ToastProvider';
import PageLoader from './components/shared/PageLoader';
import { AuthProvider } from './contexts/AuthContext';

import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';

const QuranEditorPage  = lazy(() => import('./pages/QuranEditorPage'));
const SunnahEditorPage = lazy(() => import('./pages/SunnahEditorPage'));
const CustomEditorPage = lazy(() => import('./pages/CustomEditorPage'));
const LoginPage        = lazy(() => import('./pages/LoginPage'));
const RegisterPage     = lazy(() => import('./pages/RegisterPage'));
const DashboardPage    = lazy(() => import('./pages/DashboardPage'));
const PricingPage      = lazy(() => import('./pages/PricingPage'));
const AdminPage        = lazy(() => import('./pages/AdminPage'));
const AboutPage        = lazy(() => import('./pages/AboutPage'));
const PrivacyPage      = lazy(() => import('./pages/PrivacyPage'));
const TermsPage        = lazy(() => import('./pages/TermsPage'));
const ContactPage      = lazy(() => import('./pages/ContactPage'));

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/"               element={<HomePage />} />
                <Route path="/login"          element={<LoginPage />} />
                <Route path="/register"       element={<RegisterPage />} />
                <Route path="/pricing"        element={<PricingPage />} />
                <Route path="/about"          element={<AboutPage />} />
                <Route path="/privacy"        element={<PrivacyPage />} />
                <Route path="/terms"          element={<TermsPage />} />
                <Route path="/contact"        element={<ContactPage />} />
                <Route path="/editor"         element={<QuranEditorPage />} />
                <Route path="/editor/quran"   element={<QuranEditorPage />} />
                <Route path="/editor/sunnah"  element={<SunnahEditorPage />} />
                <Route path="/editor/custom"  element={<CustomEditorPage />} />
                <Route path="/sunnah"         element={<Navigate to="/editor/sunnah" replace />} />
                <Route path="/custom"         element={<Navigate to="/editor/custom" replace />} />
                <Route path="/dashboard"      element={<DashboardPage />} />
                <Route path="/admin"          element={<AdminPage />} />
                <Route path="*"              element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
