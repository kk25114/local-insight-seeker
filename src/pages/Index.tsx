import React, { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AnalysisSidebar } from '@/components/AnalysisSidebar';
import { MainHeader } from '@/components/MainHeader';
import { WorkArea } from '@/components/WorkArea';
import { AuthPage } from '@/components/AuthPage';
import { LandingPage } from '@/components/LandingPage';
import { ChatWidget } from '@/components/ChatWidget';
import { AlgorithmManagement } from '@/components/AlgorithmManagement';
import { ModelManagement } from '@/components/ModelManagement';
import { DataManagement } from '@/components/DataManagement';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

const Index = () => {
  const [selectedAnalysis, setSelectedAnalysis] = useState<string>('');
  const [uploadedData, setUploadedData] = useState<any[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'landing' | 'auth' | 'analysis' | 'algorithms' | 'models' | 'data'>('landing');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Index 组件正在加载...');
    
    try {
      // 设置认证状态监听器
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          console.log('认证状态变化:', { event, session });
          setSession(session);
          setUser(session?.user ?? null);
          setIsLoading(false);
          
          // 如果用户已登录且当前在认证页面，跳转到分析页面
          if (session?.user && currentView === 'auth') {
            setCurrentView('analysis');
          }
          // 如果用户已登录且当前在首页，跳转到分析页面
          if (session?.user && currentView === 'landing') {
            setCurrentView('analysis');
          }
        }
      );

      // 检查现有会话
      supabase.auth.getSession().then(({ data: { session } }) => {
        console.log('现有会话:', session);
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        
        // 如果有现有会话，直接跳转到分析页面
        if (session?.user) {
          setCurrentView('analysis');
        }
      }).catch((error) => {
        console.error('获取会话失败:', error);
        setError('获取会话失败');
        setIsLoading(false);
      });

      return () => subscription.unsubscribe();
    } catch (error) {
      console.error('初始化失败:', error);
      setError('应用初始化失败');
      setIsLoading(false);
    }
  }, [currentView]);

  // 错误状态
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">应用出错了</h1>
          <p className="text-red-500">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  // 加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  console.log('当前状态:', { currentView, user, isLoading, error });

  // 显示认证页面 - 只有在明确请求时才显示
  if (currentView === 'auth') {
    return (
      <>
        <AuthPage />
        <ChatWidget />
      </>
    );
  }

  // 显示首页 - 只有在明确请求时才显示
  if (currentView === 'landing') {
    return (
      <>
        <LandingPage 
          onGetStarted={() => user ? setCurrentView('analysis') : setCurrentView('auth')}
          onLogin={() => setCurrentView('auth')}
          onRegister={() => setCurrentView('auth')}
        />
        <ChatWidget />
      </>
    );
  }

  // 如果没有用户但试图访问需要认证的页面，跳转到认证页面
  if (!user && (currentView === 'algorithms' || currentView === 'models' || currentView === 'data')) {
    setCurrentView('auth');
    return null;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'algorithms':
        return <AlgorithmManagement user={user!} />;
      case 'models':
        return <ModelManagement user={user!} />;
      case 'data':
        return <DataManagement user={user!} onDataSelect={setUploadedData} />;
      default:
        return (
          <WorkArea 
            selectedAnalysis={selectedAnalysis}
            uploadedData={uploadedData}
            user={user}
          />
        );
    }
  };

  try {
    return (
      <>
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
        <ChatWidget />
      </>
    );
  } catch (renderError) {
    console.error('渲染错误:', renderError);
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">渲染出错了</h1>
          <p className="text-red-500">组件渲染失败</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }
};

export default Index;
