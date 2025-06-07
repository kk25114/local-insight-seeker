import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Play, FileText, Database, Settings, User, Bell, LogOut, Cog, GitBranch, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface MainHeaderProps {
  onDataUpload: (data: any[]) => void;
  user: SupabaseUser | null;
  currentView: 'landing' | 'auth' | 'analysis' | 'algorithms' | 'models' | 'data' | 'about';
  onViewChange: (view: 'landing' | 'auth' | 'analysis' | 'algorithms' | 'models' | 'data' | 'about') => void;
}

export const MainHeader: React.FC<MainHeaderProps> = ({ onDataUpload, user, currentView, onViewChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [analysisMode, setAnalysisMode] = useState<string>('basic');




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
      case 'data':
        return '数据管理';
      default:
        return 'SPSSAI';
    }
  };

  const handleModeChange = (mode: string) => {
    setAnalysisMode(mode);
    toast({
      title: "模式切换",
      description: `已切换到${mode === 'basic' ? 'SPSSAI基础' : 'SPSSAI专业'}模式`,
    });
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {currentView === 'analysis' ? (
            /* 分析页面显示模式选择器 */
            <div className="relative">
              <Select value={analysisMode} onValueChange={handleModeChange}>
                <SelectTrigger className="w-40 bg-blue-600 text-white border-blue-600 hover:bg-blue-700 text-sm">
                  <SelectValue placeholder="选择模式" />
                </SelectTrigger>
                <SelectContent className="z-50">
                  <SelectItem value="basic" className="text-sm">SPSSAI基础模式</SelectItem>
                  <SelectItem value="professional" className="text-sm">SPSSAI专业模式</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : (
            /* 其他页面显示SPSSAI logo */
            <div 
              className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onViewChange('analysis')}
            >
              <div className="w-4 h-4 bg-blue-600 rounded-sm flex items-center justify-center">
                <span className="text-white text-xs font-bold">S</span>
              </div>
              <span className="text-blue-600 font-semibold">SPSSAI</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-4">

          {currentView === 'analysis' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewChange('data')}
                className="flex items-center space-x-2"
              >
                <Database className="h-4 w-4" />
                <span>我的数据</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewChange('about')}
                className="flex items-center space-x-2"
              >
                <FileText className="h-4 w-4" />
                <span>文档</span>
              </Button>
            </>
          )}
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Bell className="h-4 w-4 cursor-pointer hover:text-blue-600" />
            {user ? (
              <div className="relative group">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center space-x-2"
                >
                  <User className="h-4 w-4" />
                  <span>{user.email}</span>
                </Button>
                
                {/* 用户下拉菜单 */}
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div 
                    className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center"
                    onClick={() => onViewChange('analysis')}
                  >
                    <div className="w-4 h-4 bg-blue-600 rounded-sm flex items-center justify-center mr-2">
                      <span className="text-white text-xs font-bold">S</span>
                    </div>
                    <span className="text-blue-600 font-semibold">SPSSAI</span>
                  </div>
                  <div className="border-t border-gray-200 my-1"></div>
                  <div 
                    className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center"
                    onClick={() => onViewChange('analysis')}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    <span>数据分析</span>
                  </div>
                  <div 
                    className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center"
                    onClick={() => onViewChange('algorithms')}
                  >
                    <GitBranch className="h-4 w-4 mr-2" />
                    <span>算法管理</span>
                  </div>
                  <div 
                    className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center"
                    onClick={() => onViewChange('models')}
                  >
                    <Cog className="h-4 w-4 mr-2" />
                    <span>模型管理</span>
                  </div>
                  <div 
                    className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center"
                    onClick={() => onViewChange('data')}
                  >
                    <Database className="h-4 w-4 mr-2" />
                    <span>数据管理</span>
                  </div>
                  <div className="border-t border-gray-200 my-1"></div>
                  <div className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center">
                    <Settings className="h-4 w-4 mr-2" />
                    <span>设置</span>
                  </div>
                  <div className="border-t border-gray-200 my-1"></div>
                  <div 
                    className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center"
                    onClick={() => onViewChange('about')}
                  >
                    <Info className="h-4 w-4 mr-2" />
                    <span>关于</span>
                  </div>
                  <div className="border-t border-gray-200 my-1"></div>
                  <div 
                    className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>退出登录</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative group">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center space-x-2"
                >
                  <User className="h-4 w-4" />
                  <span>访客</span>
                </Button>
                
                {/* 访客下拉菜单 */}
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div 
                    className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center"
                    onClick={() => onViewChange('about')}
                  >
                    <Info className="h-4 w-4 mr-2" />
                    <span>关于</span>
                  </div>
                  <div className="border-t border-gray-200 my-1"></div>
                  <div 
                    className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center"
                    onClick={() => onViewChange('auth')}
                  >
                    <User className="h-4 w-4 mr-2" />
                    <span>登录</span>
                  </div>
                  <div 
                    className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center"
                    onClick={() => onViewChange('auth')}
                  >
                    <User className="h-4 w-4 mr-2" />
                    <span>注册</span>
                  </div>
                </div>
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
