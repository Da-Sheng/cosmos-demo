#!/bin/bash

# 安装ignite（如果尚未安装）
if ! command -v ignite &> /dev/null
then
    echo "正在安装 Ignite CLI..."
    curl -L https://get.ignite.com/cli@v0.27.1! | bash
fi

echo "使用Ignite框架创建一个新的Cosmos SDK应用链..."

# 进入父目录
cd ..

# 创建一个新的应用链
ignite scaffold chain mychain --address-prefix cosmos

# 创建一个简单的模块
cd mychain
ignite scaffold module greeting --dep bank

# 创建一个消息类型
ignite scaffold message create-greeting message --module greeting

# 构建应用程序
ignite chain build

# 启动链
echo "启动Cosmos SDK应用链..."
echo "可以通过http://localhost:26657访问RPC接口"
echo "可以通过http://localhost:1317访问REST接口"
echo "按Ctrl+C停止节点"

ignite chain serve --verbose 