import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ElectionProvider } from './context/ElectionContext';
import { CommentProvider } from './context/CommentContext';
import { ChatProvider } from './context/ChatContext';
import { Header } from './components/Header';
import { CountrySelector } from './pages/CountrySelector';
import { ElectionDashboard } from './pages/ElectionDashboard';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminCountries } from './pages/admin/AdminCountries';
import { AdminCandidates } from './pages/admin/AdminCandidates';
import { AdminAnalytics } from './pages/admin/AdminAnalytics';
import { AdminComments } from './pages/admin/AdminComments';
import { AdminChat } from './pages/admin/AdminChat';
import { AdminNews } from './pages/admin/AdminNews';
import { AdminSettings } from './pages/admin/AdminSettings';
import { FloatingChatButton } from './components/chat/FloatingChatButton';
import { ChatWindow } from './components/chat/ChatWindow';
export function App() {
  return <BrowserRouter>
      <AuthProvider>
        <ElectionProvider>
          <CommentProvider>
            <ChatProvider>
              <Header />
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<CountrySelector />} />
                <Route path="/election/:countryId" element={<ElectionDashboard />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/countries" element={<AdminCountries />} />
                <Route path="/admin/candidates" element={<AdminCandidates />} />
                <Route path="/admin/analytics" element={<AdminAnalytics />} />
                <Route path="/admin/comments" element={<AdminComments />} />
                <Route path="/admin/chat" element={<AdminChat />} />
                <Route path="/admin/news" element={<AdminNews />} />
                <Route path="/admin/settings" element={<AdminSettings />} />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>

              {/* Global Chat UI */}
              <FloatingChatButton />
              <ChatWindow />
            </ChatProvider>
          </CommentProvider>
        </ElectionProvider>
      </AuthProvider>
    </BrowserRouter>;
}