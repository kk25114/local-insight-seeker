import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Play, Database, FileText, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AnalysisQueue, AnalysisQueueRef } from './AnalysisQueue';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { analysisConfig } from '@/config/analysis';

interface DataSet {
  id: string;
  name: string;
  description: string;
  data: any[];
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface WorkAreaProps {
  selectedAnalysis: string;
  uploadedData: any[];
  user: SupabaseUser | null;
  onAuthRequired?: () => void;
}

export const WorkArea: React.FC<WorkAreaProps> = ({ selectedAnalysis, uploadedData = [], user, onAuthRequired }) => {
  const [datasets, setDatasets] = useState<DataSet[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const analysisQueueRef = useRef<AnalysisQueueRef>(null);

  useEffect(() => {
    if (user) {
      loadDatasets();
    }
  }, [user]);

  const loadDatasets = async () => {
    try {
      const { data, error } = await supabase
        .from('datasets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our DataSet interface
      const transformedData: DataSet[] = (data || []).map(item => ({
        ...item,
        data: Array.isArray(item.data) ? item.data : []
      }));

      setDatasets(transformedData);
    } catch (error) {
      console.error('加载数据集失败:', error);
      toast({
        title: "加载失败",
        description: "无法加载数据集列表",
        variant: "destructive",
      });
    }
  };

  const runAnalysis = async () => {
    if (!selectedAnalysis) {
      toast({
        title: "请选择分析方法",
        description: "请从左侧选择要进行的分析方法",
        variant: "destructive",
      });
      return;
    }

    let dataToAnalyze: any[] = [];
    let dataSourceName = '';

    if (selectedDataset) {
      const dataset = datasets.find(d => d.id === selectedDataset);
      if (dataset) {
        dataToAnalyze = dataset.data;
        dataSourceName = dataset.name;
      }
    } else if (uploadedData && uploadedData.length > 0) {
      dataToAnalyze = uploadedData;
      dataSourceName = '上传的数据';
    }

    if (dataToAnalyze.length === 0) {
      toast({
        title: "没有可分析的数据",
        description: "请选择数据集或上传数据文件",
        variant: "destructive",
      });
      return;
    }

    const analysisInfo = analysisConfig[selectedAnalysis as keyof typeof analysisConfig];
    const taskName = `${analysisInfo?.title || selectedAnalysis} - ${dataSourceName}`;

    // 添加到分析队列
    const taskId = analysisQueueRef.current?.addTask(taskName);

    setIsAnalyzing(true);

    try {
      // 模拟分析过程
      if (taskId) {
        analysisQueueRef.current?.updateTask(taskId, { status: 'running', progress: 10 });
      }

      // 调用分析API
      const { data: result, error } = await supabase.functions.invoke('analyze-data', {
        body: {
          data: dataToAnalyze,
          analysis_type: selectedAnalysis,
          user_id: user?.id
        }
      });

      if (error) throw error;

      // 更新进度
      if (taskId) {
        analysisQueueRef.current?.updateTask(taskId, { status: 'running', progress: 80 });
      }

      // 保存分析结果
      if (user) {
        await supabase.from('analysis_logs').insert({
          user_id: user.id,
          prompt: `${selectedAnalysis} analysis on ${dataSourceName}`,
          model_id: 'system',
          provider: 'internal',
          result: JSON.stringify(result)
        });
      }

      // 完成任务
      if (taskId) {
        analysisQueueRef.current?.updateTask(taskId, { 
          status: 'completed', 
          progress: 100, 
          completedAt: new Date(),
          result: JSON.stringify(result)
        });
      }

      toast({
        title: "分析完成",
        description: `${analysisInfo?.title || selectedAnalysis}分析已完成`,
      });

    } catch (error) {
      console.error('分析失败:', error);
      
      if (taskId) {
        analysisQueueRef.current?.updateTask(taskId, { 
          status: 'failed', 
          error: error instanceof Error ? error.message : '分析过程中出现错误'
        });
      }

      toast({
        title: "分析失败",
        description: "分析过程中出现错误，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const currentAnalysis = analysisConfig[selectedAnalysis as keyof typeof analysisConfig];

  return (
    <div className="space-y-6">
      {/* 数据源选择 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>数据源选择</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!user && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-amber-800">
                      未登录用户只能查看界面和功能介绍。如需使用完整分析功能，请
                      <span 
                        className="font-medium cursor-pointer text-amber-900 hover:underline"
                        onClick={() => onAuthRequired?.()}
                      >
                        登录
                      </span>
                      或
                      <span 
                        className="font-medium cursor-pointer text-amber-900 hover:underline"
                        onClick={() => onAuthRequired?.()}
                      >
                        注册
                      </span>。
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2">选择数据集</label>
              <Select value={selectedDataset} onValueChange={setSelectedDataset} disabled={!user}>
                <SelectTrigger className={!user ? 'opacity-60 cursor-not-allowed' : ''}>
                  <SelectValue placeholder={user ? "选择要分析的数据集" : "请登录后选择数据集"} />
                </SelectTrigger>
                <SelectContent>
                  {datasets.map((dataset) => (
                    <SelectItem key={dataset.id} value={dataset.id}>
                      <div className="flex flex-col">
                        <span>{dataset.name}</span>
                        <span className="text-xs text-gray-500">
                          {dataset.data.length} 条记录
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {uploadedData && uploadedData.length > 0 && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">临时上传的数据</span>
                  <Badge variant="secondary">{uploadedData.length} 条记录</Badge>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  如果未选择数据集，将使用此临时数据进行分析
                </p>
              </div>
            )}

            {!selectedDataset && (!uploadedData || uploadedData.length === 0) && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      没有可用的数据源
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        请选择数据集或上传数据文件
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 分析说明 */}
      {selectedAnalysis && currentAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Play className="h-5 w-5" />
              <span>{currentAnalysis.title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-base mb-1">分析说明</h4>
              <p className="text-sm text-gray-600">{currentAnalysis.description}</p>
            </div>
            <div>
              <h4 className="font-semibold text-base mb-1">使用示例</h4>
              <p className="text-sm text-gray-600">{currentAnalysis.example}</p>
            </div>
            <Button
              onClick={runAnalysis}
              disabled={!user || isAnalyzing || (!selectedDataset && (!uploadedData || uploadedData.length === 0))}
              className={`w-full ${!user ? 'bg-gray-100 hover:bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
              size="lg"
            >
              {!user ? '请登录后开始分析' : isAnalyzing ? '分析中...' : '开始分析'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 分析队列 */}
      <AnalysisQueue ref={analysisQueueRef} />
    </div>
  );
};
