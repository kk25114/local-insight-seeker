import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Play, 
  Database, 
  CheckCircle, 
  XCircle, 
  Save, 
  Trash2 
} from 'lucide-react';
import { useDatabase } from '@/hooks/useDatabase';
import { databaseTypes, sqlTemplates } from '@/config/database';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface DatabaseConnectionProps {
  user: SupabaseUser | null;
  onDataUpdate: (data: any[]) => void;
}

export const DatabaseConnection: React.FC<DatabaseConnectionProps> = ({ 
  user, 
  onDataUpdate 
}) => {
  const {
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
    saveConnection,
    loadConnection,
    deleteConnection,
    testConnection,
    connectToDatabase,
    executeSQL,
    useSqlTemplate
  } = useDatabase();

  // 当数据库类型改变时，更新默认端口
  useEffect(() => {
    const dbType = databaseTypes.find(db => db.value === dbConfig.type);
    if (dbType && !dbConfig.port) {
      setDbConfig(prev => ({ ...prev, port: dbType.defaultPort }));
    }
  }, [dbConfig.type, setDbConfig]);

  // 当SQL查询结果更新时，通知父组件
  useEffect(() => {
    if (sqlResults.length > 0) {
      onDataUpdate(sqlResults);
    }
  }, [sqlResults, onDataUpdate]);

  return (
    <div className="flex h-[600px] border rounded-lg overflow-hidden bg-white">
      {/* 左侧：连接列表 26% */}
      <div className="w-1/4 border-r bg-gray-50 flex flex-col">
        {/* 连接列表头部 */}
        <div className="p-4 border-b bg-white">
          <h3 className="font-medium text-gray-900 text-sm">连接列表</h3>
        </div>
        
        {/* 连接列表 */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-2">
            {savedConnections.length > 0 ? (
              savedConnections
                .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
                .map((conn) => (
                  <div 
                    key={conn.id}
                    className={`p-3 rounded-md cursor-pointer transition-all text-sm ${
                      selectedConnection === conn.id 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white hover:bg-gray-100 border border-gray-200'
                    }`}
                    onClick={() => loadConnection(conn.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          connectionStatus === 'connected' && selectedConnection === conn.id
                            ? 'bg-green-400' 
                            : 'bg-gray-400'
                        }`} />
                        <span className="font-medium truncate">{conn.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConnection(conn.id);
                        }}
                        className={`h-6 w-6 p-0 ${
                          selectedConnection === conn.id 
                            ? 'text-white hover:text-red-200' 
                            : 'text-gray-400 hover:text-red-600'
                        }`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className={`text-xs mt-1 truncate ${
                      selectedConnection === conn.id ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {conn.config.type.toUpperCase()}
                    </div>
                    <div className={`text-xs truncate ${
                      selectedConnection === conn.id ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {conn.config.host}:{conn.config.port}
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Database className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">暂无保存的连接</p>
              </div>
            )}
          </div>
        </div>
        
        {/* 底部操作按钮 */}
        <div className="p-4 border-t bg-white">
          <div className="flex space-x-1 text-xs">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 h-8 text-xs"
              onClick={connectToDatabase}
              disabled={!user || isConnecting || !testResult?.success}
            >
              连接
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 h-8 text-xs"
              disabled={!selectedConnection}
            >
              修改
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 h-8 text-xs"
              onClick={() => selectedConnection && deleteConnection(selectedConnection)}
              disabled={!selectedConnection}
            >
              删除
            </Button>
          </div>
        </div>
      </div>

      {/* 右侧：连接配置 74% */}
      <div className="flex-1 flex flex-col">
        {/* 配置头部 */}
        <div className="p-4 border-b bg-white">
          <h3 className="font-medium text-gray-900 text-sm">连接参数</h3>
        </div>
        
        {/* 配置表单 */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <Label htmlFor="db-type" className="text-sm font-medium text-gray-700">类型</Label>
              <Select 
                value={dbConfig.type} 
                onValueChange={(value) => setDbConfig(prev => ({...prev, type: value}))}
                disabled={!user}
              >
                <SelectTrigger className="h-9 mt-1">
                  <SelectValue placeholder="选择类型" />
                </SelectTrigger>
                <SelectContent>
                  {databaseTypes.map((db) => (
                    <SelectItem key={db.value} value={db.value}>
                      {db.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="connection-name" className="text-sm font-medium text-gray-700">名称</Label>
              <Input
                id="connection-name"
                placeholder="输入连接名称"
                value={connectionName}
                onChange={(e) => setConnectionName(e.target.value)}
                className="h-9 mt-1"
                disabled={!user}
              />
            </div>
            
            <div>
              <Label htmlFor="db-host" className="text-sm font-medium text-gray-700">主机</Label>
              <Input
                id="db-host"
                placeholder="127.0.0.1"
                value={dbConfig.host}
                onChange={(e) => setDbConfig(prev => ({...prev, host: e.target.value}))}
                className="h-9 mt-1"
                disabled={!user}
              />
            </div>
            
            <div>
              <Label htmlFor="db-port" className="text-sm font-medium text-gray-700">端口</Label>
              <Input
                id="db-port"
                placeholder={databaseTypes.find(db => db.value === dbConfig.type)?.defaultPort || '3306'}
                value={dbConfig.port}
                onChange={(e) => setDbConfig(prev => ({...prev, port: e.target.value}))}
                className="h-9 mt-1"
                disabled={!user}
              />
            </div>
            
            <div>
              <Label htmlFor="db-username" className="text-sm font-medium text-gray-700">用户名</Label>
              <Input
                id="db-username"
                placeholder="root"
                value={dbConfig.username}
                onChange={(e) => setDbConfig(prev => ({...prev, username: e.target.value}))}
                className="h-9 mt-1"
                disabled={!user}
              />
            </div>
            
            <div>
              <Label htmlFor="db-password" className="text-sm font-medium text-gray-700">密码</Label>
              <Input
                id="db-password"
                type="password"
                placeholder="••••••••"
                value={dbConfig.password}
                onChange={(e) => setDbConfig(prev => ({...prev, password: e.target.value}))}
                className="h-9 mt-1"
                disabled={!user}
              />
            </div>
            
            <div>
              <Label htmlFor="db-database" className="text-sm font-medium text-gray-700">数据库</Label>
              <Input
                id="db-database"
                placeholder="database_name"
                value={dbConfig.database}
                onChange={(e) => setDbConfig(prev => ({...prev, database: e.target.value}))}
                className="h-9 mt-1"
                disabled={!user}
              />
            </div>
            
            {/* Oracle 特殊配置 */}
            {dbConfig.type === 'oracle' && (
              <div>
                <Label htmlFor="db-servicename" className="text-sm font-medium text-gray-700">Service</Label>
                <Input
                  id="db-servicename"
                  placeholder="ORCL"
                  value={dbConfig.serviceName}
                  onChange={(e) => setDbConfig(prev => ({...prev, serviceName: e.target.value}))}
                  className="h-9 mt-1"
                  disabled={!user}
                />
              </div>
            )}
          </div>

          {/* 测试连接和保存配置按钮 */}
          <div className="mb-6 flex space-x-3 pt-4 border-t">
            <Button
              onClick={testConnection}
              disabled={!user || isTesting || !dbConfig.host || !dbConfig.database}
              variant="outline"
              className="flex-1"
            >
              {isTesting ? '测试连接中...' : '测试连接'}
            </Button>
            <Button 
              onClick={saveConnection} 
              disabled={!user || !connectionName.trim() || !dbConfig.host}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              保存配置
            </Button>
          </div>
          
          {/* 连接测试结果 */}
          {testResult && (
            <div className={`p-3 rounded-md text-sm mb-4 ${
              testResult.success 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              <div className="flex items-center space-x-2">
                {testResult.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <span className="font-medium">
                  {testResult.success ? '连接测试成功' : '连接测试失败'}
                </span>
              </div>
              <p className="text-xs mt-1 opacity-90">
                {testResult.message}
              </p>
            </div>
          )}
          
          {/* SQL编辑器 - 仅在测试成功或已连接时显示 */}
          {(connectionStatus === 'connected' || testResult?.success) && (
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700">SQL查询编辑器</Label>
                <Select onValueChange={(value) => useSqlTemplate(sqlTemplates[parseInt(value)])}>
                  <SelectTrigger className="w-40 h-8">
                    <SelectValue placeholder="选择模板" />
                  </SelectTrigger>
                  <SelectContent>
                    {sqlTemplates.map((template, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Textarea
                placeholder="输入要执行的SQL语句..."
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                rows={4}
                className="font-mono text-sm resize-none"
                disabled={!user}
              />
              <Button
                onClick={executeSQL}
                disabled={!user || isExecutingSQL || !sqlQuery.trim()}
                className="w-full"
              >
                <Play className="h-4 w-4 mr-2" />
                {isExecutingSQL ? '执行中...' : '执行SQL'}
              </Button>
              
              {sqlResults.length > 0 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center space-x-2">
                    <Database className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">查询结果</span>
                    <Badge variant="secondary" className="text-xs">{sqlResults.length} 条记录</Badge>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">结果已显示在下方预览区域</p>
                </div>
              )}
            </div>
          )}
          </div>
        </div>
        

      </div>
    </div>
  );
}; 