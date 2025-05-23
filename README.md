# 🚀 Cosmos Demo

一个基于 Cosmos SDK 的区块链应用演示平台，展示现代化的区块链交互界面。

## 📋 项目概述

Cosmos Demo 是一个全栈区块链应用，包含：
- **前端界面**：基于 React + TypeScript 的现代化 Web 应用
- **区块链后端**：基于 Cosmos SDK 的区块链节点（开发中）

## ✨ 功能特性

### 🎨 前端功能
- **响应式设计**：支持桌面端和移动端
- **现代化界面**：使用渐变色彩和毛玻璃效果
- **多页面导航**：
  - 📊 控制台：显示区块链统计信息
  - 💰 钱包：钱包地址和余额管理
  - 📝 交易记录：交易历史查看
  - ⛓️ 区块信息：区块链数据展示

### 🔧 技术栈
- **前端**：React 18 + TypeScript + CSS3
- **后端**：Go + Cosmos SDK（开发中）
- **构建工具**：Create React App + npm

## 🚀 快速开始

### 环境要求
- Node.js 16+ 
- npm 或 yarn
- Go 1.19+（用于区块链开发）

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd cosmos-demo
```

2. **安装依赖**
```bash
npm install
```

3. **启动前端应用**
```bash
npm run dev-frontend-only
```

4. **访问应用**
打开浏览器访问：http://localhost:3000

## 📝 可用命令

### 前端开发
```bash
# 启动前端开发服务器
npm run dev-frontend-only

# 构建前端应用
npm run build-frontend

# 运行前端测试
npm run test-frontend

# 检查前端应用健康状态
npm run health-frontend
```

### 全栈开发（开发中）
```bash
# 启动完整应用（前端 + 区块链）
npm run dev

# 构建完整应用
npm run build

# 运行所有测试
npm test

# 停止所有服务
npm run stop
```

## 🏗️ 项目结构

```
cosmos-demo/
├── frontend/                 # 前端应用
│   ├── public/              # 静态资源
│   │   ├── index.html       # HTML 模板
│   │   ├── manifest.json    # PWA 配置
│   │   └── favicon.ico      # 网站图标
│   ├── src/                 # 源代码
│   │   ├── App.tsx          # 主应用组件
│   │   ├── App.css          # 样式文件
│   │   ├── index.tsx        # 应用入口
│   │   └── reportWebVitals.ts
│   └── package.json         # 前端依赖
├── chain/                   # 区块链后端（开发中）
│   ├── cmd/                 # 命令行工具
│   ├── app/                 # 应用逻辑
│   └── go.mod              # Go 模块配置
├── pages_backup/           # 备份的复杂组件
└── package.json            # 项目配置
```

## 🎯 当前状态

### ✅ 已完成
- [x] 前端应用基础架构
- [x] 响应式界面设计
- [x] 多页面导航系统
- [x] 现代化 UI/UX 设计
- [x] 项目构建配置

### 🚧 开发中
- [ ] 区块链节点集成
- [ ] 真实数据连接
- [ ] 钱包功能实现
- [ ] 交易功能开发

### 📋 计划中
- [ ] 用户认证系统
- [ ] 实时数据更新
- [ ] 更多区块链功能
- [ ] 移动端 App

## 🛠️ 开发指南

### 添加新页面
1. 在 `App.tsx` 中添加新的 case
2. 创建对应的组件和样式
3. 更新导航按钮

### 样式自定义
- 主要样式在 `App.css` 中
- 使用 CSS 变量便于主题切换
- 响应式断点：768px（平板）、480px（手机）

### 组件开发
- 使用 TypeScript 确保类型安全
- 遵循 React Hooks 最佳实践
- 保持组件的单一职责原则

## 🐛 故障排除

### 常见问题

1. **应用无法启动**
   ```bash
   # 清理缓存并重新安装
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **TypeScript 错误**
   ```bash
   # 清理 TypeScript 缓存
   rm -rf frontend/node_modules/.cache
   ```

3. **端口被占用**
   ```bash
   # 查找并终止占用端口的进程
   lsof -ti:3000 | xargs kill -9
   ```

## 📄 许可证

MIT License - 详见 LICENSE 文件

## 👨‍💻 作者

Created by Da-Sheng

---

**注意**：这是一个演示项目，区块链功能仍在开发中。当前版本主要展示前端界面和基础架构。 