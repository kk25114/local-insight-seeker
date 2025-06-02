
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

interface Algorithm {
  id?: string;
  name: string;
  category: string;
  description: string;
  prompt_template: string;
}

interface AlgorithmFormProps {
  user: User;
  algorithm?: Algorithm | null;
  onSave: () => void;
  onCancel: () => void;
}

export const AlgorithmForm: React.FC<AlgorithmFormProps> = ({ user, algorithm, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: algorithm?.name || '',
    category: algorithm?.category || '',
    description: algorithm?.description || '',
    prompt_template: algorithm?.prompt_template || '',
  });
  const [isLoading, setIsLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.prompt_template) {
      toast({
        title: "请填写完整信息",
        description: "名称、分类和提示模板都是必填项",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (algorithm?.id) {
        const { error } = await supabase
          .from('analysis_algorithms')
          .update({
            name: formData.name,
            category: formData.category,
            description: formData.description,
            prompt_template: formData.prompt_template,
            updated_at: new Date().toISOString(),
          })
          .eq('id', algorithm.id);

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

      onSave();
    } catch (error) {
      console.error('保存算法失败:', error);
      toast({
        title: "保存失败",
        description: "保存算法时出现错误",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">算法名称 *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="输入算法名称"
          required
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
          required
        />
        <p className="text-sm text-gray-500 mt-1">
          使用 {'{data}'} 作为数据占位符，系统会自动替换为实际数据
        </p>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          取消
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? '保存中...' : (algorithm?.id ? '更新' : '创建')}
        </Button>
      </div>
    </form>
  );
};
