
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, PlayCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AnalysisTask {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
  progress?: number;
  result?: string;
  error?: string;
}

interface AnalysisQueueProps {
  onTaskComplete?: (task: AnalysisTask) => void;
}

export const AnalysisQueue: React.FC<AnalysisQueueProps> = ({ onTaskComplete }) => {
  const [tasks, setTasks] = useState<AnalysisTask[]>([]);
  const { toast } = useToast();

  const addTask = (name: string) => {
    const newTask: AnalysisTask = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      status: 'pending',
      createdAt: new Date(),
    };
    setTasks(prev => [newTask, ...prev]);
    return newTask.id;
  };

  const updateTask = (id: string, updates: Partial<AnalysisTask>) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === id ? { ...task, ...updates } : task
      )
    );
  };

  const removeTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const getStatusIcon = (status: AnalysisTask['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'running':
        return <PlayCircle className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: AnalysisTask['status']) => {
    const variants = {
      pending: 'secondary',
      running: 'default',
      completed: 'secondary',
      failed: 'destructive'
    } as const;

    const labels = {
      pending: '等待中',
      running: '运行中',
      completed: '已完成',
      failed: '失败'
    };

    return (
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  // 暴露添加任务的方法给父组件
  React.useImperativeHandle(React.forwardRef(() => null), () => ({
    addTask,
    updateTask,
  }), []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <PlayCircle className="h-5 w-5" />
          <span>分析队列</span>
          <Badge variant="outline">{tasks.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            暂无分析任务
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  {getStatusIcon(task.status)}
                  <div>
                    <div className="font-medium">{task.name}</div>
                    <div className="text-sm text-gray-500">
                      {task.createdAt.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(task.status)}
                  {task.status === 'running' && task.progress && (
                    <div className="text-sm text-blue-600">
                      {task.progress}%
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTask(task.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// 创建一个 Hook 来使用队列
export const useAnalysisQueue = () => {
  const [queueRef, setQueueRef] = useState<{
    addTask: (name: string) => string;
    updateTask: (id: string, updates: Partial<AnalysisTask>) => void;
  } | null>(null);

  const addTask = (name: string) => {
    if (queueRef) {
      return queueRef.addTask(name);
    }
    return '';
  };

  const updateTask = (id: string, updates: Partial<AnalysisTask>) => {
    if (queueRef) {
      queueRef.updateTask(id, updates);
    }
  };

  return {
    setQueueRef,
    addTask,
    updateTask,
  };
};
