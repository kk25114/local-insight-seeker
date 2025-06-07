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
  const [fileData, setFileData] = useState<any[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
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
    } else if (uploadedData && uploadedData.length > 0) {
      dataToPreview = uploadedData;
    }
    
    setPreviewData(dataToPreview.slice(0, 5)); // 显示前5行
  }, [selectedDataset, fileData, uploadedData, datasets]);

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
    setPreviewData(data.slice(0, 5));
  };

  const runAnalysis = async () => {
    if (!user) {
      onAuthRequired?.();
      return;
    }

    let dataToAnalyze: any[] = [];
    
    if (selectedDataset) {
      const dataset = datasets.find(d => d.id === selectedDataset);
      if (dataset) {
        dataToAnalyze = dataset.data;
      }
    } else if (fileData && fileData.length > 0) {
      dataToAnalyze = fileData;
    } else if (uploadedData && uploadedData.length > 0) {
      dataToAnalyze = uploadedData;
    }

    if (dataToAnalyze.length === 0) {
      toast({
        title: "没有可分析的数据",
        description: "请先选择数据集、上传文件或连接数据库",
        variant: "destructive",
      });
      return;
    }

    if (!selectedAnalysis) {
      toast({
        title: "请选择分析方法",
        description: "请从左侧选择要执行的统计分析方法",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      analysisQueueRef.current?.addTask(
        `${analysisConfig[selectedAnalysis]?.name || selectedAnalysis} 分析`
      );

      toast({
        title: "分析已启动",
        description: `正在执行 ${analysisConfig[selectedAnalysis]?.name || selectedAnalysis} 分析`,
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

  const currentAnalysis = analysisConfig[selectedAnalysis as keyof typeof analysisConfig];
  const hasData = selectedDataset || fileData.length > 0 || (uploadedData && uploadedData.length > 0);

  return (
    <div className="flex flex-col h-full">
      {/* 分析按钮区域 - 仅在选择分析方法时显示 */}
      {selectedAnalysis && currentAnalysis && (
        <div className="p-4 border-b bg-white rounded-t-lg">
          <h3 className="font-semibold">{currentAnalysis.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{currentAnalysis.description}</p>
          <Button
            onClick={runAnalysis}
            disabled={!user || isAnalyzing || !hasData}
            className="w-full mt-4"
            size="lg"
          >
            {isAnalyzing ? '分析中...' : '开始分析'}
          </Button>
        </div>
      )}

      {/* 数据源选择区域 */}
      <Card className="flex-1 flex flex-col overflow-hidden border-0 rounded-none">
        {/* 固定头部 */}
        <div className="flex-shrink-0 bg-white p-4 border-b">
          <CardTitle className="flex items-center space-x-2 text-base">
            <Database className="h-5 w-5" />
            <span>数据源选择</span>
          </CardTitle>
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
          <div className="flex-1 overflow-y-auto">
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
          </div>
        </Tabs>
      </Card>

      {/* 数据预览区域 */}
      {previewData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>数据预览 (前5行)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    {Object.keys(previewData[0] || {}).map((key) => (
                      <th key={key} className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      {Object.values(row).map((value, cellIndex) => (
                        <td key={cellIndex} className="border border-gray-300 px-4 py-2 text-sm text-gray-600">
                          {String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 分析队列 */}
      <AnalysisQueue ref={analysisQueueRef} />
    </div>
  );
};
