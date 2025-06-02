
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
  const { toast } = useToast();

  useEffect(() => {
    loadAlgorithms();
  }, []);

  const loadAlgorithms = async () => {
    try {
      const { data, error } = await supabase
        .from('analysis_algorithms')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setAlgorithms(data || []);
    } catch (error) {
      console.error('加载算法失败:', error);
      toast({
        title: "加载失败",
        description: "无法获取算法列表",
        variant: "destructive",
      });
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <GitBranch className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">算法管理</h1>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingAlgorithm(null); setIsDialogOpen(true); }}>
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
          <CardTitle>算法列表</CardTitle>
        </CardHeader>
        <CardContent>
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
                  <TableCell>{algorithm.description}</TableCell>
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
        </CardContent>
      </Card>
    </div>
  );
};
