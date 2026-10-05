import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { SendCode } from './pages/SendCode';
import { ResetPassword } from './pages/ResetPassword';
import { MaterialsRegistration } from './pages/MaterialsRegistration';
import { MaterialsList } from './pages/MaterialsList';
import { PlaceholderPage } from './pages/PlaceholderPage';

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

        {/* Dashboard Modules Routes (Sprints / Issues seguintes) */}
        <Route path="/clients" element={<PlaceholderPage title="Clientes" activeMenu="Clientes" />} />
        <Route path="/services" element={<PlaceholderPage title="Serviços" activeMenu="Serviços" />} />
        <Route path="/budgets" element={<PlaceholderPage title="Orçamentos" activeMenu="Orçamentos" />} />
        <Route path="/planning" element={<PlaceholderPage title="Planejamento" activeMenu="Planejamento" />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
