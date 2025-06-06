import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  GitBranch, 
  Database, 
  Brain, 
  Zap, 
  Shield, 
  Users, 
  Globe,
  ArrowRight,
  Star
} from 'lucide-react';

interface AboutPageProps {
  onBackToAnalysis?: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onBackToAnalysis }) => {
  const features = [
    {
      icon: BarChart3,
      title: '统计分析',
      description: '提供完整的统计分析工具，包括描述性统计、相关分析、回归分析等'
    },
    {
      icon: Brain,
      title: 'AI驱动',
      description: '集成GPT-4、Claude等先进AI模型，让数据分析更智能更高效'
    },
    {
      icon: Database,
      title: '数据管理',
      description: '安全的数据存储和管理，支持多种数据格式导入导出'
    },
    {
      icon: GitBranch,
      title: '算法定制',
      description: '支持自定义分析算法，满足特殊业务需求'
    },
    {
      icon: Zap,
      title: '快速便捷',
      description: '一键式操作，自动生成分析报告，大大提升工作效率'
    },
    {
      icon: Shield,
      title: '安全可靠',
      description: '企业级安全保障，数据隐私得到充分保护'
    }
  ];

  const stats = [
    { label: '分析方法', value: '50+', icon: BarChart3 },
    { label: 'AI模型', value: '10+', icon: Brain },
    { label: '数据格式', value: '15+', icon: Database },
    { label: '用户满意度', value: '98%', icon: Star }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* 头部介绍 */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white text-2xl font-bold">S</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            SPSSAI
          </h1>
        </div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          专业的AI驱动统计分析平台，让数据分析变得更加智能、高效和准确
        </p>
        <div className="flex items-center justify-center space-x-2">
          <Badge variant="outline" className="text-blue-600 border-blue-600">统计科学</Badge>
          <Badge variant="outline" className="text-green-600 border-green-600">AI驱动</Badge>
          <Badge variant="outline" className="text-purple-600 border-purple-600">专业级</Badge>
        </div>
      </div>

      {/* 统计数据 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="text-center">
            <CardContent className="pt-6">
              <stat.icon className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 功能特点 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-6 w-6 text-blue-600" />
            <span>核心功能</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 使用场景 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-6 w-6 text-green-600" />
              <span>适用用户</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2">
              <ArrowRight className="h-4 w-4 text-green-600" />
              <span>科研工作者和学者</span>
            </div>
            <div className="flex items-center space-x-2">
              <ArrowRight className="h-4 w-4 text-green-600" />
              <span>数据分析师</span>
            </div>
            <div className="flex items-center space-x-2">
              <ArrowRight className="h-4 w-4 text-green-600" />
              <span>市场研究人员</span>
            </div>
            <div className="flex items-center space-x-2">
              <ArrowRight className="h-4 w-4 text-green-600" />
              <span>学生和教育工作者</span>
            </div>
            <div className="flex items-center space-x-2">
              <ArrowRight className="h-4 w-4 text-green-600" />
              <span>企业分析师</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-6 w-6 text-purple-600" />
              <span>应用领域</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2">
              <ArrowRight className="h-4 w-4 text-purple-600" />
              <span>学术研究与论文写作</span>
            </div>
            <div className="flex items-center space-x-2">
              <ArrowRight className="h-4 w-4 text-purple-600" />
              <span>市场调研与分析</span>
            </div>
            <div className="flex items-center space-x-2">
              <ArrowRight className="h-4 w-4 text-purple-600" />
              <span>医学统计与临床研究</span>
            </div>
            <div className="flex items-center space-x-2">
              <ArrowRight className="h-4 w-4 text-purple-600" />
              <span>质量控制与改进</span>
            </div>
            <div className="flex items-center space-x-2">
              <ArrowRight className="h-4 w-4 text-purple-600" />
              <span>金融风险分析</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 技术架构 */}
      <Card>
        <CardHeader>
          <CardTitle>技术架构</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Brain className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">AI引擎</h3>
              <p className="text-sm text-gray-600">集成多种先进AI模型，包括GPT-4、Claude、Grok等</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Database className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">数据处理</h3>
              <p className="text-sm text-gray-600">基于Supabase的实时数据库，支持大规模数据处理</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">安全保障</h3>
              <p className="text-sm text-gray-600">企业级安全架构，确保数据隐私和系统稳定</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      {onBackToAnalysis && (
        <div className="text-center">
          <Button onClick={onBackToAnalysis} size="lg" className="bg-blue-600 hover:bg-blue-700">
            开始使用 SPSSAI
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      {/* 页脚信息 */}
      <div className="text-center text-sm text-gray-500 border-t pt-6">
        <p>© 2024 SPSSAI. 专业的AI驱动统计分析平台</p>
        <p className="mt-1">让数据分析更智能、更高效、更准确</p>
      </div>
    </div>
  );
}; 