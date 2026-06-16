import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import RosterRedirect from './pages/RosterRedirect';
import ResourcePlanningPage from './pages/ResourcePlanningPage';
import ExpertProfileDeepLink from './pages/ExpertProfileDeepLink';
import ManagerDashboardPage from './pages/ManagerDashboardPage';
import Dashboard from './pages/Dashboard';
import AddExpertRoster from './pages/AddExpertRoster';
import { ExpertProfileModalProvider } from './contexts/ExpertProfileModalContext';

export default function App() {
  return (
    <ExpertProfileModalProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/roster" element={<RosterRedirect />} />
        <Route path="/roster/planning" element={<ResourcePlanningPage />} />
        <Route path="/roster/manager" element={<ManagerDashboardPage />} />
        <Route path="/roster/expert/:id" element={<ExpertProfileDeepLink />} />
        <Route path="/roster/legacy" element={<Dashboard />} />
        <Route path="/roster/add" element={<AddExpertRoster />} />
        <Route path="/roster/requests" element={<Navigate to="/roster/planning" replace />} />
      </Routes>
    </ExpertProfileModalProvider>
  );
}
