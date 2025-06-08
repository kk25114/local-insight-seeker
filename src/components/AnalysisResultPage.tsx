import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, FileText, FileType, Image, HelpCircle, Share2, Copy, ZoomIn } from 'lucide-react';
import { ChartRenderer } from './ChartRenderer';

interface AnalysisResult {
  type: 'metric' | 'table' | 'summary_table';
  title: string;
  chartable?: boolean;
  value?: string | number;
  description?: string;
  data?: any[];
}

interface AnalysisResultPageProps {
  results: AnalysisResult[];
  onBack: () => void;
}

const handleExport = async (format: 'excel' | 'pdf' | 'word', results: AnalysisResult[]) => {
  // 我们将导出第一个有数据表格的结果
  const resultToExport = results.find(r => (r.type === 'table' || r.type === 'summary_table') && r.data && r.data.length > 0);

  if (!resultToExport) {
    alert('没有可导出的数据。');
    return;
  }

  try {
    const response = await fetch(`http://localhost:3001/export/${format}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: resultToExport.data,
        title: resultToExport.title,
      }),
    });

    if (!response.ok) {
      throw new Error(`导出失败: ${response.statusText}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    const extension = format === 'excel' ? 'xlsx' : format;
    a.download = `${resultToExport.title}.${extension}`;
    
    document.body.appendChild(a);
a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error('导出错误:', error);
    alert(`导出文件时出错: ${error instanceof Error ? error.message : '未知错误'}`);
  }
};

const renderGroupedTable = (result: AnalysisResult) => {
  if (!result.data || result.data.length === 0) {
    return <p>没有可供展示的数据。</p>;
  }

  const headers = Object.keys(result.data[0]);
  const groupKey = headers[0];
  let lastGroupValue: any = null;

  return (
    <Card className="col-span-full">
      <CardHeader className="relative py-3 border-b">
        <CardTitle className="text-center text-base font-semibold">
          {result.title}
        </CardTitle>
        <Button variant="ghost" size="icon" className="absolute top-1.5 right-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800">
          <Copy className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((header) => (
                <TableHead key={header} className="text-left font-medium text-gray-700">
                  <div className="flex items-center space-x-1 px-4 py-2">
                    <span>{header}</span>
                    <HelpCircle className="h-4 w-4 text-gray-400" />
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.data.map((row, rowIndex) => {
              const isNewGroup = lastGroupValue !== row[groupKey];
              if (isNewGroup) {
                lastGroupValue = row[groupKey];
              }
              
              return (
                <TableRow key={rowIndex} className="hover:bg-gray-50">
                  {headers.map((header, colIndex) => {
                    if (colIndex === 0) {
                      if (isNewGroup) {
                        const groupSize = result.data!.filter(r => r[groupKey] === row[groupKey]).length;
                        return (
                          <TableCell key={header} rowSpan={groupSize} className="text-left align-middle border-r px-4 font-medium">
                            {row[groupKey]}
                          </TableCell>
                        );
                      }
                      return null;
                    }
                    return (
                      <TableCell key={header} className="text-center px-4">
                        {String(row[header])}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {result.chartable && <ChartRenderer data={result.data} />}
      </CardContent>
    </Card>
  );
};

const renderSummaryTable = (result: AnalysisResult, index: number) => {
  if (!result.data || result.data.length === 0) return null;
  const headers = Object.keys(result.data[0]);

  return (
    <Card key={index} className="col-span-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold">{result.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-b-0">
              {headers.map((header) => (
                <TableHead key={header} className="text-gray-500 font-normal text-sm text-left px-6 py-3">
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.data.map((row, rowIndex) => (
              <TableRow key={rowIndex} className="border-t">
                {headers.map((header, colIndex) => (
                  <TableCell key={header} className={`py-4 px-6 ${colIndex === 0 ? 'font-bold text-left' : 'text-center'}`}>
                    {String(row[header])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {result.chartable && result.data && <ChartRenderer data={result.data} />}
      </CardContent>
    </Card>
  );
}

export const AnalysisResultPage: React.FC<AnalysisResultPageProps> = ({ results, onBack }) => {
  if (!results || results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <CardTitle>没有分析结果</CardTitle>
        <p className="text-gray-500 mt-2">无法显示结果，请返回重试。</p>
        <Button onClick={onBack} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> 返回
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <header className="flex-shrink-0 bg-white p-2 border-b flex justify-between items-center">
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-gray-700 hover:bg-gray-100">
            <ArrowLeft className="mr-1 h-4 w-4" /> 返回
          </Button>
          <div className="h-5 border-l border-gray-200 mx-1"></div>
          <Button variant="ghost" size="sm" className="text-gray-700 hover:bg-gray-100" onClick={() => handleExport('excel', results)}><FileType className="mr-1 h-4 w-4" /> 导出EXCEL表格</Button>
          <Button variant="ghost" size="sm" className="text-gray-700 hover:bg-gray-100" onClick={() => handleExport('pdf', results)}><FileText className="mr-1 h-4 w-4" /> 导出PDF结果</Button>
          <Button variant="ghost" size="sm" className="text-gray-700 hover:bg-gray-100" onClick={() => handleExport('word', results)}><FileText className="mr-1 h-4 w-4" /> 导出Word结果</Button>
          <Button variant="ghost" size="sm" className="text-gray-700 hover:bg-gray-100"><Image className="mr-1 h-4 w-4" /> 导出所有图形</Button>
          <Button variant="ghost" size="icon" className="text-gray-700 hover:bg-gray-100 w-6 h-6"><ZoomIn className="h-4 w-4" /></Button>
        </div>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" className="text-gray-700 hover:bg-gray-100"><Image className="mr-1 h-4 w-4" /> 分享图片</Button>
          <Button variant="ghost" size="sm" className="text-gray-700 hover:bg-gray-100"><Share2 className="mr-1 h-4 w-4" /> 分享结果</Button>
          <Button variant="ghost" size="icon" className="text-gray-700 hover:bg-gray-100 w-6 h-6"><Copy className="h-4 w-4" /></Button>
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {results.map((result, index) => {
          if (result.type === 'table') {
            return renderGroupedTable(result);
          }
          
          if (result.type === 'summary_table') {
            return renderSummaryTable(result, index);
          }
          
          if (result.type === 'metric') {
            return (
              <Card key={index} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-800">{result.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-center items-center">
                  <p className="text-4xl font-bold text-blue-600">{result.value}</p>
                  <p className="text-sm text-gray-500 mt-2">{result.description}</p>
                </CardContent>
              </Card>
            );
          }
          
          return null;
        })}
      </main>
    </div>
  );
}; 