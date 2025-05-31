import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlayCircle, FileText, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WorkAreaProps {
  selectedAnalysis: string;
  data: any[];
}

export const WorkArea: React.FC<WorkAreaProps> = ({ selectedAnalysis, data }) => {
  const [analysisResults, setAnalysisResults] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [grokApiKey, setGrokApiKey] = useState('');
  const { toast } = useToast();

  const runAnalysis = async () => {
    if (!grokApiKey.trim()) {
      toast({
        title: "请输入Grok API密钥",
        description: "需要Grok API密钥来进行数据分析",
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
    console.log("API Key length:", grokApiKey.length);

    try {
      // 构建分析请求
      const analysisPrompt = `请对以下数据进行${getAnalysisName(selectedAnalysis)}分析：
      
数据：
${JSON.stringify(data, null, 2)}

请提供详细的统计分析结果，包括：
1. 描述性统计
2. 假设检验结果（如适用）
3. 数据解读和建议
4. 可视化建议`;

      console.log("发送请求到 Grok API...");
      
      // 调用Grok API - 使用正确的端点和模型名称
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${grokApiKey.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: '你是一个专业的统计分析师，擅长使用SPSS和其他统计软件进行数据分析。请提供详细、准确的统计分析结果。'
            },
            {
              role: 'user',
              content: analysisPrompt
            }
          ],
          model: 'grok-3-fast-beta',
          stream: false,
          temperature: 0.1
        }),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API错误响应:", errorText);
        throw new Error(`API请求失败: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log("API响应:", result);
      
      const analysisResult = result.choices?.[0]?.message?.content || '分析完成，但未收到结果';
      
      setAnalysisResults(analysisResult);
      toast({
        title: "分析完成",
        description: "数据分析已成功完成",
      });
    } catch (error) {
      console.error('分析错误:', error);
      
      let errorMessage = "请检查API密钥和网络连接";
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          errorMessage = "API密钥无效，请检查密钥是否正确";
        } else if (error.message.includes('403')) {
          errorMessage = "API密钥权限不足或已过期";
        } else if (error.message.includes('429')) {
          errorMessage = "API调用次数超限，请稍后重试";
        } else if (error.message.includes('500')) {
          errorMessage = "服务器错误，请稍后重试";
        } else if (error.message.includes('fetch')) {
          errorMessage = "网络连接失败，请检查网络";
        }
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
      frequency: '频数',
      descriptives: '描述性统计',
      correlation: '相关性',
      regression: '线性回归',
      ttest: 'T检验',
      anova: '方差分析',
      crosstab: '交叉列联',
      reliability: '信度分析',
      factor: '因子分析'
    };
    return names[key] || '统计';
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

        {/* API配置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <FileText className="h-5 w-5 mr-2" />
              Grok API 配置 (使用 grok-3-fast-beta 模型)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="apiKey">Grok API 密钥</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="请输入您的Grok API密钥 (xai-...)"
                  value={grokApiKey}
                  onChange={(e) => setGrokApiKey(e.target.value)}
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  您的API密钥将仅在本地使用，不会被保存或传输到其他地方。密钥格式应为: xai-xxxxxxxxxx
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
