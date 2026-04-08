
import React, { useEffect } from 'react';
import { Route, Routes, BrowserRouter as Router, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import ScrollToTop from '@/components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Pages
import LandingPage from '@/pages/LandingPage';
import HomePage from '@/pages/HomePage';
import SignupPage from '@/pages/SignupPage';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import AboutPage from '@/pages/AboutPage';
import PrivacyPage from '@/pages/PrivacyPage';
import TermsPage from '@/pages/TermsPage';
import ContactPage from '@/pages/ContactPage';
import PricingPage from '@/pages/PricingPage';
import ApiDocsPage from '@/pages/ApiDocsPage';
import ChangelogPage from '@/pages/ChangelogPage';
import ScoreMyPostPage from '@/pages/ScoreMyPostPage';
import DynamicPage from '@/pages/DynamicPage';
import CalendarPage from "@/pages/CalendarPage";
import LinkedInCallbackPage from '@/pages/LinkedInCallbackPage';

// ─── Theme initializer — runs before first paint ──────────────────────────────
// Reads localStorage and applies data-theme to <html> so every page loads
// with the correct theme without a flash of wrong colors.
const ThemeInitializer = () => {
  useEffect(() => {
    const applyTheme = () => {
      try {
        const saved = localStorage.getItem('as_theme') || 'light';
        const html = document.documentElement;
        html.setAttribute('data-theme', saved);
        if (saved === 'dark') {
          html.classList.add('dark');
        } else {
          html.classList.remove('dark');
        }
      } catch {
        // silent — localStorage may be blocked in some environments
      }
    };

    applyTheme();

    // Listen for theme changes dispatched from SettingsPanel / DashboardPage
    const handleThemeChange = (e) => {
      const theme = e.detail?.theme;
      if (theme) {
        const html = document.documentElement;
        html.setAttribute('data-theme', theme);
        if (theme === 'dark') {
          html.classList.add('dark');
        } else {
          html.classList.remove('dark');
        }
      }
    };

    window.addEventListener('as:themechange', handleThemeChange);
    return () => window.removeEventListener('as:themechange', handleThemeChange);
  }, []);

  return null;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeInitializer />
        <ScrollToTop />
        <div className="flex flex-col min-h-screen bg-theme-primary transition-colors duration-200">
          <Header />

          <main className="flex-grow">
            <Routes>

              {/* Main pages */}
              <Route path="/" element={<HomePage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/api-docs" element={<ApiDocsPage />} />
              <Route path="/changelog" element={<ChangelogPage />} />
              <Route
                path="/calendar"
                element={
                  <ProtectedRoute>
                    <CalendarPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/auth/linkedin/callback" element={<LinkedInCallbackPage />} />

              {/* Legal pages (support both formats) */}
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/privacy_policy" element={<PrivacyPage />} />
              <Route path="/privacy-policy" element={<Navigate to="/privacy_policy" replace />} />

              <Route path="/terms" element={<TermsPage />} />
              <Route path="/terms_of_service" element={<TermsPage />} />
              <Route path="/terms-of-service" element={<Navigate to="/terms_of_service" replace />} />

              {/* Cookie Policy — served from site_pages DB */}
              <Route path="/cookies" element={<DynamicPage slug="cookies" titleFallback="Cookie Policy" />} />
              <Route path="/cookie-policy" element={<Navigate to="/cookies" replace />} />

              {/* Dashboard */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              <Route path="/score" element={<ScoreMyPostPage />} />

            </Routes>
          </main>

          <Footer />
        </div>

        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;
