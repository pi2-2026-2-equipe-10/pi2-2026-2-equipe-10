import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { SendCode } from './pages/SendCode';
import { ResetPassword } from './pages/ResetPassword';
import { MaterialsRegistration } from './pages/MaterialsRegistration';
import { MaterialsList } from './pages/MaterialsList';
import { ServicesList } from './pages/ServicesList';
import { ServicesRegistration } from './pages/ServicesRegistration';
import { BudgetsList } from './pages/BudgetsList';
import { BudgetCalculator } from './pages/BudgetCalculator';
import { PlanningWeekly } from './pages/PlanningWeekly';
import { ClientsList } from './pages/ClientsList';
import { Overview } from './pages/Overview';
import { ForbiddenPage } from './pages/ForbiddenPage';
import { ProtectedRoute } from './components/ProtectedRoute';

import './styles/dashboard.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes (Públicas) */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/send-code" element={<SendCode />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Rota Dedicada de Acesso Negado (403 Forbidden - Issue #87 / #90) */}
        <Route path="/forbidden" element={<ForbiddenPage />} />

        {/* Rota Administrativa Protegida por RBAC (Redireciona Funcionário para /forbidden) */}
        <Route
          path="/employees"
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <Overview />
            </ProtectedRoute>
          }
        />

        {/* Rotas Protegidas (Exigem autenticação via ProtectedRoute) */}
        <Route
          path="/overview"
          element={
            <ProtectedRoute>
              <Overview />
            </ProtectedRoute>
          }
        />
        <Route path="/dashboard" element={<Navigate to="/overview" replace />} />

        {/* Materials Management Routes */}
        <Route
          path="/materials"
          element={
            <ProtectedRoute>
              <MaterialsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/materials/new"
          element={
            <ProtectedRoute>
              <MaterialsRegistration />
            </ProtectedRoute>
          }
        />
        <Route
          path="/materials/edit/:id"
          element={
            <ProtectedRoute>
              <MaterialsRegistration />
            </ProtectedRoute>
          }
        />

        {/* Services & Composition Routes */}
        <Route
          path="/services"
          element={
            <ProtectedRoute>
              <ServicesList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/services/new"
          element={
            <ProtectedRoute>
              <ServicesRegistration />
            </ProtectedRoute>
          }
        />

        {/* Budgets Routes */}
        <Route
          path="/budgets"
          element={
            <ProtectedRoute>
              <BudgetsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/budgets/new"
          element={
            <ProtectedRoute>
              <BudgetCalculator />
            </ProtectedRoute>
          }
        />

        {/* Planning Routes */}
        <Route
          path="/planning"
          element={
            <ProtectedRoute>
              <PlanningWeekly />
            </ProtectedRoute>
          }
        />

        {/* Clients Module */}
        <Route
          path="/clients"
          element={
            <ProtectedRoute>
              <ClientsList />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
