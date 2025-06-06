import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, Download, Trash2, Eye, Plus, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
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

interface DataManagementProps {
  user: SupabaseUser | null;
  onDataSelect?: (data: any[]) => void;
}

export const DataManagement: React.FC<DataManagementProps> = ({ user, onDataSelect }) => {
  const [datasets, setDatasets] = useState<DataSet[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [newDataset, setNewDataset] = useState({
    name: '',
    description: '',
    file: null as File | null
  });
  const { toast } = useToast();

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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewDataset(prev => ({ ...prev, file }));
    }
  };

  const uploadDataset = async () => {
    if (!newDataset.file || !newDataset.name || !user) {
      toast({
        title: "信息不完整",
        description: "请填写数据集名称并选择文件",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          let data: any[] = [];
          
          if (newDataset.file?.name.endsWith('.json')) {
            data = JSON.parse(e.target?.result as string);
          } else if (newDataset.file?.name.endsWith('.csv')) {
            // 简单的CSV解析，实际项目中可能需要更完善的解析
            const text = e.target?.result as string;
            const lines = text.split('\n');
            const headers = lines[0].split(',');
            data = lines.slice(1).map(line => {
              const values = line.split(',');
              const obj: any = {};
              headers.forEach((header, index) => {
                obj[header.trim()] = values[index]?.trim();
              });
              return obj;
            });
          }

          const { error } = await supabase
            .from('datasets')
            .insert({
              name: newDataset.name,
              description: newDataset.description,
              data: data,
              user_id: user.id
            });

          if (error) throw error;

          toast({
            title: "上传成功",
            description: `数据集 ${newDataset.name} 已成功上传`,
          });

          setNewDataset({ name: '', description: '', file: null });
          loadDatasets();
        } catch (error) {
          throw error;
        }
      };
      reader.readAsText(newDataset.file);
    } catch (error) {
      console.error('上传数据集失败:', error);
      toast({
        title: "上传失败",
        description: "数据集上传失败，请检查文件格式",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const deleteDataset = async (id: string) => {
    try {
      const { error } = await supabase
        .from('datasets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "删除成功",
        description: "数据集已成功删除",
      });

      loadDatasets();
    } catch (error) {
      console.error('删除数据集失败:', error);
      toast({
        title: "删除失败",
        description: "无法删除数据集",
        variant: "destructive",
      });
    }
  };

  const selectDataset = (dataset: DataSet) => {
    if (onDataSelect) {
      onDataSelect(dataset.data);
      toast({
        title: "数据已选择",
        description: `已选择数据集: ${dataset.name}`,
      });
    }
  };

  // 添加初始化示例数据的功能
  const initializeSampleDatasets = async () => {
    if (!user) return;

    try {
      const sampleDatasets = [
        {
          name: '销售数据样例',
          description: '包含产品销售信息的示例数据',
          data: [
            { 产品: 'A产品', 销售额: 1200, 数量: 24, 月份: '1月' },
            { 产品: 'B产品', 销售额: 800, 数量: 16, 月份: '1月' },
            { 产品: 'C产品', 销售额: 1500, 数量: 30, 月份: '1月' },
            { 产品: 'A产品', 销售额: 1350, 数量: 27, 月份: '2月' },
            { 产品: 'B产品', 销售额: 950, 数量: 19, 月份: '2月' }
          ],
          user_id: user.id
        },
        {
          name: '学生成绩样例',
          description: '学生成绩数据示例',
          data: [
            { 姓名: '张三', 数学: 85, 语文: 78, 英语: 92, 班级: '一班' },
            { 姓名: '李四', 数学: 72, 语文: 85, 英语: 76, 班级: '一班' },
            { 姓名: '王五', 数学: 95, 语文: 88, 英语: 94, 班级: '二班' },
            { 姓名: '赵六', 数学: 68, 语文: 72, 英语: 81, 班级: '二班' }
          ],
          user_id: user.id
        }
      ];

      for (const dataset of sampleDatasets) {
        await supabase.from('datasets').insert(dataset);
      }

      toast({
        title: "初始化成功",
        description: "已添加示例数据集",
      });
      loadDatasets();
    } catch (error) {
      console.error('初始化示例数据失败:', error);
      toast({
        title: "初始化失败",
        description: "添加示例数据时出现错误",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>上传新数据集</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">数据集名称</label>
              <Input
                value={newDataset.name}
                onChange={(e) => setNewDataset(prev => ({ ...prev, name: e.target.value }))}
                placeholder="输入数据集名称"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">描述</label>
              <Textarea
                value={newDataset.description}
                onChange={(e) => setNewDataset(prev => ({ ...prev, description: e.target.value }))}
                placeholder="输入数据集描述"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">选择文件</label>
              <Input
                type="file"
                accept=".csv,.json,.xlsx"
                onChange={handleFileUpload}
              />
            </div>
            <Button
              onClick={uploadDataset}
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? '上传中...' : '上传数据集'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>数据集列表</span>
            <Badge variant="outline">{datasets.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {datasets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">暂无数据集，您可以上传新数据集或初始化示例数据</p>
              <Button onClick={initializeSampleDatasets} variant="outline">
                初始化示例数据
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {datasets.map((dataset) => (
                <div
                  key={dataset.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <h3 className="font-medium">{dataset.name}</h3>
                    <p className="text-sm text-gray-500">{dataset.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                      <span>记录数: {dataset.data.length}</span>
                      <span>创建时间: {new Date(dataset.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => selectDataset(dataset)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteDataset(dataset.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
