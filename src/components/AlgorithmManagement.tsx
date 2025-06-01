
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, GitBranch } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
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
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    prompt_template: '',
  });
  const { toast } = useToast();

  const categories = [
    '通用方法',
    '问卷研究',
    '可视化',
    '数据处理',
    '进阶方法',
    '实验/医学研究',
    '综合评价',
    '计量经济研究'
  ];

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

  const handleSave = async () => {
    if (!formData.name || !formData.category || !formData.prompt_template) {
      toast({
        title: "请填写完整信息",
        description: "名称、分类和提示模板都是必填项",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingAlgorithm) {
        const { error } = await supabase
          .from('analysis_algorithms')
          .update({
            name: formData.name,
            category: formData.category,
            description: formData.description,
            prompt_template: formData.prompt_template,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingAlgorithm.id);

        if (error) throw error;
        toast({
          title: "更新成功",
          description: "算法已成功更新",
        });
      } else {
        const { error } = await supabase
          .from('analysis_algorithms')
          .insert({
            name: formData.name,
            category: formData.category,
            description: formData.description,
            prompt_template: formData.prompt_template,
            created_by: user.id,
          });

        if (error) throw error;
        toast({
          title: "创建成功",
          description: "新算法已成功创建",
        });
      }

      resetForm();
      loadAlgorithms();
    } catch (error) {
      console.error('保存算法失败:', error);
      toast({
        title: "保存失败",
        description: "保存算法时出现错误",
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
    setFormData({
      name: algorithm.name,
      category: algorithm.category,
      description: algorithm.description || '',
      prompt_template: algorithm.prompt_template,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      description: '',
      prompt_template: '',
    });
    setEditingAlgorithm(null);
    setIsDialogOpen(false);
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
            <Button onClick={() => resetForm()}>
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
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">算法名称 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="输入算法名称"
                />
              </div>
              <div>
                <Label htmlFor="category">分类 *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">描述</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="输入算法描述"
                />
              </div>
              <div>
                <Label htmlFor="prompt_template">提示模板 *</Label>
                <Textarea
                  id="prompt_template"
                  value={formData.prompt_template}
                  onChange={(e) => setFormData({ ...formData, prompt_template: e.target.value })}
                  placeholder="输入提示模板，使用 {data} 作为数据占位符"
                  rows={6}
                />
                <p className="text-sm text-gray-500 mt-1">
                  使用 {'{data}'} 作为数据占位符，系统会自动替换为实际数据
                </p>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={resetForm}>
                  取消
                </Button>
                <Button onClick={handleSave}>
                  {editingAlgorithm ? '更新' : '创建'}
                </Button>
              </div>
            </div>
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
