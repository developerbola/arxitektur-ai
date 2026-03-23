import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { supabase } from './lib/supabase';
import type { Session } from '@supabase/supabase-js';

import { FloatingToolbar, MainHeader } from './components/editor/Layout';
import AISidebar from './components/editor/ai-sidebar';
import StatusBar from './components/editor/status-bar';
import CanvasEditor from './components/canvas/CanvasEditor';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';

import { TooltipProvider } from '@/components/ui/tooltip';

const ProjectLayout = () => {
  const { project_id } = useParams();
  
  // Here we would typically fetch the project data from Supabase and hydrate `useStore`
  // For now, this just encapsulates the editor view
  
  return (
    <div className="flex flex-col h-screen w-full bg-[#f1f5f9] text-slate-900 overflow-hidden font-sans relative">
      <MainHeader />
      <main className="flex-1 w-full relative overflow-hidden flex items-center justify-center p-0">
        <FloatingToolbar />
        <CanvasEditor />
        <div className="absolute right-6 top-8 bottom-16 z-40 pointer-events-none">
           <div className="pointer-events-auto h-full">
              <AISidebar />
           </div>
        </div>
      </main>
      <StatusBar />
    </div>
  );
};

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Initial fetch
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (!session) {
        navigate('/auth');
      }
    });

    // Listen to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    const isConfigured = supabase.auth !== undefined && 
      !import.meta.env.VITE_SUPABASE_URL?.includes('your_supabase_url_here');

    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-6 max-w-[400px] text-center px-6">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-200 animate-bounce">
             <div className="w-8 h-8 bg-white/20 rounded-lg blur-sm absolute" />
             <div className="w-6 h-6 bg-white/40 rounded-lg" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {!isConfigured ? 'Configuration Required' : 'Loading Arxitektur'}
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              {!isConfigured 
                ? 'Please update your .env file with your Supabase URL and Anon Key to continue.' 
                : 'Initializing your architectural workspace...'}
            </p>
          </div>

          {!isConfigured && (
            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm text-left w-full">
              <code className="text-[10px] text-slate-400 font-mono block mb-1 uppercase tracking-widest">Target File</code>
              <code className="text-xs text-blue-600 font-semibold font-mono break-all">client/.env</code>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Routes>
        <Route path="/auth" element={session ? <Navigate to="/" /> : <AuthPage />} />
        
        <Route 
          path="/" 
          element={
            session ? <DashboardPage session={session} /> : <Navigate to="/auth" />
          } 
        />

        <Route 
          path="/project/:project_id" 
          element={
            session ? <ProjectLayout /> : <Navigate to="/auth" />
          } 
        />
        
        {/* Wildcard catch */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </TooltipProvider>
  );
};

export default App;
