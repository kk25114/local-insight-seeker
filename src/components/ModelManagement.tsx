
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
  const { toast } = useToast();

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_models')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setModels(data || []);
    } catch (error) {
      console.error('加载模型失败:', error);
      toast({
        title: "加载失败",
        description: "无法获取模型列表",
        variant: "destructive",
      });
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

  // 添加您指定的 Grok 模型
  const addGrokModel = async () => {
    try {
      const { error } = await supabase
        .from('ai_models')
        .insert({
          name: 'Grok 3 Fast Beta',
          provider: 'xai',
          model_id: 'grok-3-fast-beta',
          api_key_name: 'XAI_API_KEY',
          is_active: true,
        });

      if (error) throw error;
      
      toast({
        title: "添加成功",
        description: "Grok 3 Fast Beta 模型已成功添加",
      });
      loadModels();
    } catch (error) {
      console.error('添加 Grok 模型失败:', error);
      toast({
        title: "添加失败",
        description: "添加 Grok 模型时出现错误",
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
          <Button variant="outline" onClick={addGrokModel}>
            快速添加 Grok 3 Fast Beta
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingModel(null); setIsDialogOpen(true); }}>
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
          <CardTitle>模型列表</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
};
