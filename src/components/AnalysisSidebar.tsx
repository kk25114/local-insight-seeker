
import React, { useState, useMemo } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
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
  MoreHorizontal
} from 'lucide-react';

interface AnalysisSidebarProps {
  selectedAnalysis: string;
  onSelectAnalysis: (analysis: string) => void;
}

const analysisCategories = [
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
  }, [searchQuery]);

  return (
    <Sidebar className="border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1">
            <Search className="h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="搜索方法" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-sm bg-transparent border-none outline-none flex-1 placeholder-gray-400"
            />
          </div>
          <SidebarTrigger className="h-6 w-6" />
        </div>
      </div>
      
      <SidebarContent className="px-2">
        {filteredCategories.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            未找到匹配的分析方法
          </div>
        ) : (
          filteredCategories.map((category) => (
            <SidebarGroup key={category.label}>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-600 px-2 py-2">
                {category.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {category.items.map((item) => (
                    <SidebarMenuItem key={item.key}>
                      <SidebarMenuButton 
                        onClick={() => onSelectAnalysis(item.key)}
                        className={`w-full justify-start text-sm py-2 px-2 ${
                          selectedAnalysis === item.key 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <item.icon className="h-4 w-4 mr-2" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))
        )}
      </SidebarContent>
    </Sidebar>
  );
};
