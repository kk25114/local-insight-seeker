import React, { useState, useMemo, useEffect } from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  Menu,
  Info,
  ChevronLeft,
  ChevronRight
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
import { Checkbox } from "@/components/ui/checkbox";
import { analysisConfig } from '@/config/analysis';

interface AnalysisSidebarProps {
  selectedAnalyses: string[];
  onSelectAnalysis: (analysisKey: string) => void;
  onLogoClick?: () => void;
}

interface Algorithm {
  id: string;
  name: string;
  category: string;
  description: string;
  prompt_template: string;
}

interface AnalysisDetail {
  title: string;
  description: string;
  example: string;
}

const defaultAnalysisCategories = [
  {
    label: "基础统计指标",
    items: [
      { title: "平均数", icon: Calculator, key: "mean" },
      { title: "方差", icon: Calculator, key: "variance" },
      { title: "标准差", icon: Calculator, key: "std_dev" },
      { title: "中位数", icon: Calculator, key: "median" },
      { title: "众数", icon: Calculator, key: "mode" },
      { title: "最大值", icon: Calculator, key: "max" },
      { title: "最小值", icon: Calculator, key: "min" },
      { title: "极差", icon: Calculator, key: "range" },
      { title: "四分位数", icon: Calculator, key: "quartiles" },
      { title: "偏度", icon: Calculator, key: "skewness" },
      { title: "峰度", icon: Calculator, key: "kurtosis" },
    ]
  },
  {
    label: "通用方法",
    items: [
      { title: "频数", icon: BarChart3, key: "frequency" },
      { title: "分类汇总", icon: PieChart, key: "crosstab" },
      { title: "描述", icon: FileText, key: "descriptives" },
      { title: "交叉(列联)", icon: GitBranch, key: "crosstab" },
      { title: "相关", icon: ScatterChart, key: "correlation" },
      { title: "线性回归", icon: TrendingUp, key: "regression" },
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
  selectedAnalyses, 
  onSelectAnalysis,
  onLogoClick
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [customAlgorithms, setCustomAlgorithms] = useState<Algorithm[]>([]);
  const [dropdownValue, setDropdownValue] = useState('option1');
  const [isCollapsed, setIsCollapsed] = useState(false);

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

      // 移除不需要的分析方法
      const toRemove = ["描述性统计", "相关分析", "线性回归", "频数分析", "方差分析"];
      const filteredData = (data || []).filter(algo => !toRemove.includes(algo.name));
      
      setCustomAlgorithms(filteredData);
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
    <div className={`border-r border-gray-200 bg-white transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* 顶部折叠区域 */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 p-0 hover:bg-gray-200 rounded-full"
      >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
      </Button>
        
        {!isCollapsed && (
          <div 
            className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onLogoClick?.()}
          >
            <div className="w-4 h-4 bg-blue-600 rounded-sm flex items-center justify-center">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <span className="text-blue-600 font-semibold">SPSSAI</span>
          </div>
        )}
      </div>

      {!isCollapsed && (
        <>
          {/* 搜索区域 */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索方法"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-300 focus:bg-white transition-colors"
              />
            </div>
          </div>
          
          {/* 分析方法列表 */}
          <div className="px-4 overflow-y-auto max-h-[calc(100vh-180px)]">
            {filteredCategories.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>未找到匹配的分析方法</p>
              </div>
            ) : (
              <Accordion type="multiple" defaultValue={filteredCategories.map(c => c.label)} className="w-full">
                {filteredCategories.map((category) => (
                  <AccordionItem value={category.label} key={category.label} className="border-b-0">
                    <AccordionTrigger className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-md">
                      {category.label}
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-2">
                      <div className="space-y-1 px-2">
                        {category.items.map((item) => (
                          <div
                            key={item.key}
                            onClick={() => onSelectAnalysis(item.key)}
                            className={`group flex items-center justify-between p-2 text-sm rounded-md cursor-pointer transition-colors ${
                              selectedAnalyses.includes(item.key)
                                ? 'bg-blue-100 text-blue-700'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <Checkbox
                                id={`checkbox-${item.key}`}
                                checked={selectedAnalyses.includes(item.key)}
                                className="h-4 w-4 rounded"
                              />
                              <label
                                htmlFor={`checkbox-${item.key}`}
                                className="flex items-center space-x-2 cursor-pointer"
                              >
                                <item.icon className="h-4 w-4" />
                                <span>{item.title}</span>
                              </label>
                            </div>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Info 
                                  className="h-4 w-4 text-gray-400 group-hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </PopoverTrigger>
                              <PopoverContent className="w-96 p-4 shadow-lg border-gray-200" side="right" align="start">
                                {(() => {
                                  const analysisInfo = analysisConfig[item.key as keyof typeof analysisConfig];
                                  if (!analysisInfo) return null;

                                  const descriptionSections = analysisInfo.description.split('\n\n');
                                  const exampleSections = analysisInfo.example.split('\n\n');
                                  const findSection = (sections: string[], title: string) => 
                                    sections.find(p => p.startsWith(title))?.replace(title, '').trim();

                                  const definition = findSection(descriptionSections, '📖 定义');
                                  const formula = findSection(descriptionSections, '📐 计算公式');
                                  const exampleData = findSection(exampleSections, '📊 考试数据举例');
                                  const scenario = findSection(exampleSections, '💡 应用场景');

                                  return (
                                    <div className="max-h-[500px] overflow-y-auto space-y-4">
                                      <div className="border-b border-gray-200 pb-2 mb-2">
                                        <h3 className="font-bold text-base text-gray-800">{analysisInfo.title}</h3>
                                      </div>
                                      
                                      {definition && (
                                        <div>
                                          <h4 className="font-semibold text-sm text-gray-700 mb-2">📖 定义</h4>
                                          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{definition}</p>
                                        </div>
                                      )}
                                      
                                      {formula && (
                                        <div>
                                          <h4 className="font-semibold text-sm text-gray-700 mb-2">📐 计算公式</h4>
                                          <pre className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded border font-mono whitespace-pre-line">{formula}</pre>
                                        </div>
                                      )}

                                      {exampleData && (
                                        <div>
                                          <h4 className="font-semibold text-sm text-gray-700 mb-2">📊 考试数据举例</h4>
                                          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{exampleData}</p>
                                        </div>
                                      )}

                                      {scenario && (
                                        <div>
                                          <h4 className="font-semibold text-sm text-gray-700 mb-2">💡 应用场景</h4>
                                          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{scenario}</p>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })()}
                              </PopoverContent>
                            </Popover>
                          </div>
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

      {/* 折叠状态下的简化视图 */}
      {isCollapsed && (
        <div className="py-3 space-y-2">
          {analysisCategories.slice(0, 8).map((category, categoryIndex) => (
            <div key={category.label} className="px-2">
                {category.items.slice(0, 1).map((item) => (
                  <Button
                    key={item.key}
                    variant="ghost"
                    size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('点击折叠状态分析项:', item.key, item.title);
                    onSelectAnalysis(item.key);
                  }}
                  className={`w-full h-10 p-0 rounded-lg transition-colors ${
                      selectedAnalyses.includes(item.key)
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'hover:bg-blue-50 hover:text-blue-700'
                    }`}
                  title={`${category.label} - ${item.title}`}
                  >
                    <item.icon className="h-4 w-4" />
                  </Button>
                ))}
              </div>
            ))}
          </div>
      )}
    </div>
  );
};
