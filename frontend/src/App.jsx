import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import PublicPetsPage from './pages/PublicPetsPage';
import PublicPetDetailPage from './pages/PublicPetDetailPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PetsPage from './pages/PetsPage';
import PetDetailPage from './pages/PetDetailPage';
import MedicalPage from './pages/MedicalPage';
import VaccinationPage from './pages/VaccinationPage';
import MonthlyReportsPage from './pages/MonthlyReportsPage';
import AdoptionsPage from './pages/AdoptionsPage';
import VisitsPage from './pages/VisitsPage';
import FosterPage from './pages/FosterPage';
import RescuePage from './pages/RescuePage';
import UsersPage from './pages/UsersPage';
import ReportsPage from './pages/ReportsPage';
import NotificationsPage from './pages/NotificationsPage';
import ActivityLogsPage from './pages/ActivityLogsPage';
import SettingsPage from './pages/SettingsPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import NotFoundPage from './pages/NotFoundPage';

function AppContent() {
  const { user, isAuthenticated, hasPermission, isAdmin } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [currentParam, setCurrentParam] = useState(null);

  // Sync with browser URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      if (!hash) {
        setCurrentPage('home');
        return;
      }
      const parts = hash.split('/');
      const page = parts[0] || 'home';
      const param = parts[1] || null;
      setCurrentPage(page);
      setCurrentParam(param);
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (page, param = null) => {
    setCurrentPage(page);
    setCurrentParam(param);
    const hash = param ? `#/${page}/${param}` : `#/${page}`;
    window.location.hash = hash;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Permission Verification Mapping
  const permissionRequirements = {
    pets: 'VIEW_PETS',
    'pet-detail': 'VIEW_PETS',
    rescue: 'VIEW_PETS',
    medical: 'MEDICAL',
    vaccinations: 'VACCINATION',
    'monthly-reports': 'MONTHLY_REPORTS',
    adoptions: 'ADOPTION',
    visits: 'VISITS',
    foster: 'VIEW_PETS',
    users: 'USER_MANAGEMENT',
    reports: 'REPORTS',
    settings: 'SETTINGS',
    'activity-logs': 'ADMIN_ONLY'
  };

  const isPortalView = [
    'dashboard', 'pets', 'pet-detail', 'rescue', 'medical',
    'vaccinations', 'monthly-reports', 'adoptions', 'visits',
    'foster', 'users', 'reports', 'notifications', 'activity-logs',
    'settings'
  ].includes(currentPage);

  // Render Page Content
  const renderPage = () => {
    // Check permission if on portal page
    if (isPortalView) {
      if (!isAuthenticated) {
        return <LoginPage onNavigate={navigate} />;
      }

      const reqPerm = permissionRequirements[currentPage];
      if (reqPerm) {
        if (reqPerm === 'ADMIN_ONLY' && !isAdmin) {
          return <UnauthorizedPage onNavigate={navigate} />;
        }
        if (reqPerm !== 'ADMIN_ONLY' && !hasPermission(reqPerm)) {
          return <UnauthorizedPage onNavigate={navigate} />;
        }
      }
    }

    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={navigate} />;
      case 'public-pets':
        return <PublicPetsPage onNavigate={navigate} initialCategory={currentParam || 'All'} />;
      case 'public-pet-detail':
        return <PublicPetDetailPage petId={currentParam} onNavigate={navigate} />;
      case 'login':
        return <LoginPage onNavigate={navigate} />;

      // Protected Modules
      case 'dashboard':
        return <DashboardPage onNavigate={navigate} />;
      case 'pets':
        return <PetsPage onNavigate={navigate} />;
      case 'pet-detail':
        return <PetDetailPage petId={currentParam} onNavigate={navigate} />;
      case 'medical':
        return <MedicalPage onNavigate={navigate} />;
      case 'vaccinations':
        return <VaccinationPage onNavigate={navigate} />;
      case 'monthly-reports':
        return <MonthlyReportsPage onNavigate={navigate} />;
      case 'adoptions':
        return <AdoptionsPage onNavigate={navigate} />;
      case 'visits':
        return <VisitsPage onNavigate={navigate} />;
      case 'foster':
        return <FosterPage onNavigate={navigate} />;
      case 'rescue':
        return <RescuePage onNavigate={navigate} />;
      case 'users':
        return <UsersPage onNavigate={navigate} />;
      case 'reports':
        return <ReportsPage onNavigate={navigate} />;
      case 'notifications':
        return <NotificationsPage onNavigate={navigate} />;
      case 'activity-logs':
        return <ActivityLogsPage onNavigate={navigate} />;
      case 'settings':
        return <SettingsPage onNavigate={navigate} />;

      default:
        return <NotFoundPage onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* Top Navbar */}
      <Navbar onNavigate={navigate} activePage={currentPage} />

      {/* Main Container */}
      {isPortalView && isAuthenticated ? (
        <div className="flex flex-1">
          {/* Left Admin / Staff Sidebar */}
          <Sidebar activePage={currentPage} onNavigate={navigate} />

          {/* Main Dashboard / Module Work Area */}
          <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full">
            {renderPage()}
          </main>
        </div>
      ) : (
        <main className="flex-1">
          {renderPage()}
        </main>
      )}

      {/* Footer */}
      <Footer onNavigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
