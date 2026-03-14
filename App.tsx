
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ClientsSection from './components/ClientsSection';
import Stats from './components/Stats';
import AIDataServices from './components/AIDataServices';
import AIDataServicesPage from './components/AIDataServicesPage';
import AIProjectsPage from './components/AIProjectsPage';
import TypeADataServicing from './components/TypeADataServicing';
import TypeBHorizontalLLMData from './components/TypeBHorizontalLLMData';
import TypeCVerticalLLMData from './components/TypeCVerticalLLMData';
import TypeDAIGC from './components/TypeDAIGC';
import PhilanthropyImpactPage from './components/PhilanthropyImpactPage';
import CareersPage from './components/CareersPage';
import JoinUsPage from './components/JoinUsPage';
import ContactPage from './components/ContactPage';
import LoginPage2 from './components/LoginPage2';
import SignUpPage from './components/SignUpPage';
import DashboardPage from './components/DashboardPage';
import AdminDashboardPage from './components/AdminDashboardPage';
import UserManagementPage from './components/UserManagementPage';
import AdminApplicantsPage from './components/AdminApplicantsPage';
import AboutSection from './components/AboutSection';
import AboutUsPage from './components/AboutUsPage';
import OfficesPage from './components/OfficesPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import FAQSection from './components/FAQSection';
import CTASection from './components/CTASection';
import Footer from './components/Footer';
import InnovationSection from './components/InnovationSection';
import {
  AUTH_EVENT_NAME,
  ensureAuthSubscription,
  getAuthUser,
  hasAdminAccess,
  initializeAuth,
  isAuthenticated,
} from './auth';

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname.replace(/\/+$/, ''));
  const [authed, setAuthed] = useState(() => isAuthenticated());
  const currentUser = getAuthUser();
  const adminAuthed = authed && hasAdminAccess(currentUser);
  const isPrivacyRoute = currentPath === '/privacy-policy' || currentPath === '/privacypolicy';
  const isAdminRoute =
    currentPath === '/admin' ||
    currentPath === '/admin/dashboard' ||
    currentPath === '/admin/users' ||
    currentPath === '/admin/applicants' ||
    currentPath === '/admin/analytics' ||
    currentPath === '/admin/courses';
  const hideChrome =
    currentPath === '/login' ||
    currentPath === '/login2' ||
    currentPath === '/signup' ||
    isAdminRoute ||
    (currentPath === '/dashboard' && adminAuthed);
  const routeTransitionKey = isAdminRoute ? 'admin-shell' : (currentPath || '/');

  useEffect(() => {
    const onPop = () => {
      setCurrentPath(window.location.pathname.replace(/\/+$/, ''));
      setAuthed(isAuthenticated());
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    const syncAuth = () => setAuthed(isAuthenticated());
    ensureAuthSubscription();
    void initializeAuth().then(syncAuth);
    window.addEventListener(AUTH_EVENT_NAME, syncAuth as EventListener);
    window.addEventListener('storage', syncAuth);
    return () => {
      window.removeEventListener(AUTH_EVENT_NAME, syncAuth as EventListener);
      window.removeEventListener('storage', syncAuth);
    };
  }, []);

  useEffect(() => {
    if (!adminAuthed) return;
    const normalizedPath = currentPath || '/';
    if (normalizedPath !== '/') return;
    window.history.pushState({}, '', '/admin/dashboard');
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, [adminAuthed, currentPath]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [currentPath]);

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen selection:bg-brand-primary selection:text-white dark:selection:bg-brand-saffron dark:selection:text-brand-dark transition-colors duration-300 overflow-x-hidden bg-brand-paper dark:bg-brand-dark"
      >
        {!hideChrome && <Navbar />}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={routeTransitionKey}
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            exit={isAdminRoute ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
            transition={
              isAdminRoute
                ? { duration: 0 }
                : { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
            }
          >
            {currentPath === '/ai-services' ? (
              <main>
                <AIDataServicesPage />
              </main>
            ) : currentPath === '/ai-projects' ? (
              <main>
                <AIProjectsPage />
              </main>
            ) : currentPath === '/type-a-data-servicing' ? (
              <main>
                <TypeADataServicing />
              </main>
            ) : currentPath === '/type-b-horizontal-llm-data' ? (
              <main>
                <TypeBHorizontalLLMData />
              </main>
            ) : currentPath === '/type-c-vertical-llm-data' ? (
              <main>
                <TypeCVerticalLLMData />
              </main>
            ) : currentPath === '/type-d-aigc' ? (
              <main>
                <TypeDAIGC />
              </main>
            ) : currentPath === '/philanthropy' ? (
              <main>
                <PhilanthropyImpactPage />
              </main>
            ) : currentPath === '/careers' ? (
              <main>
                <CareersPage />
              </main>
            ) : currentPath === '/join-us' ? (
              <main>
                <JoinUsPage />
              </main>
            ) : currentPath === '/contact' || currentPath === '/contact-us' ? (
              <main>
                <ContactPage />
              </main>
            ) : currentPath === '/login' ? (
              <main>
                <LoginPage2 />
              </main>
            ) : currentPath === '/dashboard' ? (
              <main>
                {authed ? (adminAuthed ? <AdminDashboardPage /> : <DashboardPage />) : <LoginPage2 />}
              </main>
            ) : currentPath === '/admin' || currentPath === '/admin/dashboard' || currentPath === '/admin/analytics' || currentPath === '/admin/courses' ? (
              <main>
                {adminAuthed ? <AdminDashboardPage /> : <LoginPage2 />}
              </main>
            ) : currentPath === '/admin/users' ? (
              <main>
                {adminAuthed ? <UserManagementPage /> : <LoginPage2 />}
              </main>
            ) : currentPath === '/admin/applicants' ? (
              <main>
                {adminAuthed ? <AdminApplicantsPage /> : <LoginPage2 />}
              </main>
            ) : currentPath === '/login2' ? (
              <main>
                <LoginPage2 />
              </main>
            ) : currentPath === '/signup' ? (
              <main>
                <SignUpPage />
              </main>
            ) : currentPath === '/about-us' ? (
              <main>
                <AboutUsPage />
              </main>
            ) : isPrivacyRoute ? (
              <main>
                <PrivacyPolicyPage />
              </main>
            ) : currentPath === '/offices' ? (
              <main>
                <OfficesPage />
              </main>
            ) : (
              <main>
                <Hero />
                <AboutSection />
                <ClientsSection />
                <InnovationSection />
                <Stats />
                <AIDataServices />
                <FAQSection />
                <CTASection />
              </main>
            )}
          </motion.div>
        </AnimatePresence>
        {!hideChrome && !isPrivacyRoute && <Footer />}
      </motion.div>
    </AnimatePresence>
  );
}

export default App;
