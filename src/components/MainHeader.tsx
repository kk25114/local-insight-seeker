
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Play, FileText, Database, Settings, User, Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MainHeaderProps {
  onDataUpload: (data: any[]) => void;
}

export const MainHeader: React.FC<MainHeaderProps> = ({ onDataUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          // 这里可以处理CSV、JSON等格式的数据
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

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-blue-600">SPSSAI</h1>
          <span className="text-sm text-gray-500">统计科学 — 点就好</span>
          <span className="text-sm text-blue-600 cursor-pointer hover:underline">国际站</span>
        </div>
        
        <div className="flex items-center space-x-4">
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
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
          >
            <Play className="h-4 w-4" />
            <span>开始分析</span>
          </Button>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Bell className="h-4 w-4 cursor-pointer hover:text-blue-600" />
            <Settings className="h-4 w-4 cursor-pointer hover:text-blue-600" />
            <span className="cursor-pointer hover:text-blue-600">客服中心</span>
            <span className="cursor-pointer hover:text-blue-600">我的数据</span>
            <span className="cursor-pointer hover:text-blue-600">查看数据</span>
            <User className="h-4 w-4 cursor-pointer hover:text-blue-600" />
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
