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

import './styles/dashboard.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/send-code" element={<SendCode />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Materials Management Routes */}
        <Route path="/materials" element={<MaterialsList />} />
        <Route path="/materials/new" element={<MaterialsRegistration />} />
        <Route path="/materials/edit/:id" element={<MaterialsRegistration />} />

        {/* Services & Composition Routes (Issue #56) */}
        <Route path="/services" element={<ServicesList />} />
        <Route path="/services/new" element={<ServicesRegistration />} />

        {/* Budgets Routes (Issue #56) */}
        <Route path="/budgets" element={<BudgetsList />} />
        <Route path="/budgets/new" element={<BudgetCalculator />} />

        {/* Planning Routes (Issue #56) */}
        <Route path="/planning" element={<PlanningWeekly />} />

        {/* Clients Module */}
        <Route path="/clients" element={<ClientsList />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
