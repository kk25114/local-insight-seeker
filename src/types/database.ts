export interface DatabaseConfig {
  id?: string;
  name?: string;
  type: string;
  host: string;
  port: string;
  database: string;
  username: string;
  password: string;
  schema?: string;
  serviceName?: string; // For Oracle
  warehouse?: string; // For Hive
  authMechanism?: string; // For Hive
  isDefault?: boolean;
  lastUsed?: string;
}

export interface SavedConnection {
  id: string;
  name: string;
  config: DatabaseConfig;
  createdAt: string;
  lastUsed: string;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
}

export interface DatabaseType {
  value: string;
  label: string;
  defaultPort: string;
}

export interface SqlTemplate {
  name: string;
  sql: string;
}

export type ConnectionStatus = 'idle' | 'connected' | 'error'; 