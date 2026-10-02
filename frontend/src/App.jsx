import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { LocationProvider } from './context/LocationContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SplashIntro } from './components/SplashIntro';
import { CompleteProfileModal } from './components/CompleteProfileModal';

import { LandingPage } from './pages/LandingPage';
import { PublicFeedPage } from './pages/PublicFeedPage';
import { NeedsReviewPage } from './pages/NeedsReviewPage';
import { SubmitProblemPage } from './pages/SubmitProblemPage';
import { ProblemDetailPage } from './pages/ProblemDetailPage';
import { UniversityPortalPage } from './pages/UniversityPortalPage';
import { IndustryPortalPage } from './pages/IndustryPortalPage';
import { ProjectWorkspacePage } from './pages/ProjectWorkspacePage';
import { GovernmentDashboardPage } from './pages/GovernmentDashboardPage';
import { OfficerMoneyPage } from './pages/OfficerMoneyPage';
import { CompanyPage } from './pages/CompanyPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { ImpactLeaderboardPage } from './pages/ImpactLeaderboardPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';

function MainApp() {
  const { user } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  // Set default tab based on user role for SIH26136, supporting direct hash navigation and persistence
  const getDefaultTab = () => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (hash) return hash;
    }
    const saved = typeof window !== 'undefined' ? localStorage.getItem('sih_active_tab') : null;
    if (saved && user) {
      if (user.role === 'startup' && (saved === 'university' || saved.startsWith('startup-'))) {
        return saved;
      }
      if (user.role === 'government' && (saved === 'govt-dashboard' || saved === 'officer-money' || saved === 'submit' || saved === 'workspace' || saved === 'feed' || saved === 'map')) {
        return saved;
      }
      if (user.role === 'expert' && (saved === 'needs-review' || saved.startsWith('expert-'))) return saved;
      if (user.role === 'validator' && (saved === 'industry' || saved.startsWith('validator-'))) return saved;
      if (user.role === 'admin' && saved === 'admin') return saved;
    }
    if (user?.role === 'government') return 'govt-dashboard';
    if (user?.role === 'startup') return 'university';
    if (user?.role === 'expert') return 'needs-review';
    if (user?.role === 'validator') return 'industry';
    if (user?.role === 'admin') return 'admin';
    return 'landing';
  };

  const [activeTab, setActiveTab] = useState(getDefaultTab());

  // Synchronize activeTab with URL hash and localStorage
  useEffect(() => {
    if (activeTab) {
      localStorage.setItem('sih_active_tab', activeTab);
      if (window.location.hash.replace(/^#\/?/, '') !== activeTab) {
        window.history.replaceState(null, '', `#${activeTab}`);
      }
    }
  }, [activeTab]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (hash && hash !== activeTab) {
        setActiveTab(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activeTab]);

  // When user role changes (e.g. via demo login switcher), align activeTab with new role
  useEffect(() => {
    if (!user) return;
    if (activeTab === 'company' || activeTab.startsWith('company/')) return;
    const isStartupTab = activeTab === 'university' || activeTab.startsWith('startup-');
    const isValidatorTab = activeTab === 'industry' || activeTab.startsWith('validator-');
    const isExpertTab = activeTab === 'needs-review' || activeTab.startsWith('expert-');
    if (user.role === 'startup' && !isStartupTab) {
      setActiveTab('university');
    } else if (user.role === 'validator' && !isValidatorTab) {
      setActiveTab('industry');
    } else if (user.role === 'expert' && !isExpertTab) {
      setActiveTab('needs-review');
    } else if (user.role === 'government' && (isStartupTab || isValidatorTab || isExpertTab)) {
      setActiveTab('govt-dashboard');
    }
  }, [user?.role]);
  const [selectedProblemId, setSelectedProblemId] = useState('chal-1');
  const [selectedTeamId, setSelectedTeamId] = useState('pilot-1');
  const [selectedCompanyId, setSelectedCompanyId] = useState('P1');

  useEffect(() => {
    if (activeTab.startsWith('company/')) {
      const cid = activeTab.split('/')[1];
      if (cid) setSelectedCompanyId(cid);
    } else if (activeTab.startsWith('workspace/')) {
      const tid = activeTab.split('/')[1];
      if (tid) setSelectedTeamId(tid);
    }
  }, [activeTab]);
  
  // Language translation state
  const [currentLang, setCurrentLang] = useState('en');

  // Controls animated splash screen intro
  const [showSplash, setShowSplash] = useState(true);

  const [signupInitialRole, setSignupInitialRole] = useState('government');

  return (
    <div className="min-h-screen flex bg-white dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 font-sans selection:bg-[#0077b6] selection:text-white transition-colors duration-200">
      
      {/* Animated Splash Intro */}
      {showSplash && (
        <SplashIntro onComplete={() => setShowSplash(false)} />
      )}

      {/* Left Vertical Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onTriggerSplash={() => setShowSplash(true)}
      />

      {/* Right Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-white dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100">
        
        {/* Top Navbar Header */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentLang={currentLang}
          onChangeLang={setCurrentLang}
          onOpenProfileModal={() => setShowProfileModal(true)}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
          {activeTab === 'login' && (
            <LoginPage setActiveTab={setActiveTab} />
          )}

          {activeTab === 'signup' && (
            <SignupPage setActiveTab={setActiveTab} defaultRole={signupInitialRole} />
          )}

          {activeTab === 'landing' && (
            <LandingPage 
              setActiveTab={setActiveTab} 
              setSelectedProblemId={setSelectedProblemId}
              setSignupInitialRole={setSignupInitialRole}
            />
          )}

          {activeTab === 'map' && (
            <div className="text-center py-20 space-y-4">
              <div className="text-5xl">🗺️</div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Pilot Testbed Map</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Interactive geographic map of active pilot sandbox locations across India. 
                This feature integrates with municipal GIS systems during live deployment.
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                ⚠️ Map visualization requires geographic API integration (simulated in demo)
              </p>
            </div>
          )}

          {activeTab === 'feed' && (
            <PublicFeedPage 
              setActiveTab={setActiveTab} 
              setSelectedProblemId={setSelectedProblemId} 
              setSelectedTeamId={setSelectedTeamId} 
            />
          )}

          {(activeTab === 'needs-review' || activeTab === 'expert' || activeTab.startsWith('expert-')) && (
            <NeedsReviewPage 
              activeTab={activeTab}
              setActiveTab={setActiveTab} 
              setSelectedProblemId={setSelectedProblemId} 
            />
          )}

          {activeTab === 'submit' && (
            <SubmitProblemPage 
              setActiveTab={setActiveTab} 
              setSelectedProblemId={setSelectedProblemId} 
            />
          )}

          {activeTab === 'detail' && (
            <ProblemDetailPage 
              problemId={selectedProblemId} 
              setActiveTab={setActiveTab} 
              setSelectedTeamId={setSelectedTeamId} 
            />
          )}

          {(activeTab === 'university' || activeTab === 'startup' || activeTab.startsWith('startup-')) && (
            <UniversityPortalPage 
              activeTab={activeTab}
              setActiveTab={setActiveTab} 
              setSelectedProblemId={setSelectedProblemId} 
              setSelectedTeamId={setSelectedTeamId} 
            />
          )}

          {(activeTab === 'industry' || activeTab === 'validator' || activeTab.startsWith('validator-')) && (
            <IndustryPortalPage 
              activeTab={activeTab}
              setActiveTab={setActiveTab} 
              setSelectedTeamId={setSelectedTeamId} 
            />
          )}

          {(activeTab === 'workspace' || activeTab.startsWith('workspace')) && (
            <ProjectWorkspacePage 
              teamId={activeTab.startsWith('workspace/') ? activeTab.split('/')[1] : selectedTeamId} 
              setActiveTab={setActiveTab} 
              setSelectedCompanyId={setSelectedCompanyId}
              setSelectedProblemId={setSelectedProblemId}
            />
          )}

          {activeTab === 'govt-dashboard' && (
            <GovernmentDashboardPage 
              setActiveTab={setActiveTab} 
              setSelectedProblemId={setSelectedProblemId} 
              setSelectedTeamId={setSelectedTeamId} 
              setSelectedCompanyId={setSelectedCompanyId}
            />
          )}

          {activeTab === 'officer-money' && (
            <OfficerMoneyPage 
              setActiveTab={setActiveTab} 
              setSelectedCompanyId={setSelectedCompanyId}
              setSelectedTeamId={setSelectedTeamId}
            />
          )}

          {(activeTab === 'company' || activeTab.startsWith('company')) && (
            <CompanyPage 
              companyId={activeTab.startsWith('company/') ? activeTab.split('/')[1] : selectedCompanyId} 
              setActiveTab={setActiveTab} 
            />
          )}

          {activeTab === 'admin' && (
            <AdminDashboardPage 
              setActiveTab={setActiveTab} 
            />
          )}

          {activeTab === 'impact' && (
            <ImpactLeaderboardPage 
              setActiveTab={setActiveTab} 
              setSelectedProblemId={setSelectedProblemId} 
            />
          )}

        </main>

        {/* Footer - Only visible on public landing page */}
        {activeTab === 'landing' && (
          <Footer setActiveTab={setActiveTab} />
        )}

        {/* Profile Completion Modal */}
        <CompleteProfileModal 
          isOpen={showProfileModal} 
          onClose={() => setShowProfileModal(false)} 
        />

      </div>

    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <LocationProvider>
            <MainApp />
          </LocationProvider>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
