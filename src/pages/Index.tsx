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
    // 简单的加载延迟
    setTimeout(() => {
      setIsLoading(false);
      console.log('Index 组件加载完成');
    }, 1000);
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

  // 显示首页 - 只有在明确请求时才显示
  if (currentView === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-blue-600 mb-4">SPSS AI</h1>
            <p className="text-xl text-gray-600">统计科学 — 点就好</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">欢迎使用数据分析平台</h2>
            <p className="text-gray-600 mb-6">
              这是一个强大的统计分析工具，帮助您快速进行数据分析和可视化。
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl mb-2">📊</div>
                <h3 className="font-semibold mb-2">数据分析</h3>
                <p className="text-sm text-gray-600">强大的统计分析功能</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl mb-2">📈</div>
                <h3 className="font-semibold mb-2">数据可视化</h3>
                <p className="text-sm text-gray-600">美观的图表和报告</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl mb-2">🤖</div>
                <h3 className="font-semibold mb-2">AI 辅助</h3>
                <p className="text-sm text-gray-600">智能分析建议</p>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <button 
                onClick={() => setCurrentView('auth')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                开始使用
              </button>
            </div>
          </div>
        </div>
      </div>
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
