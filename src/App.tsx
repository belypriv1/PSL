import React, { useState } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { IndividualRankingsPage } from './pages/IndividualRankingsPage';
import { TeamRankingsPage } from './pages/TeamRankingsPage';
import { PlayerProfilePage } from './pages/PlayerProfilePage';
import { SubmitMatchPage } from './pages/SubmitMatchPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AuthPages } from './pages/AuthPages';
import { RulesPage } from './pages/RulesPage';
import { SupabaseConfigModal } from './components/common/SupabaseConfigModal';

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [pageParams, setPageParams] = useState<any>({});
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  const handleNavigate = (page: string, params?: any) => {
    setCurrentPage(page);
    setPageParams(params || {});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <LanguageProvider>
      <AuthProvider>
        <DataProvider>
          <div className="min-h-screen bg-[#050505] text-zinc-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
            {/* Top Sticky Navbar */}
            <Navbar
              currentPage={currentPage}
              onNavigate={handleNavigate}
              onOpenSupabaseConfig={() => setIsSupabaseModalOpen(true)}
            />

            {/* Page Body Router */}
            <main className="flex-1">
              {currentPage === 'home' && (
                <HomePage
                  onNavigate={handleNavigate}
                  onOpenSupabaseConfig={() => setIsSupabaseModalOpen(true)}
                />
              )}
              {currentPage === 'rankings-individual' && (
                <IndividualRankingsPage onNavigate={handleNavigate} />
              )}
              {currentPage === 'rankings-team' && (
                <TeamRankingsPage onNavigate={handleNavigate} />
              )}
              {currentPage === 'profile' && (
                <PlayerProfilePage
                  playerId={pageParams.playerId || 'ply-suez-01'}
                  onNavigate={handleNavigate}
                />
              )}
              {currentPage === 'submit-match' && (
                <SubmitMatchPage onNavigate={handleNavigate} />
              )}
              {currentPage === 'admin' && (
                <AdminDashboardPage onNavigate={handleNavigate} />
              )}
              {currentPage === 'auth' && (
                <AuthPages
                  initialMode={pageParams.mode || 'login'}
                  onNavigate={handleNavigate}
                />
              )}
              {currentPage === 'rules' && (
                <RulesPage
                  onNavigate={handleNavigate}
                  onOpenSupabaseConfig={() => setIsSupabaseModalOpen(true)}
                />
              )}
            </main>

            {/* Footer */}
            <Footer
              onNavigate={handleNavigate}
              onOpenSupabaseConfig={() => setIsSupabaseModalOpen(true)}
            />

            {/* Supabase Database & Auth Configuration Modal */}
            <SupabaseConfigModal
              isOpen={isSupabaseModalOpen}
              onClose={() => setIsSupabaseModalOpen(false)}
            />
          </div>
        </DataProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
