import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { PieChart as PieIcon, BarChart2, BarChartHorizontal } from 'lucide-react';

type ChartType = 'bar' | 'horizontal-bar' | 'pie';

const chartTypes: { id: ChartType; name: string; icon: React.ElementType }[] = [
  { id: 'pie', name: '饼状图', icon: PieIcon },
  { id: 'bar', name: '柱形图', icon: BarChart2 },
  { id: 'horizontal-bar', name: '条形图', icon: BarChartHorizontal },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

interface ChartRendererProps {
  data: any[];
}

export const ChartRenderer: React.FC<ChartRendererProps> = ({ data }) => {
  const [chartType, setChartType] = useState<ChartType>('horizontal-bar');

  if (!data || data.length === 0) {
    return null;
  }

  const keys = Object.keys(data[0]);
  const categoryKey = keys[1]; // e.g., '选项'
  const valueKey = keys[2]; // e.g., '频数'

  const renderChart = () => {
    switch (chartType) {
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={data} dataKey={valueKey} nameKey={categoryKey} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={categoryKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={valueKey} fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'horizontal-bar':
      default:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey={categoryKey} width={80} />
              <Tooltip />
              <Legend />
              <Bar dataKey={valueKey} fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="mt-4 border-t pt-4">
      <div className="flex items-center justify-center space-x-2 mb-4">
        {chartTypes.map(({ id, name, icon: Icon }) => (
          <Button
            key={id}
            variant={chartType === id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType(id)}
            className="flex items-center space-x-1"
          >
            <Icon className="h-4 w-4" />
            <span>{name}</span>
          </Button>
        ))}
      </div>
      {renderChart()}
    </div>
  );
}; 