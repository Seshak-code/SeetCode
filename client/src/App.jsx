import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ProblemDetailPage from './pages/ProblemDetailPage';
import NotFoundPage from './pages/NotFoundPage';
import AdminUploadPage from './pages/AdminUploadPage';
import LoginPage from './pages/LoginPage';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="problems/:slug" element={<ProblemDetailPage />} />
          <Route path="admin/upload" element={<AdminUploadPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
