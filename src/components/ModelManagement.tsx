import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ModelForm } from './ModelForm';
import type { User } from '@supabase/supabase-js';

interface AIModel {
  id: string;
  name: string;
  provider: string;
  model_id: string;
  api_key_name: string;
  is_active: boolean;
  created_at: string;
}

interface ModelManagementProps {
  user: User;
}

export const ModelManagement: React.FC<ModelManagementProps> = ({ user }) => {
  const [models, setModels] = useState<AIModel[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<AIModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log('ModelManagement mounted, user:', user);
    loadModels();
  }, []);

  const loadModels = async () => {
    console.log('开始加载模型...');
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('ai_models')
        .select('*')
        .order('name', { ascending: true });

      console.log('Supabase 查询结果:', { data, error });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('成功加载模型:', data);
      setModels(data || []);
    } catch (error) {
      console.error('加载模型失败:', error);
      toast({
        title: "加载失败",
        description: "无法获取模型列表，请查看控制台错误信息",
        variant: "destructive",
      });
      // 设置为空数组以保证UI正常显示
      setModels([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个模型吗？')) return;

    try {
      const { error } = await supabase
        .from('ai_models')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "删除成功",
        description: "模型已成功删除",
      });
      loadModels();
    } catch (error) {
      console.error('删除模型失败:', error);
      toast({
        title: "删除失败",
        description: "删除模型时出现错误",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (model: AIModel) => {
    setEditingModel(model);
    setIsDialogOpen(true);
  };

  const toggleActive = async (id: string, is_active: boolean) => {
    try {
      const { error } = await supabase
        .from('ai_models')
        .update({ is_active: !is_active })
        .eq('id', id);

      if (error) throw error;
      loadModels();
      toast({
        title: "状态更新",
        description: `模型已${!is_active ? '启用' : '禁用'}`,
      });
    } catch (error) {
      console.error('更新状态失败:', error);
      toast({
        title: "更新失败",
        description: "更新模型状态时出现错误",
        variant: "destructive",
      });
    }
  };

  const handleSave = () => {
    setIsDialogOpen(false);
    setEditingModel(null);
    loadModels();
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setEditingModel(null);
  };

  const handleNewModel = () => {
    setEditingModel(null);
    setIsDialogOpen(true);
  };

  // 添加初始化默认模型的功能
  const initializeDefaultModels = async () => {
    try {
      // 首先检查是否已经有模型了
      const { data: existingModels } = await supabase
        .from('ai_models')
        .select('name')
        .limit(1);

      if (existingModels && existingModels.length > 0) {
        toast({
          title: "提示",
          description: "已存在AI模型，无需重复初始化",
        });
        return;
      }

      const defaultModels = [
        {
          name: 'GPT-4o',
          provider: 'openai',
          model_id: 'gpt-4o',
          api_key_name: 'OPENAI_API_KEY',
          is_active: true,
        },
        {
          name: 'Claude 3.5 Sonnet',
          provider: 'anthropic', 
          model_id: 'claude-3-5-sonnet-20241022',
          api_key_name: 'ANTHROPIC_API_KEY',
          is_active: true,
        },
        {
          name: 'Grok 3 Fast Beta',
          provider: 'xai',
          model_id: 'grok-3-fast-beta', 
          api_key_name: 'XAI_API_KEY',
          is_active: true,
        }
      ];

      const { error } = await supabase
        .from('ai_models')
        .insert(defaultModels);

      if (error) {
        throw error;
      }

      toast({
        title: "初始化成功",
        description: "已添加默认AI模型",
      });
      loadModels();
    } catch (error) {
      console.error('初始化默认模型失败:', error);
      toast({
        title: "初始化失败",
        description: "添加默认模型时出现错误",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Settings className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">模型管理</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={initializeDefaultModels}>
            初始化默认模型
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleNewModel}>
                <Plus className="h-4 w-4 mr-2" />
                新增模型
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingModel ? '编辑模型' : '新增模型'}
                </DialogTitle>
              </DialogHeader>
              <ModelForm
                model={editingModel}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>模型列表 ({models.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">加载中...</p>
            </div>
          ) : models.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">暂无AI模型，您可以添加新模型或初始化默认模型</p>
              <Button onClick={initializeDefaultModels} variant="outline">
                初始化默认模型
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名称</TableHead>
                  <TableHead>提供商</TableHead>
                  <TableHead>模型ID</TableHead>
                  <TableHead>API密钥</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {models.map((model) => (
                  <TableRow key={model.id}>
                    <TableCell className="font-medium">{model.name}</TableCell>
                    <TableCell>{model.provider}</TableCell>
                    <TableCell>{model.model_id}</TableCell>
                    <TableCell>{model.api_key_name}</TableCell>
                    <TableCell>
                      <Switch
                        checked={model.is_active}
                        onCheckedChange={() => toggleActive(model.id, model.is_active)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(model)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(model.id)}
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
