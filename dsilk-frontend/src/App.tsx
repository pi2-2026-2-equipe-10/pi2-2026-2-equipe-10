import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { SendCode } from './pages/SendCode';
import { ResetPassword } from './pages/ResetPassword';
import { MaterialsRegistration } from './pages/MaterialsRegistration';
import { MaterialsList } from './pages/MaterialsList';

import './styles/dashboard.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/send-code" element={<SendCode />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/materials" element={<MaterialsList />} />
        <Route path="/materials/new" element={<MaterialsRegistration />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
