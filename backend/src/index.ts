import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config';
import { initDatabase } from './database/schema';
import routes from './routes';

const app = express();

// 初始化数据库
initDatabase();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件
app.use('/uploads', express.static(path.resolve(config.uploadDir)));

// API 路由
app.use('/api', routes);

// 健康检查
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'growbonus-backend' });
});

// 404
app.use((_req, res) => {
  res.status(404).json({ success: false, message: '接口不存在' });
});

// 错误处理
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, message: err.message || '服务器内部错误' });
});

app.listen(config.port, () => {
  console.log(`🚀 GrowBonus Backend running on port ${config.port}`);
});

export default app;
