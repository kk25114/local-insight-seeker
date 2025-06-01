
import React, { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AnalysisSidebar } from '@/components/AnalysisSidebar';
import { MainHeader } from '@/components/MainHeader';
import { WorkArea } from '@/components/WorkArea';
import { AuthPage } from '@/components/AuthPage';
import { AlgorithmManagement } from '@/components/AlgorithmManagement';
import { ModelManagement } from '@/components/ModelManagement';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

const Index = () => {
  const [selectedAnalysis, setSelectedAnalysis] = useState<string>('');
  const [uploadedData, setUploadedData] = useState<any[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'analysis' | 'algorithms' | 'models'>('analysis');

  useEffect(() => {
    // 设置认证状态监听器
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    // 检查现有会话
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'algorithms':
        return <AlgorithmManagement user={user} />;
      case 'models':
        return <ModelManagement user={user} />;
      default:
        return (
          <WorkArea 
            selectedAnalysis={selectedAnalysis}
            data={uploadedData}
            user={user}
          />
        );
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-gray-50">
        {currentView === 'analysis' && (
          <AnalysisSidebar 
            selectedAnalysis={selectedAnalysis}
            onSelectAnalysis={setSelectedAnalysis}
          />
        )}
        <SidebarInset>
          <MainHeader 
            onDataUpload={setUploadedData}
            user={user}
            currentView={currentView}
            onViewChange={setCurrentView}
          />
          <main className="flex-1 p-6 overflow-auto">
            {renderContent()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
