
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
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
  const [formData, setFormData] = useState({
    name: '',
    provider: '',
    model_id: '',
    api_key_name: '',
    is_active: true,
  });
  const { toast } = useToast();

  const providers = [
    { value: 'openai', label: 'OpenAI' },
    { value: 'anthropic', label: 'Anthropic' },
    { value: 'xai', label: 'xAI (Grok)' },
    { value: 'google', label: 'Google' },
  ];

  const apiKeyOptions = [
    { value: 'OPENAI_API_KEY', label: 'OPENAI_API_KEY' },
    { value: 'ANTHROPIC_API_KEY', label: 'ANTHROPIC_API_KEY' },
    { value: 'XAI_API_KEY', label: 'XAI_API_KEY' },
    { value: 'GOOGLE_API_KEY', label: 'GOOGLE_API_KEY' },
  ];

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

  const handleSave = async () => {
    if (!formData.name || !formData.provider || !formData.model_id || !formData.api_key_name) {
      toast({
        title: "请填写完整信息",
        description: "所有字段都是必填项",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingModel) {
        const { error } = await supabase
          .from('ai_models')
          .update({
            name: formData.name,
            provider: formData.provider,
            model_id: formData.model_id,
            api_key_name: formData.api_key_name,
            is_active: formData.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingModel.id);

        if (error) throw error;
        toast({
          title: "更新成功",
          description: "模型已成功更新",
        });
      } else {
        const { error } = await supabase
          .from('ai_models')
          .insert({
            name: formData.name,
            provider: formData.provider,
            model_id: formData.model_id,
            api_key_name: formData.api_key_name,
            is_active: formData.is_active,
          });

        if (error) throw error;
        toast({
          title: "创建成功",
          description: "新模型已成功创建",
        });
      }

      resetForm();
      loadModels();
    } catch (error) {
      console.error('保存模型失败:', error);
      toast({
        title: "保存失败",
        description: "保存模型时出现错误",
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
    setFormData({
      name: model.name,
      provider: model.provider,
      model_id: model.model_id,
      api_key_name: model.api_key_name,
      is_active: model.is_active,
    });
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

  const resetForm = () => {
    setFormData({
      name: '',
      provider: '',
      model_id: '',
      api_key_name: '',
      is_active: true,
    });
    setEditingModel(null);
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Settings className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">模型管理</h1>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              新增模型
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingModel ? '编辑模型' : '新增模型'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">模型名称 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="输入模型名称"
                />
              </div>
              <div>
                <Label htmlFor="provider">提供商 *</Label>
                <Select value={formData.provider} onValueChange={(value) => setFormData({ ...formData, provider: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择提供商" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map((provider) => (
                      <SelectItem key={provider.value} value={provider.value}>
                        {provider.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="model_id">模型ID *</Label>
                <Input
                  id="model_id"
                  value={formData.model_id}
                  onChange={(e) => setFormData({ ...formData, model_id: e.target.value })}
                  placeholder="例如: gpt-4o, claude-3, grok-beta"
                />
              </div>
              <div>
                <Label htmlFor="api_key_name">API密钥名称 *</Label>
                <Select value={formData.api_key_name} onValueChange={(value) => setFormData({ ...formData, api_key_name: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择API密钥" />
                  </SelectTrigger>
                  <SelectContent>
                    {apiKeyOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">启用模型</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={resetForm}>
                  取消
                </Button>
                <Button onClick={handleSave}>
                  {editingModel ? '更新' : '创建'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
