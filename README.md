# 分布式日志聚合与智能异常检测平台

基于Vue 3 + FastAPI的企业级日志分析平台，正则/Grok解析、滑动窗口聚合、3-sigma+IQR双算法异常检测、全文检索。

## 目标用户
SRE工程师、DevOps团队、系统运维人员

## 本地启动

后端地址统一由 `frontend/.env` 配置，开发服务和构建产物都从同一份文件读取。默认配置为：

```env
VITE_API_BASE_URL=http://localhost:8000
```

如果后端改用其他端口（例如 8001），只需把上面的地址改成实际地址。

```bash
# 后端（端口需与 frontend/.env 的 VITE_API_BASE_URL 保持一致）
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# 前端
cd frontend
npm install
npm run dev
```

生产构建同样读取当前的 `.env` 或构建时注入的 `VITE_API_BASE_URL`：

```bash
cd frontend
npm run build
```

## 技术栈
- 前端: Vue 3 + TypeScript + Vite + Pinia + Element Plus + ECharts
- 后端: Python FastAPI + NumPy + SQLite + WebSocket

## 核心功能
1. 多源日志流接入：支持Apache/NGINX/应用JSON/自定义格式四种日志类型模拟
2. 正则/Grok日志解析引擎：自动提取timestamp/level/source/message字段
3. 滑动时间窗口聚合统计：1分钟/5分钟/15分钟三级聚合粒度
4. 3-sigma + IQR双算法异常检测：分别基于正态分布和四分位距的异常分数计算
5. 倒排索引全文搜索：TF-IDF词频+布尔AND/OR查询
6. 告警规则管理：支持阈值告警+异常分数告警+关键词命中告警三级
7. ECharts日志量趋势+异常分布热力图+告警时间线
