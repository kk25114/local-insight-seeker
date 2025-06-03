
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Play, FileText, Database, Settings, User, Bell, LogOut, Cog, GitBranch } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { supabase } from '@/integrations/supabase/client';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface MainHeaderProps {
  onDataUpload: (data: any[]) => void;
  user: SupabaseUser | null;
  currentView: 'landing' | 'auth' | 'analysis' | 'algorithms' | 'models';
  onViewChange: (view: 'landing' | 'auth' | 'analysis' | 'algorithms' | 'models') => void;
}

export const MainHeader: React.FC<MainHeaderProps> = ({ onDataUpload, user, currentView, onViewChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          console.log('文件上传成功:', file.name);
          toast({
            title: "文件上传成功",
            description: `已成功上传 ${file.name}`,
          });
          // 模拟数据处理
          const mockData = [
            { id: 1, variable1: 23, variable2: 45, variable3: 67 },
            { id: 2, variable1: 34, variable2: 56, variable3: 78 },
            { id: 3, variable1: 45, variable2: 67, variable3: 89 },
          ];
          onDataUpload(mockData);
        } catch (error) {
          toast({
            title: "文件上传失败",
            description: "请检查文件格式是否正确",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "已退出登录",
        description: "您已成功退出系统",
      });
      onViewChange('landing');
    } catch (error) {
      toast({
        title: "退出失败",
        description: "退出登录时出现错误",
        variant: "destructive",
      });
    }
  };

  const handleStartAnalysis = () => {
    if (!user) {
      onViewChange('auth');
    } else {
      fileInputRef.current?.click();
    }
  };

  const getViewTitle = () => {
    switch (currentView) {
      case 'algorithms':
        return '算法管理';
      case 'models':
        return '模型管理';
      default:
        return 'SPSSAI';
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {currentView === 'analysis' && <SidebarTrigger />}
          <h1 className="text-xl font-bold text-blue-600">{getViewTitle()}</h1>
          <span className="text-sm text-gray-500">统计科学 — 点就好</span>
        </div>
        
        <div className="flex items-center space-x-4">
          {currentView === 'analysis' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>上传数据</span>
              </Button>
              
              <Button
                size="sm"
                onClick={handleStartAnalysis}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
              >
                <Play className="h-4 w-4" />
                <span>开始分析</span>
              </Button>
            </>
          )}
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Bell className="h-4 w-4 cursor-pointer hover:text-blue-600" />
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => onViewChange('analysis')}>
                    <FileText className="h-4 w-4 mr-2" />
                    <span>数据分析</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onViewChange('algorithms')}>
                    <GitBranch className="h-4 w-4 mr-2" />
                    <span>算法管理</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onViewChange('models')}>
                    <Cog className="h-4 w-4 mr-2" />
                    <span>模型管理</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    <span>设置</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Database className="h-4 w-4 mr-2" />
                    <span>数据管理</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>退出登录</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={() => onViewChange('auth')}>
                  登录
                </Button>
                <Button size="sm" onClick={() => onViewChange('auth')}>
                  注册
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.json,.xlsx"
        onChange={handleFileUpload}
        className="hidden"
      />
    </header>
  );
};
