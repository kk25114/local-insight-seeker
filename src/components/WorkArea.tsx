
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
}

// 分析方法配置
const analysisConfig = {
  frequency: {
    title: '频数分析',
    description: '统计数据中各值出现的频次',
    example: '适用于分析问卷中选择题的分布情况'
  },
  crosstab: {
    title: '交叉表分析',
    description: '分析两个或多个分类变量之间的关系',
    example: '适用于分析性别与购买偏好的关系'
  },
  descriptives: {
    title: '描述性统计',
    description: '计算均值、标准差、最大值、最小值等基本统计量',
    example: '适用于了解数据的基本分布特征'
  },
  correlation: {
    title: '相关性分析',
    description: '分析变量之间的线性相关关系',
    example: '适用于分析收入与消费支出的关系'
  },
  regression: {
    title: '线性回归分析',
    description: '建立因变量与自变量之间的线性关系模型',
    example: '适用于预测房价与面积、位置等因素的关系'
  },
  anova: {
    title: '方差分析',
    description: '比较多个组之间的均值差异',
    example: '适用于比较不同教学方法的效果差异'
  },
  ttest: {
    title: 'T检验',
    description: '比较两个组的均值是否存在显著差异',
    example: '适用于比较两种药物的治疗效果'
  },
  reliability: {
    title: '信度分析',
    description: '评估问卷或量表的内部一致性',
    example: '适用于验证问卷的可靠性'
  }
};

export const WorkArea: React.FC<WorkAreaProps> = ({ selectedAnalysis, uploadedData, user }) => {
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
    } else if (uploadedData.length > 0) {
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
          analysis_type: selectedAnalysis,
          dataset_id: selectedDataset || null,
          result: result,
          status: 'completed'
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
            <div>
              <label className="block text-sm font-medium mb-2">选择数据集</label>
              <Select value={selectedDataset} onValueChange={setSelectedDataset}>
                <SelectTrigger>
                  <SelectValue placeholder="选择要分析的数据集" />
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

            {uploadedData.length > 0 && (
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

            {!selectedDataset && uploadedData.length === 0 && (
              <div className="p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">
                    没有可用的数据源
                  </span>
                </div>
                <p className="text-xs text-yellow-600 mt-1">
                  请选择数据集或上传数据文件
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 分析配置 */}
      {selectedAnalysis && currentAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Play className="h-5 w-5" />
              <span>{currentAnalysis.title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">分析说明</h4>
                <p className="text-sm text-gray-600">{currentAnalysis.description}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">使用示例</h4>
                <p className="text-sm text-gray-600">{currentAnalysis.example}</p>
              </div>
              <Button
                onClick={runAnalysis}
                disabled={isAnalyzing || (!selectedDataset && uploadedData.length === 0)}
                className="w-full"
                size="lg"
              >
                {isAnalyzing ? '分析中...' : '开始分析'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 分析队列 */}
      <AnalysisQueue ref={analysisQueueRef} />
    </div>
  );
};

