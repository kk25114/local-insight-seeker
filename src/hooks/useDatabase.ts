import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  DatabaseConfig, 
  SavedConnection, 
  ConnectionTestResult, 
  ConnectionStatus 
} from '@/types/database';
import { defaultDatabaseConfig } from '@/config/database';

export const useDatabase = () => {
  const [dbConfig, setDbConfig] = useState<DatabaseConfig>(defaultDatabaseConfig);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM your_table LIMIT 10;');
  const [sqlResults, setSqlResults] = useState<any[]>([]);
  const [savedConnections, setSavedConnections] = useState<SavedConnection[]>([]);
  const [connectionName, setConnectionName] = useState('');
  const [selectedConnection, setSelectedConnection] = useState<string>('');
  const [isTesting, setIsTesting] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isExecutingSQL, setIsExecutingSQL] = useState(false);
  
  const { toast } = useToast();

  // 加载保存的连接
  useEffect(() => {
    loadSavedConnections();
  }, []);

  const loadSavedConnections = () => {
    try {
      const saved = localStorage.getItem('savedConnections');
      if (saved) {
        setSavedConnections(JSON.parse(saved));
      }
    } catch (error) {
      console.error('加载保存的连接失败:', error);
    }
  };

  const saveConnection = () => {
    if (!connectionName.trim()) {
      toast({
        title: "请输入连接名称",
        description: "连接名称不能为空",
        variant: "destructive",
      });
      return;
    }

    const newConnection: SavedConnection = {
      id: Date.now().toString(),
      name: connectionName,
      config: { ...dbConfig },
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString()
    };

    const updatedConnections = [...savedConnections, newConnection];
    setSavedConnections(updatedConnections);
    localStorage.setItem('savedConnections', JSON.stringify(updatedConnections));
    setConnectionName('');
    
    toast({
      title: "连接已保存",
      description: `连接"${newConnection.name}"已成功保存`,
    });
  };

  const loadConnection = (connectionId: string) => {
    const connection = savedConnections.find(conn => conn.id === connectionId);
    if (connection) {
      setDbConfig(connection.config);
      setConnectionName(connection.name);
      setSelectedConnection(connectionId);
      
      // 更新最后使用时间
      const updatedConnections = savedConnections.map(conn => 
        conn.id === connectionId 
          ? { ...conn, lastUsed: new Date().toISOString() }
          : conn
      );
      setSavedConnections(updatedConnections);
      localStorage.setItem('savedConnections', JSON.stringify(updatedConnections));
      
      toast({
        title: "连接已加载",
        description: `已加载连接"${connection.name}"的配置`,
      });
    }
  };

  const deleteConnection = (connectionId: string) => {
    const connection = savedConnections.find(conn => conn.id === connectionId);
    if (connection) {
      const updatedConnections = savedConnections.filter(conn => conn.id !== connectionId);
      setSavedConnections(updatedConnections);
      localStorage.setItem('savedConnections', JSON.stringify(updatedConnections));
      
      if (selectedConnection === connectionId) {
        setSelectedConnection('');
      }
      
      toast({
        title: "连接已删除",
        description: `连接"${connection.name}"已成功删除`,
      });
    }
  };

  const testConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      // 模拟连接测试（实际应用中需要调用后端API）
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 模拟测试结果
      const success = Math.random() > 0.3; // 70%成功率
      
      setTestResult({
        success,
        message: success 
          ? `成功连接到 ${dbConfig.type.toUpperCase()} 数据库 ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`
          : `连接失败：无法连接到 ${dbConfig.host}:${dbConfig.port}，请检查网络和配置`
      });
      
      toast({
        title: success ? "连接测试成功" : "连接测试失败",
        description: success ? "数据库连接正常" : "请检查连接配置",
        variant: success ? "default" : "destructive",
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: `连接错误：${error instanceof Error ? error.message : '未知错误'}`
      });
      
      toast({
        title: "连接测试失败",
        description: "发生未知错误",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const connectToDatabase = async () => {
    setIsConnecting(true);
    
    try {
      // 模拟建立连接
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setConnectionStatus('connected');
      toast({
        title: "数据库连接成功",
        description: "已成功连接到数据库，可以执行SQL查询",
      });
    } catch (error) {
      setConnectionStatus('error');
      toast({
        title: "连接失败",
        description: "无法建立数据库连接",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const executeSQL = async () => {
    setIsExecutingSQL(true);
    
    try {
      // 模拟SQL执行
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 生成模拟数据
      const mockData = Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        name: `用户${i + 1}`,
        email: `user${i + 1}@example.com`,
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      }));
      
      setSqlResults(mockData);
      
      toast({
        title: "SQL执行成功",
        description: `查询返回 ${mockData.length} 条记录`,
      });
    } catch (error) {
      toast({
        title: "SQL执行失败",
        description: "查询执行出错",
        variant: "destructive",
      });
    } finally {
      setIsExecutingSQL(false);
    }
  };

  const useSqlTemplate = (template: { name: string; sql: string }) => {
    setSqlQuery(template.sql);
    toast({
      title: "模板已应用",
      description: `已应用"${template.name}"模板`,
    });
  };

  return {
    // 状态
    dbConfig,
    setDbConfig,
    connectionStatus,
    testResult,
    sqlQuery,
    setSqlQuery,
    sqlResults,
    savedConnections,
    connectionName,
    setConnectionName,
    selectedConnection,
    isTesting,
    isConnecting,
    isExecutingSQL,
    
    // 方法
    saveConnection,
    loadConnection,
    deleteConnection,
    testConnection,
    connectToDatabase,
    executeSQL,
    useSqlTemplate,
    loadSavedConnections
  };
}; 