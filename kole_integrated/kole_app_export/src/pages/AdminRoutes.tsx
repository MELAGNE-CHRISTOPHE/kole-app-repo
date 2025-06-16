import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from '../components/admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import ClientsManagement from './admin/ClientsManagement';
import ChauffeursManagement from './admin/ChauffeursManagement';
import TrajetsManagement from './admin/TrajetsManagement';
import FinanceManagement from './admin/FinanceManagement';
import StatisticsManagement from './admin/StatisticsManagement';
import ParametresManagement from './admin/ParametresManagement';

const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
      <Route path="/dashboard" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
      <Route path="/clients" element={<AdminLayout><ClientsManagement /></AdminLayout>} />
      <Route path="/chauffeurs" element={<AdminLayout><ChauffeursManagement /></AdminLayout>} />
      <Route path="/trajets" element={<AdminLayout><TrajetsManagement /></AdminLayout>} />
      <Route path="/finance" element={<AdminLayout><FinanceManagement /></AdminLayout>} />
      <Route path="/statistiques" element={<AdminLayout><StatisticsManagement /></AdminLayout>} />
      <Route path="/parametres" element={<AdminLayout><ParametresManagement /></AdminLayout>} />
    </Routes>
  );
};

export default AdminRoutes;

