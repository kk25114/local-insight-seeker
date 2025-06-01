import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlayCircle, FileText, BarChart3, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

interface WorkAreaProps {
  selectedAnalysis: string;
  data: any[];
  user: User;
}

interface AIModel {
  id: string;
  name: string;
  provider: string;
  model_id: string;
  api_key_name: string;
  is_active: boolean;
}

interface AnalysisAlgorithm {
  id: string;
  name: string;
  category: string;
  description: string;
  prompt_template: string;
  parameters: any;
}

export const WorkArea: React.FC<WorkAreaProps> = ({ selectedAnalysis, data, user }) => {
  const [analysisResults, setAnalysisResults] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [aiModels, setAiModels] = useState<AIModel[]>([]);
  const [algorithms, setAlgorithms] = useState<AnalysisAlgorithm[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadAIModels();
    loadAlgorithms();
  }, []);

  const loadAIModels = async () => {
    try {
      const { data: models, error } = await supabase
        .from('ai_models')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setAiModels(models || []);
      if (models && models.length > 0) {
        setSelectedModel(models[0].id);
      }
    } catch (error) {
      console.error('加载模型失败:', error);
      toast({
        title: "加载模型失败",
        description: "无法获取可用的AI模型",
        variant: "destructive",
      });
    }
  };

  const loadAlgorithms = async () => {
    try {
      const { data: algos, error } = await supabase
        .from('analysis_algorithms')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setAlgorithms(algos || []);
    } catch (error) {
      console.error('加载算法失败:', error);
    }
  };

  const runAnalysis = async () => {
    if (!selectedModel) {
      toast({
        title: "请选择AI模型",
        description: "需要选择一个AI模型来进行数据分析",
        variant: "destructive",
      });
      return;
    }

    if (data.length === 0) {
      toast({
        title: "请先上传数据",
        description: "需要数据才能进行分析",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    console.log("开始分析:", selectedAnalysis);

    try {
      // 获取选中的算法
      const algorithm = algorithms.find(algo => 
        algo.name === getAnalysisName(selectedAnalysis)
      );
      
      if (!algorithm) {
        throw new Error('未找到对应的分析算法');
      }

      // 获取选中的模型信息
      const model = aiModels.find(m => m.id === selectedModel);
      if (!model) {
        throw new Error('未找到对应的AI模型');
      }

      // 构建分析请求，使用数据库中的prompt模板
      const analysisPrompt = algorithm.prompt_template.replace('{data}', JSON.stringify(data, null, 2));

      console.log("使用模型:", model.name);
      console.log("使用算法:", algorithm.name);
      
      // 调用后端Edge Function进行分析
      const { data: result, error } = await supabase.functions.invoke('analyze-data', {
        body: {
          prompt: analysisPrompt,
          model_id: model.model_id,
          provider: model.provider,
          api_key_name: model.api_key_name
        }
      });

      if (error) {
        throw error;
      }
      
      const analysisResult = result?.content || '分析完成，但未收到结果';
      
      setAnalysisResults(analysisResult);
      toast({
        title: "分析完成",
        description: "数据分析已成功完成",
      });
    } catch (error) {
      console.error('分析错误:', error);
      
      let errorMessage = "分析过程中出现错误";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "分析失败",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getAnalysisName = (key: string) => {
    const names: { [key: string]: string } = {
      frequency: '频数分析',
      descriptives: '描述性统计',
      correlation: '相关分析',
      regression: '线性回归',
      ttest: 'T检验',
      anova: '方差分析',
      crosstab: '交叉列联',
      reliability: '信度分析',
      factor: '因子分析'
    };
    return names[key] || '统计分析';
  };

  return (
    <main className="flex-1 p-6 overflow-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 工具栏 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Select defaultValue="11">
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="11">11</SelectItem>
                <SelectItem value="12">12</SelectItem>
                <SelectItem value="14">14</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-500">筛选样本</span>
          </div>
          
          <Button 
            onClick={runAnalysis}
            disabled={isAnalyzing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                分析中...
              </>
            ) : (
              <>
                <PlayCircle className="h-4 w-4 mr-2" />
                开始分析
              </>
            )}
          </Button>
        </div>

        {/* AI模型选择 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Settings className="h-5 w-5 mr-2" />
              AI 模型配置
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="aiModel">选择AI模型</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择AI模型" />
                  </SelectTrigger>
                  <SelectContent>
                    {aiModels.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name} ({model.provider})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  AI模型由管理员统一配置和管理
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 数据预览 */}
        {data.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <BarChart3 className="h-5 w-5 mr-2" />
                数据预览
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      {Object.keys(data[0] || {}).map((key) => (
                        <th key={key} className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.slice(0, 10).map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        {Object.values(row).map((value, colIndex) => (
                          <td key={colIndex} className="border border-gray-200 px-4 py-2 text-sm text-gray-900">
                            {String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {data.length > 10 && (
                  <p className="text-sm text-gray-500 mt-2">
                    显示前10行，共{data.length}行数据
                  </p>
                )}
              </div>
            </CardContent>
        </Card>
        )}

        {/* 分析设置 */}
        {selectedAnalysis && (
          <Card>
            <CardHeader>
              <CardTitle>分析设置 - {getAnalysisName(selectedAnalysis)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="variables">选择变量</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="选择要分析的变量" />
                    </SelectTrigger>
                    <SelectContent>
                      {data.length > 0 && Object.keys(data[0]).map((key) => (
                        <SelectItem key={key} value={key}>{key}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="options">分析选项</Label>
                  <Textarea 
                    id="options"
                    placeholder="输入特殊的分析要求或参数..."
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 分析结果 */}
        {analysisResults && (
          <Card>
            <CardHeader>
              <CardTitle>分析结果</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                  {analysisResults}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 空状态 */}
        {!selectedAnalysis && data.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <BarChart3 className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">开始您的数据分析</h3>
              <p className="text-gray-500 text-center max-w-md">
                请先上传数据文件，然后从左侧选择合适的分析方法。我们支持CSV、JSON、Excel等格式。
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
};
