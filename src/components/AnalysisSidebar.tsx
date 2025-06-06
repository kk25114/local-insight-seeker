
import React, { useState, useMemo, useEffect } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  BarChart3,
  TrendingUp,
  PieChart,
  ScatterChart, 
  GitBranch,
  Calculator,
  Database,
  FileText,
  Search,
  MoreHorizontal,
  Menu
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AnalysisSidebarProps {
  selectedAnalysis: string;
  onSelectAnalysis: (analysis: string) => void;
}

interface Algorithm {
  id: string;
  name: string;
  category: string;
  description: string;
  prompt_template: string;
}

const defaultAnalysisCategories = [
  {
    label: "通用方法",
    items: [
      { title: "频数", icon: BarChart3, key: "frequency" },
      { title: "分类汇总", icon: PieChart, key: "crosstab" },
      { title: "描述", icon: FileText, key: "descriptives" },
      { title: "交叉(列联)", icon: GitBranch, key: "crosstab" },
      { title: "相关", icon: ScatterChart, key: "correlation" },
      { title: "线性回归", icon: TrendingUp, key: "regression" },
      { title: "方差", icon: Calculator, key: "anova" },
      { title: "独立性检验", icon: MoreHorizontal, key: "independence" }
    ]
  },
  {
    label: "问卷研究",
    items: [
      { title: "信度分析", icon: Database, key: "reliability" },
      { title: "因子分析", icon: GitBranch, key: "factor" }
    ]
  },
  {
    label: "可视化",
    items: [
      { title: "图表制作", icon: BarChart3, key: "charts" },
      { title: "数据可视化", icon: PieChart, key: "visualization" }
    ]
  },
  {
    label: "数据处理",
    items: [
      { title: "数据清洗", icon: Database, key: "cleaning" },
      { title: "变量转换", icon: Calculator, key: "transform" }
    ]
  },
  {
    label: "进阶方法",
    items: [
      { title: "机器学习", icon: TrendingUp, key: "ml" },
      { title: "时间序列", icon: TrendingUp, key: "timeseries" }
    ]
  },
  {
    label: "实验/医学研究",
    items: [
      { title: "T检验", icon: Calculator, key: "ttest" },
      { title: "生存分析", icon: TrendingUp, key: "survival" }
    ]
  },
  {
    label: "综合评价",
    items: [
      { title: "层次分析法", icon: GitBranch, key: "ahp" },
      { title: "主成分分析", icon: ScatterChart, key: "pca" }
    ]
  },
  {
    label: "计量经济研究",
    items: [
      { title: "面板数据", icon: Database, key: "panel" },
      { title: "VAR模型", icon: TrendingUp, key: "var" }
    ]
  }
];

export const AnalysisSidebar: React.FC<AnalysisSidebarProps> = ({ 
  selectedAnalysis, 
  onSelectAnalysis 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [customAlgorithms, setCustomAlgorithms] = useState<Algorithm[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dropdownValue, setDropdownValue] = useState('option1');

  // 加载自定义算法
  useEffect(() => {
    loadCustomAlgorithms();
  }, []);

  const loadCustomAlgorithms = async () => {
    try {
      const { data, error } = await supabase
        .from('analysis_algorithms')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('加载自定义算法失败:', error);
        return;
      }

      setCustomAlgorithms(data || []);
    } catch (error) {
      console.error('加载自定义算法失败:', error);
    }
  };

  // 合并默认分类和自定义算法
  const analysisCategories = useMemo(() => {
    const categories = [...defaultAnalysisCategories];
    
    // 按分类分组自定义算法
    const algorithmsByCategory = customAlgorithms.reduce((acc, algorithm) => {
      if (!acc[algorithm.category]) {
        acc[algorithm.category] = [];
      }
      acc[algorithm.category].push({
        title: algorithm.name,
        icon: Calculator, // 默认图标
        key: `custom_${algorithm.id}`
      });
      return acc;
    }, {} as Record<string, any[]>);

    // 将自定义算法添加到对应分类中
    Object.entries(algorithmsByCategory).forEach(([categoryName, algorithms]) => {
      const existingCategory = categories.find(cat => cat.label === categoryName);
      if (existingCategory) {
        existingCategory.items.push(...algorithms);
      } else {
        // 创建新的分类
        categories.push({
          label: categoryName,
          items: algorithms
        });
      }
    });

    return categories;
  }, [customAlgorithms]);

  // 过滤分析方法
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return analysisCategories;
    }

    const query = searchQuery.toLowerCase().trim();
    
    return analysisCategories.map(category => ({
      ...category,
      items: category.items.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.key.toLowerCase().includes(query)
      )
    })).filter(category => category.items.length > 0);
  }, [searchQuery, analysisCategories]);

  return (
    <div className={`relative border-r border-gray-200 bg-white transition-all duration-300 ${
      isCollapsed ? 'w-12' : 'w-64'
    }`}>
      {/* 简单的菜单按钮 - 左侧位置 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute left-3 top-4 z-10 h-6 w-6 rounded-sm p-0"
      >
        <Menu className="h-4 w-4" />
      </Button>

      {!isCollapsed && (
        <>
          <div className="p-4 pt-16 border-b border-gray-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <img src="/placeholder.svg" alt="Logo" className="h-6 w-6" />
                <span className="font-semibold">SPSSAI</span>
              </div>
              <Select value={dropdownValue} onValueChange={setDropdownValue}>
                <SelectTrigger className="w-28 h-8">
                  <SelectValue placeholder="选择" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="option1">选项1</SelectItem>
                  <SelectItem value="option2">选项2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索方法"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-sm bg-transparent border-none outline-none flex-1 placeholder-gray-400"
              />
            </div>
          </div>
          
          <div className="px-2 overflow-y-auto">
            {filteredCategories.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                未找到匹配的分析方法
              </div>
            ) : (
              <Accordion
                type="multiple"
                defaultValue={filteredCategories.map((c) => c.label)}
                className="w-full"
              >
                {filteredCategories.map((category) => (
                  <AccordionItem key={category.label} value={category.label}>
                    <AccordionTrigger className="text-xs font-semibold text-gray-600 px-2 py-2">
                      {category.label}
                    </AccordionTrigger>
                    <AccordionContent className="px-0">
                      <div className="space-y-1">
                        {category.items.map((item) => (
                          <button
                            key={item.key}
                            onClick={() => onSelectAnalysis(item.key)}
                            className={`w-full flex items-center justify-start text-sm py-2 px-2 rounded-md transition-colors ${
                              selectedAnalysis === item.key
                                ? 'bg-blue-100 text-blue-700'
                                : 'hover:bg-gray-100'
                            }`}
                          >
                            <item.icon className="h-4 w-4 mr-2" />
                            <span>{item.title}</span>
                          </button>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </>
      )}

      {isCollapsed && (
        <>
          <div className="p-2 pt-16 space-y-2">
            {analysisCategories.slice(0, 8).map((category) => (
              <div key={category.label} className="space-y-1">
                {category.items.slice(0, 1).map((item) => (
                  <Button
                    key={item.key}
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelectAnalysis(item.key)}
                    className={`w-8 h-8 p-0 ${
                      selectedAnalysis === item.key
                        ? 'bg-blue-100 text-blue-700'
                        : ''
                    }`}
                    title={item.title}
                  >
                    <item.icon className="h-4 w-4" />
                  </Button>
                ))}
              </div>
            ))}
          </div>
          <div className="absolute top-4 left-[calc(100%+0.5rem)]">
            <Select value={dropdownValue} onValueChange={setDropdownValue}>
              <SelectTrigger className="w-28 h-8">
                <SelectValue placeholder="选择" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">选项1</SelectItem>
                <SelectItem value="option2">选项2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}
    </div>
  );
};
