import React, { useState, useEffect } from 'react';
import { AnalysisSidebar } from '@/components/AnalysisSidebar';
import { MainHeader } from '@/components/MainHeader';
import { WorkArea } from '@/components/WorkArea';
import { AuthPage } from '@/components/AuthPage';
import { LandingPage } from '@/components/LandingPage';
import { ChatWidget } from '@/components/ChatWidget';
import { AlgorithmManagement } from '@/components/AlgorithmManagement';
import { ModelManagement } from '@/components/ModelManagement';
import { DataManagement } from '@/components/DataManagement';
import { AboutPage } from '@/components/AboutPage';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

const Index = () => {
  const [selectedAnalyses, setSelectedAnalyses] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'landing' | 'auth' | 'analysis' | 'algorithms' | 'models' | 'data' | 'about' | 'tasks'>('analysis');
  const [error, setError] = useState<string | null>(null);

  const handleViewChange = (view: 'landing' | 'auth' | 'analysis' | 'algorithms' | 'models' | 'data' | 'about' | 'tasks') => {
    console.log('视图变化从', currentView, '到', view);
    setCurrentView(view);
  };

  // 更新分析选择处理函数为多选/单选切换
  const handleAnalysisToggle = (analysisKey: string) => {
    console.log('切换分析方法:', analysisKey);
    setSelectedAnalyses(prev => 
      prev.includes(analysisKey) 
        ? prev.filter(key => key !== analysisKey)
        : [...prev, analysisKey]
    );
  };

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
            handleViewChange('analysis');
          }
        }
      );

      // 检查现有会话
      supabase.auth.getSession().then(({ data: { session } }) => {
        console.log('现有会话:', session);
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        
        // 用户信息已设置，保持当前视图
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
  }, []);

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

  // 显示首页 - 只有在明确请求时才显示（已禁用，直接跳转到分析界面）
  if (currentView === 'landing') {
    handleViewChange('analysis');
    return null;
  }

  // 显示关于页面 - 不需要认证
  if (currentView === 'about') {
    console.log('正在渲染关于页面');
    return (
      <>
        <div className="min-h-screen flex w-full bg-gray-50">
          <div className="flex-1 flex flex-col">
            <MainHeader 
              onDataUpload={() => {}}
              user={user}
              currentView={currentView}
              onViewChange={handleViewChange}
            />
            <main className="flex-1 overflow-auto p-6">
              <AboutPage onBackToAnalysis={() => handleViewChange('analysis')} />
            </main>
          </div>
        </div>
        <ChatWidget />
      </>
    );
  }

  // 如果没有用户但试图访问需要认证的页面，跳转到认证页面
  if (!user && (currentView === 'algorithms' || currentView === 'models' || currentView === 'data' || currentView === 'tasks')) {
    handleViewChange('auth');
    return null;
  }

  const renderContent = () => {
    console.log('renderContent called with currentView:', currentView, 'user:', user);
    switch (currentView) {
      case 'algorithms':
        console.log('渲染算法管理组件');
        return <AlgorithmManagement user={user!} />;
      case 'models':
        console.log('渲染模型管理组件');
        return <ModelManagement user={user!} />;
      case 'data':
        console.log('渲染数据管理组件');
        return <DataManagement user={user!} onDataSelect={() => {}} />;
      case 'tasks':
        return <div className="p-6">任务记录功能正在开发中...</div>;
      default:
        console.log('渲染工作区组件');
        return (
          <WorkArea 
            selectedAnalyses={selectedAnalyses}
            user={user}
            onAuthRequired={() => handleViewChange('auth')}
          />
        );
    }
  };

  try {
    return (
      <>
        <div className="flex h-screen w-full bg-gray-50">
          {currentView === 'analysis' && (
            <AnalysisSidebar 
              selectedAnalyses={selectedAnalyses}
              onSelectAnalysis={handleAnalysisToggle}
              onLogoClick={() => handleViewChange('analysis')}
            />
          )}
          <div className="flex-1 flex flex-col overflow-hidden">
            <MainHeader 
              onDataUpload={() => {}}
              user={user}
              currentView={currentView}
              onViewChange={handleViewChange}
            />
            <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
              {renderContent()}
            </main>
          </div>
        </div>
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
