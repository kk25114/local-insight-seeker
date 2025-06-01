
import React, { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AnalysisSidebar } from '@/components/AnalysisSidebar';
import { MainHeader } from '@/components/MainHeader';
import { WorkArea } from '@/components/WorkArea';
import { AuthPage } from '@/components/AuthPage';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

const Index = () => {
  const [selectedAnalysis, setSelectedAnalysis] = useState<string>('');
  const [uploadedData, setUploadedData] = useState<any[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AnalysisSidebar 
          selectedAnalysis={selectedAnalysis}
          onSelectAnalysis={setSelectedAnalysis}
        />
        <SidebarInset>
          <MainHeader 
            onDataUpload={setUploadedData}
            user={user}
          />
          <WorkArea 
            selectedAnalysis={selectedAnalysis}
            data={uploadedData}
            user={user}
          />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
