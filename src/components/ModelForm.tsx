
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AIModel {
  id?: string;
  name: string;
  provider: string;
  model_id: string;
  api_key_name: string;
  is_active: boolean;
}

interface ModelFormProps {
  model?: AIModel | null;
  onSave: () => void;
  onCancel: () => void;
}

export const ModelForm: React.FC<ModelFormProps> = ({ model, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: model?.name || '',
    provider: model?.provider || '',
    model_id: model?.model_id || '',
    api_key_name: model?.api_key_name || '',
    is_active: model?.is_active ?? true,
  });
  const [isLoading, setIsLoading] = useState(false);
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

  // 预设模型配置
  const presetModels = [
    { provider: 'openai', name: 'GPT-4o', model_id: 'gpt-4o', api_key: 'OPENAI_API_KEY' },
    { provider: 'openai', name: 'GPT-4o Mini', model_id: 'gpt-4o-mini', api_key: 'OPENAI_API_KEY' },
    { provider: 'anthropic', name: 'Claude 3.5 Sonnet', model_id: 'claude-3-5-sonnet-20241022', api_key: 'ANTHROPIC_API_KEY' },
    { provider: 'xai', name: 'Grok Beta', model_id: 'grok-beta', api_key: 'XAI_API_KEY' },
    { provider: 'xai', name: 'Grok 3 Fast Beta', model_id: 'grok-3-fast-beta', api_key: 'XAI_API_KEY' },
  ];

  const handlePresetSelect = (preset: any) => {
    setFormData({
      name: preset.name,
      provider: preset.provider,
      model_id: preset.model_id,
      api_key_name: preset.api_key,
      is_active: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.provider || !formData.model_id || !formData.api_key_name) {
      toast({
        title: "请填写完整信息",
        description: "所有字段都是必填项",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (model?.id) {
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
          .eq('id', model.id);

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

      onSave();
    } catch (error) {
      console.error('保存模型失败:', error);
      toast({
        title: "保存失败",
        description: "保存模型时出现错误",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {!model?.id && (
        <div>
          <Label className="text-base font-medium">快速添加预设模型</Label>
          <div className="grid grid-cols-1 gap-2 mt-2">
            {presetModels.map((preset, index) => (
              <Button
                key={index}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handlePresetSelect(preset)}
                className="justify-start"
              >
                {preset.name} ({preset.provider})
              </Button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">模型名称 *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="输入模型名称"
            required
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
            placeholder="例如: gpt-4o, claude-3-5-sonnet-20241022, grok-3-fast-beta"
            required
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
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            取消
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? '保存中...' : (model?.id ? '更新' : '创建')}
          </Button>
        </div>
      </form>
    </div>
  );
};
