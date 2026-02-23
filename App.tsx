
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
import ContactPage from './components/ContactPage';
import LoginPage2 from './components/LoginPage2';
import DashboardPage from './components/DashboardPage';
import AboutSection from './components/AboutSection';
import AboutUsPage from './components/AboutUsPage';
import OfficesPage from './components/OfficesPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import FAQSection from './components/FAQSection';
import CTASection from './components/CTASection';
import Footer from './components/Footer';
import InnovationSection from './components/InnovationSection';
import { isAuthenticated } from './auth';

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname.replace(/\/+$/, ''));
  const authed = isAuthenticated();
  const isPrivacyRoute = currentPath === '/privacy-policy' || currentPath === '/privacypolicy';
  const hideChrome = currentPath === '/login' || currentPath === '/login2';

  useEffect(() => {
    const onPop = () => setCurrentPath(window.location.pathname.replace(/\/+$/, ''));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

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
        ) : currentPath === '/contact' || currentPath === '/contact-us' ? (
          <main>
            <ContactPage />
          </main>
        ) : currentPath === '/login' ? (
          <main>
            {authed ? <DashboardPage /> : <LoginPage2 />}
          </main>
        ) : currentPath === '/dashboard' ? (
          <main>
            {authed ? <DashboardPage /> : <LoginPage2 />}
          </main>
        ) : currentPath === '/login2' ? (
          <main>
            <LoginPage2 />
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
        {!hideChrome && !isPrivacyRoute && <Footer />}
      </motion.div>
    </AnimatePresence>
  );
}

export default App;
