import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, AlertCircle, Upload, Eye, Play, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AnalysisQueue, AnalysisQueueRef } from './AnalysisQueue';
import { DatabaseConnection } from './DatabaseConnection';
import { AnalysisResultPage } from './AnalysisResultPage';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { analysisConfig } from '@/config/analysis';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
  selectedAnalyses: string[];
  user: SupabaseUser | null;
  onAuthRequired?: () => void;
}

export const WorkArea: React.FC<WorkAreaProps> = ({ 
  selectedAnalyses, 
  user, 
  onAuthRequired,
}) => {
  const [datasets, setDatasets] = useState<DataSet[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [fileData, setFileData] = useState<any[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [analysisResult, setAnalysisResult] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'selection' | 'results'>('selection');
  const { toast } = useToast();
  const analysisQueueRef = useRef<AnalysisQueueRef>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      loadDatasets();
    }
  }, [user]);

  // 更新预览数据
  useEffect(() => {
    let dataToPreview: any[] = [];
    
    if (selectedDataset) {
      const dataset = datasets.find(d => d.id === selectedDataset);
      if (dataset) {
        dataToPreview = dataset.data;
      }
    } else if (fileData && fileData.length > 0) {
      dataToPreview = fileData;
    }
    
    setPreviewData(dataToPreview); // 更新完整数据以供分析
  }, [selectedDataset, fileData, datasets]);

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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (file.name.endsWith('.csv')) {
          // 解析CSV文件
          const lines = text.split('\n').filter(line => line.trim());
          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          const data = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
            const row: any = {};
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });
            return row;
          });
          setFileData(data);
          toast({
            title: "文件上传成功",
            description: `已解析 ${data.length} 条数据记录`,
          });
        } else if (file.name.endsWith('.json')) {
          // 解析JSON文件
          const data = JSON.parse(text);
          const arrayData = Array.isArray(data) ? data : [data];
          setFileData(arrayData);
          toast({
            title: "文件上传成功",
            description: `已解析 ${arrayData.length} 条数据记录`,
          });
        }
      } catch (error) {
        console.error('文件解析失败:', error);
        toast({
          title: "文件解析失败",
          description: "请确保文件格式正确（CSV或JSON）",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  // 处理数据库连接组件的数据更新
  const handleDatabaseDataUpdate = (data: any[]) => {
    setPreviewData(data); // 直接用数据库查询结果更新预览
    setSelectedDataset('');
    setFileData([]);
  };

  const runAnalysis = async () => {
    if (!user) {
      onAuthRequired?.();
      return;
    }

    let dataToAnalyze = previewData;

    if (dataToAnalyze.length === 0) {
      toast({
        title: "没有可分析的数据",
        description: "请先选择数据集、上传文件或连接数据库",
        variant: "destructive",
      });
      return;
    }

    if (!selectedAnalyses || selectedAnalyses.length === 0) {
      toast({
        title: "请选择分析方法",
        description: "请从左侧选择要执行的统计分析方法",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      // 延迟模拟网络请求和分析过程
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const basicStatKeys = ['mean', 'median', 'variance', 'std_dev', 'max', 'min', 'range', 'quartiles', 'skewness', 'kurtosis'];
      const selectedBasicStats = selectedAnalyses.filter(key => basicStatKeys.includes(key));
      const otherAnalyses = selectedAnalyses.filter(key => !basicStatKeys.includes(key));

      let finalResults = [];

      // 1. 处理基础统计指标
      if (selectedBasicStats.length > 0) {
        const numericColumns = Object.keys(previewData[0] || {}).filter(key => 
          !isNaN(parseFloat(previewData[0][key]))
        );
        
        const summaryData = selectedBasicStats.map(statKey => {
          const row: { [key: string]: any } = { '指标': analysisConfig[statKey as keyof typeof analysisConfig]?.title || statKey };
          numericColumns.forEach(col => {
            // 在此应调用真实的计算函数，此处为模拟
            row[col] = (Math.random() * 100).toFixed(2);
          });
          return row;
        });

        finalResults.push({
          type: 'summary_table',
          title: '描述性统计',
          chartable: true,
          data: summaryData
        });
      }

      // 2. 处理其他独立分析
      const otherResults = otherAnalyses.map(key => {
        const config = analysisConfig[key as keyof typeof analysisConfig];
        switch (key) {
          case 'frequency':
            return { 
              type: 'table', 
              title: '频数分析结果',
              chartable: true,
              data: [
                { '名称': 1, '选项': 1.0, '频数': 1, '百分比(%)': 20.00, '累计百分比(%)': 20.00 },
                { '名称': 1, '选项': 3.0, '频数': 1, '百分比(%)': 20.00, '累计百分比(%)': 40.00 },
                { '名称': 1, '选项': 5.0, '频数': 1, '百分比(%)': 20.00, '累计百分比(%)': 60.00 },
                { '名称': 1, '选项': 6.0, '频数': 2, '百分比(%)': 40.00, '累计百分比(%)': 100.00 },
                { '名称': 3, '选项': 1.0, '频数': 2, '百分比(%)': 40.00, '累计百分比(%)': 40.00 },
                { '名称': 3, '选项': 2.0, '频数': 1, '百分比(%)': 20.00, '累计百分比(%)': 60.00 },
              ]
            };
          default: // 其他分析暂时也用指标卡代替
            return { 
              type: 'metric',
              title: config?.title || key, 
              value: 'N/A', 
              description: config?.description.split('\n')[0] || '未实现的分析'
            };
        }
      });

      finalResults.push(...otherResults);
  
      setAnalysisResult(finalResults);
      setViewMode('results');

      toast({
        title: "分析已完成",
        description: `已生成 ${finalResults.length} 项分析结果`,
      });
    } catch (error) {
      console.error('分析执行失败:', error);
      toast({
        title: "分析失败",
        description: "执行分析时发生错误",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const hasData = previewData.length > 0;
  const previewHeaders = hasData ? Object.keys(previewData[0]) : [];

  if (viewMode === 'results') {
    return (
      <AnalysisResultPage 
        results={analysisResult} 
        onBack={() => setViewMode('selection')} 
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* 数据源选择区域 */}
      <Card className="flex-1 flex flex-col overflow-hidden border-0 rounded-none">
        {/* 固定头部 */}
        <div className="flex-shrink-0 bg-white p-4 border-b flex justify-between items-center">
          <CardTitle className="flex items-center space-x-2 text-base">
            <Database className="h-5 w-5" />
            <span>数据源选择</span>
          </CardTitle>
          <Button
            onClick={runAnalysis}
            disabled={!user || isAnalyzing || !hasData || selectedAnalyses.length === 0}
          >
            <Play className="h-4 w-4 mr-2" />
            {isAnalyzing ? '分析中...' : '开始分析'}
          </Button>
        </div>

        {/* Tab 切换 */}
        <Tabs defaultValue="database" className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-shrink-0 px-4 border-b">
            <TabsList className="bg-transparent p-0 border-none -mb-px">
              <TabsTrigger value="datasets">现有数据集</TabsTrigger>
              <TabsTrigger value="upload">文件上传</TabsTrigger>
              <TabsTrigger value="database">数据库连接</TabsTrigger>
            </TabsList>
          </div>
          
          {/* 可滚动内容区 */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            {!user ? (
              <div className="p-6 text-center text-gray-500">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">请先登录</h3>
                <p className="mt-1 text-sm text-gray-500">登录后即可访问和管理您的数据源。</p>
                <div className="mt-6">
                  <Button onClick={onAuthRequired}>
                    前往登录
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <TabsContent value="datasets" className="p-6">
            <div>
                    <Label htmlFor="dataset-select">选择数据集</Label>
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
                </TabsContent>

                <TabsContent value="upload" className="p-6">
                  <div>
                    <Label htmlFor="file-upload">上传数据文件</Label>
                    <div className="mt-2">
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={!user}
                        variant="outline"
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {!user ? '请登录后上传文件' : '选择文件 (CSV, JSON)'}
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.json"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>
                    {fileData.length > 0 && (
                      <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">文件已上传</span>
                          <Badge variant="secondary">{fileData.length} 条记录</Badge>
                        </div>
                </div>
                    )}
              </div>
                </TabsContent>

                <TabsContent value="database" className="m-0">
                  <DatabaseConnection user={user} onDataUpdate={handleDatabaseDataUpdate} />
                </TabsContent>
              </>
            )}
            
            {/* 数据预览区域 */}
            {hasData && (
              <div className="p-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-base">
                      <Eye className="h-5 w-5" />
                      <span>数据预览 (前5行)</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {previewHeaders.map(header => <TableHead key={header}>{header}</TableHead>)}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {previewData.slice(0, 5).map((row, index) => (
                          <TableRow key={index}>
                            {previewHeaders.map(header => <TableCell key={header}>{String(row[header])}</TableCell>)}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </Tabs>
      </Card>
    </div>
  );
};
