# 基于Web的区块链示例项目

这个项目演示了如何创建一个简单的区块链系统并通过Web界面与之交互。

## 项目结构

```
cosmos-demo/
├── blockchain/         # 区块链核心库
│   ├── node.go         # 区块链节点实现
│   └── webserver.go    # Web服务器API实现
├── web/                # Web前端文件
│   ├── index.html      # 主HTML页面
│   ├── css/            # CSS样式
│   │   └── styles.css  # 主样式表
│   └── js/             # JavaScript文件
│       └── app.js      # 前端应用逻辑
├── main.go             # 主程序入口
└── README.md           # 项目说明
```

## 功能特点

1. 创建创世区块
2. 自动生成区块（每10秒一个）
3. 添加交易到区块链
4. 查看区块链上的区块
5. Web界面查看和控制区块链

## 安装指南

### 先决条件

- Go 1.16 或更高版本
- Web浏览器（Chrome、Firefox、Safari等）

### 安装步骤

1. 克隆仓库：
   ```bash
   git clone https://github.com/yourusername/cosmos-demo.git
   cd cosmos-demo
   ```

2. 创建目录结构：
   ```bash
   mkdir -p blockchain web/css web/js
   ```

3. 创建核心文件：
   - 为 `blockchain/node.go` 创建实现区块链核心功能的代码
   - 为 `blockchain/webserver.go` 创建API服务器代码
   - 为 `web/index.html` 创建HTML界面
   - 为 `web/css/styles.css` 创建CSS样式
   - 为 `web/js/app.js` 创建JavaScript交互逻辑
   - 为 `main.go` 创建程序入口文件

4. 编译项目：
   ```bash
   go build -o blockchain_web main.go
   ```

## 使用说明

1. 运行程序：
   ```bash
   ./blockchain_web
   ```

2. 打开浏览器访问：
   ```
   http://localhost:8080
   ```

3. 通过Web界面：
   - 创建创世区块
   - 启动和停止区块生成
   - 添加交易
   - 查看区块信息

## API说明

HTTP API端点：

- `GET /api/chain/info` - 获取区块链信息
- `GET /api/blocks` - 获取所有区块
- `GET /api/block?height=<高度>` - 获取指定高度的区块
- `POST /api/genesis` - 创建创世区块
- `POST /api/mining/start` - 开始生成区块
- `POST /api/mining/stop` - 停止生成区块
- `POST /api/transaction` - 添加交易

## 注意事项

- 这是一个教育性质的区块链实现，不建议用于生产环境
- 没有实现持久化存储，程序关闭后数据会丢失
- 本项目不包含加密货币功能

## 许可证

MIT 