import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Play, FileText, Database, Settings, User, Bell, LogOut, Cog, GitBranch, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isGuestMenuOpen, setIsGuestMenuOpen] = useState(false);
  const [userMenuTimer, setUserMenuTimer] = useState<NodeJS.Timeout | null>(null);
  const [guestMenuTimer, setGuestMenuTimer] = useState<NodeJS.Timeout | null>(null);

  const handleUserMenuEnter = () => {
    if (userMenuTimer) {
      clearTimeout(userMenuTimer);
      setUserMenuTimer(null);
    }
    setIsUserMenuOpen(true);
  };

  const handleUserMenuLeave = () => {
    const timer = setTimeout(() => {
      setIsUserMenuOpen(false);
    }, 150); // 150ms延迟
    setUserMenuTimer(timer);
  };

  const handleGuestMenuEnter = () => {
    if (guestMenuTimer) {
      clearTimeout(guestMenuTimer);
      setGuestMenuTimer(null);
    }
    setIsGuestMenuOpen(true);
  };

  const handleGuestMenuLeave = () => {
    const timer = setTimeout(() => {
      setIsGuestMenuOpen(false);
    }, 150); // 150ms延迟
    setGuestMenuTimer(timer);
  };

  // 清理定时器
  useEffect(() => {
    return () => {
      if (userMenuTimer) {
        clearTimeout(userMenuTimer);
      }
      if (guestMenuTimer) {
        clearTimeout(guestMenuTimer);
      }
    };
  }, [userMenuTimer, guestMenuTimer]);

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
              <DropdownMenu open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex items-center space-x-2"
                    onMouseEnter={handleUserMenuEnter}
                    onMouseLeave={handleUserMenuLeave}
                  >
                    <User className="h-4 w-4" />
                    <span>{user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-48"
                  onMouseEnter={handleUserMenuEnter}
                  onMouseLeave={handleUserMenuLeave}
                >
                  <DropdownMenuItem onClick={() => onViewChange('analysis')}>
                    <div className="w-4 h-4 bg-blue-600 rounded-sm flex items-center justify-center mr-2">
                      <span className="text-white text-xs font-bold">S</span>
                    </div>
                    <span className="text-blue-600 font-semibold">SPSSAI</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
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
                  <DropdownMenuItem onClick={() => onViewChange('data')}>
                    <Database className="h-4 w-4 mr-2" />
                    <span>数据管理</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    <span>设置</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => {
                    console.log('点击关于按钮');
                    onViewChange('about');
                  }}>
                    <Info className="h-4 w-4 mr-2" />
                    <span>关于</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>退出登录</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <DropdownMenu open={isGuestMenuOpen} onOpenChange={setIsGuestMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex items-center space-x-2"
                    onMouseEnter={handleGuestMenuEnter}
                    onMouseLeave={handleGuestMenuLeave}
                  >
                    <User className="h-4 w-4" />
                    <span>访客</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-48"
                  onMouseEnter={handleGuestMenuEnter}
                  onMouseLeave={handleGuestMenuLeave}
                >
                  <DropdownMenuItem onClick={() => onViewChange('about')}>
                    <Info className="h-4 w-4 mr-2" />
                    <span>关于</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onViewChange('auth')}>
                    <User className="h-4 w-4 mr-2" />
                    <span>登录</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onViewChange('auth')}>
                    <User className="h-4 w-4 mr-2" />
                    <span>注册</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
