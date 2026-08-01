import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import ViewerLive from './pages/ViewerLive';
import Fixtures from './pages/Fixtures';
import Results from './pages/Results';
import CentralDashboard from './pages/CentralDashboard';
import CourtScorerPage from './pages/CourtScorerPage';

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/live" element={<ViewerLive />} />
            <Route path="/fixtures" element={<Fixtures />} />
            <Route path="/results" element={<Results />} />

            <Route
              path="/central"
              element={
                <ProtectedRoute roles={['central_scorer']}>
                  <CentralDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/court/:courtNumber"
              element={
                <ProtectedRoute roles={['central_scorer', 'court_scorer']} requireOwnCourt>
                  <CourtScorerPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Home />} />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}
