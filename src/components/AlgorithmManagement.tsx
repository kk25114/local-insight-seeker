import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, GitBranch } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AlgorithmForm } from './AlgorithmForm';
import type { User } from '@supabase/supabase-js';

interface Algorithm {
  id: string;
  name: string;
  category: string;
  description: string;
  prompt_template: string;
  parameters: any;
  created_at: string;
}

interface AlgorithmManagementProps {
  user: User;
}

export const AlgorithmManagement: React.FC<AlgorithmManagementProps> = ({ user }) => {
  const [algorithms, setAlgorithms] = useState<Algorithm[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAlgorithm, setEditingAlgorithm] = useState<Algorithm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log('AlgorithmManagement mounted, user:', user);
    loadAlgorithms();
  }, []);

  const loadAlgorithms = async () => {
    console.log('开始加载算法...');
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('analysis_algorithms')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      console.log('Supabase 查询结果:', { data, error });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('成功加载算法:', data);
      setAlgorithms(data || []);
    } catch (error) {
      console.error('加载算法失败:', error);
      toast({
        title: "加载失败",
        description: "无法获取算法列表，请查看控制台错误信息",
        variant: "destructive",
      });
      // 设置为空数组以保证UI正常显示
      setAlgorithms([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个算法吗？')) return;

    try {
      const { error } = await supabase
        .from('analysis_algorithms')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "删除成功",
        description: "算法已成功删除",
      });
      loadAlgorithms();
    } catch (error) {
      console.error('删除算法失败:', error);
      toast({
        title: "删除失败",
        description: "删除算法时出现错误",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (algorithm: Algorithm) => {
    setEditingAlgorithm(algorithm);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    setIsDialogOpen(false);
    setEditingAlgorithm(null);
    loadAlgorithms();
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setEditingAlgorithm(null);
  };

  const handleNewAlgorithm = () => {
    setEditingAlgorithm(null);
    setIsDialogOpen(true);
  };

  const initializeDefaultAlgorithms = async () => {
    try {
      // 首先检查是否已经有算法了
      const { data: existingAlgorithms } = await supabase
        .from('analysis_algorithms')
        .select('name')
        .limit(1);

      if (existingAlgorithms && existingAlgorithms.length > 0) {
        toast({
          title: "提示",
          description: "已存在算法，无需重复初始化",
        });
        return;
      }

      const defaultAlgorithms = [
        {
          name: '机器学习预测',
          category: '进阶方法',
          description: '使用机器学习算法进行预测分析',
          prompt_template: '请对以下数据进行机器学习预测分析，数据如下：{data}。请选择合适的机器学习算法，解释模型性能，并给出预测结果和建议。',
          created_by: user.id
        },
        {
          name: 'K-means聚类',
          category: '进阶方法',
          description: '使用K-means算法进行聚类分析',
          prompt_template: '请对以下数据进行K-means聚类分析，数据如下：{data}。请确定最佳聚类数量，解释各聚类的特征，并给出业务建议。',
          created_by: user.id
        },
        {
          name: '主成分分析',
          category: '综合评价',
          description: '进行主成分分析降维',
          prompt_template: '请对以下数据进行主成分分析，数据如下：{data}。请解释主成分的含义，计算方差贡献率，并提供降维建议。',
          created_by: user.id
        }
      ];

      const { error } = await supabase
        .from('analysis_algorithms')
        .insert(defaultAlgorithms);

      if (error) {
        throw error;
      }

      toast({
        title: "初始化成功",
        description: "已添加默认算法",
      });
      loadAlgorithms();
    } catch (error) {
      console.error('初始化默认算法失败:', error);
      toast({
        title: "初始化失败",
        description: "添加默认算法时出现错误",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <GitBranch className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">算法管理</h1>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewAlgorithm}>
              <Plus className="h-4 w-4 mr-2" />
              新增算法
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAlgorithm ? '编辑算法' : '新增算法'}
              </DialogTitle>
            </DialogHeader>
            <AlgorithmForm
              user={user}
              algorithm={editingAlgorithm}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>算法列表 ({algorithms.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">加载中...</p>
            </div>
          ) : algorithms.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">暂无算法，您可以添加新算法或初始化默认算法</p>
              <Button onClick={initializeDefaultAlgorithms} variant="outline">
                初始化默认算法
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名称</TableHead>
                  <TableHead>分类</TableHead>
                  <TableHead>描述</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {algorithms.map((algorithm) => (
                  <TableRow key={algorithm.id}>
                    <TableCell className="font-medium">{algorithm.name}</TableCell>
                    <TableCell>{algorithm.category}</TableCell>
                    <TableCell>{algorithm.description || '无描述'}</TableCell>
                    <TableCell>
                      {new Date(algorithm.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(algorithm)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(algorithm.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
