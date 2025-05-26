import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { HomePage } from './components/core/HomePage';
import { ProfilePage } from './components/core/ProfilePage';
import { GamesPage } from './components/game/GamesPage';
import { RussianRouletteGame } from './components/game/RussianRouletteGame';
import { RedBlackWhiteGame } from './components/game/RedBlackWhiteGame';
import { GuessNumberGame } from './components/game/GuessNumberGame';
import { LadderGame } from './components/game/LadderGame';
import { StorePage } from './components/core/StorePage';
import { CasesPage } from './components/core/CasesPage';
import { LeaderboardPage } from './components/core/LeaderboardPage';
import { TransfersPage } from './components/core/TransfersPage';
import { ChatPage } from './components/core/ChatPage';
import { AdminPanelPage } from './components/admin/AdminPanelPage';
import { PromoCodePage } from './components/core/PromoCodePage';
import { MailPage } from './components/core/MailPage'; // Added MailPage
import { UserRole } from './types';
import { NotificationContainer, useNotificationSystem } from './components/ui/Notification';


const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: UserRole[]; requiredVip?: UserRole[] }> = ({ children, roles }) => {
  const { currentUser } = useAuth();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  if (roles && !roles.includes(currentUser.role)) {
     return <Navigate to="/" replace />; // Or a specific "access denied" page
  }
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { notifications, removeNotification } = useNotificationSystem();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <NotificationContainer notifications={notifications} onDismiss={removeNotification} />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/games" element={<ProtectedRoute><GamesPage /></ProtectedRoute>} />
          <Route path="/games/russian-roulette" element={<ProtectedRoute><RussianRouletteGame /></ProtectedRoute>} />
          <Route path="/games/red-black-white" element={<ProtectedRoute><RedBlackWhiteGame /></ProtectedRoute>} />
          <Route path="/games/guess-number" element={<ProtectedRoute><GuessNumberGame /></ProtectedRoute>} />
          <Route path="/games/ladder" element={<ProtectedRoute><LadderGame /></ProtectedRoute>} />

          <Route path="/store" element={<ProtectedRoute><StorePage /></ProtectedRoute>} />
          <Route path="/cases" element={<ProtectedRoute><CasesPage /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
          <Route path="/promocodes" element={<ProtectedRoute><PromoCodePage /></ProtectedRoute>} />
          <Route path="/transfers" element={<ProtectedRoute><TransfersPage /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          
          <Route
            path="/mail"
            element={
              <ProtectedRoute roles={[UserRole.ADMIN, UserRole.MODERATOR]}>
                <MailPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={[UserRole.ADMIN, UserRole.MODERATOR, UserRole.HELPER]}>
                <AdminPanelPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
