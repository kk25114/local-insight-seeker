
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Brain, Zap, Users, FileText, TrendingUp } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 头部导航 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-blue-600">SPSS AI</h1>
              <span className="text-sm text-gray-500">统计科学 — 点就好</span>
            </div>
            <Button onClick={onGetStarted} className="bg-blue-600 hover:bg-blue-700">
              开始使用
            </Button>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 英雄区域 */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            AI驱动的
            <span className="text-blue-600"> 统计分析</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            用人工智能重新定义数据分析体验，让复杂的统计分析变得简单直观，一键即可获得专业的分析结果。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={onGetStarted}
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3"
            >
              <Brain className="h-5 w-5 mr-2" />
              开始分析
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-3"
            >
              <FileText className="h-5 w-5 mr-2" />
              查看演示
            </Button>
          </div>
        </div>

        {/* 特性展示 */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>一键分析</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                上传数据，选择分析方法，AI自动完成复杂的统计分析，生成专业报告。
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>智能解读</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                AI助手帮您理解分析结果，提供专业的统计解释和建议。
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>可视化图表</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                自动生成美观的图表和可视化结果，让数据洞察一目了然。
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 使用统计 */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">被全球用户信赖</h2>
            <p className="text-gray-600">已有数千名研究者和分析师在使用我们的平台</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">10K+</div>
              <div className="text-gray-600">活跃用户</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">50K+</div>
              <div className="text-gray-600">分析任务</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">100+</div>
              <div className="text-gray-600">分析算法</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">99.9%</div>
              <div className="text-gray-600">系统可用性</div>
            </div>
          </div>
        </div>

        {/* 行动号召 */}
        <div className="text-center bg-blue-600 rounded-lg p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">准备开始您的数据分析之旅？</h2>
          <p className="text-xl mb-8 opacity-90">
            立即注册，体验AI驱动的统计分析平台
          </p>
          <Button 
            onClick={onGetStarted}
            size="lg" 
            className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3"
          >
            <Users className="h-5 w-5 mr-2" />
            立即注册
          </Button>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <BarChart3 className="h-6 w-6" />
              <span className="text-lg font-semibold">SPSS AI</span>
            </div>
            <p className="text-gray-400">© 2024 SPSS AI. 统计科学 — 点就好</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
