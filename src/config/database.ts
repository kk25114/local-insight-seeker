import { DatabaseType, SqlTemplate } from '@/types/database';

export const databaseTypes: DatabaseType[] = [
  { value: 'mysql8', label: 'MySQL 8.0+', defaultPort: '3306' },
  { value: 'mysql57', label: 'MySQL 5.7', defaultPort: '3306' },
  { value: 'oracle', label: 'Oracle Database', defaultPort: '1521' },
  { value: 'hive', label: 'Apache Hive', defaultPort: '10000' },
  { value: 'postgresql', label: 'PostgreSQL', defaultPort: '5432' },
  { value: 'sqlserver', label: 'SQL Server', defaultPort: '1433' },
  { value: 'clickhouse', label: 'ClickHouse', defaultPort: '9000' }
];

export const sqlTemplates: SqlTemplate[] = [
  { name: '查看数据库', sql: 'SHOW DATABASES;' },
  { name: '查看表', sql: 'SHOW TABLES;' },
  { name: '表结构', sql: 'DESCRIBE table_name;' },
  { name: '用户数据查询', sql: 'SELECT * FROM users LIMIT 10;' },
  { name: '统计查询', sql: 'SELECT COUNT(*) as total, AVG(salary) as avg_salary FROM users;' },
  { name: '分组统计', sql: 'SELECT department, COUNT(*) as count, AVG(salary) as avg_salary FROM users GROUP BY department;' }
];

export const defaultDatabaseConfig = {
  type: 'mysql8',
  host: '',
  port: '',
  database: '',
  username: '',
  password: '',
  schema: '',
  serviceName: '',
  warehouse: '',
  authMechanism: 'PLAIN'
}; 