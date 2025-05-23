#!/bin/bash

# 设置终端颜色
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 打印标题
echo -e "${BLUE}====================================${NC}"
echo -e "${GREEN}Cosmos SDK 模拟链启动脚本${NC}"
echo -e "${BLUE}====================================${NC}"

# 编译 demochaid 命令行工具
echo -e "${YELLOW}正在编译区块链节点可执行文件...${NC}"
go build -o demochaid main.go

# 检查编译是否成功
if [ $? -ne 0 ]; then
    echo -e "${RED}编译失败，请检查错误信息${NC}"
    exit 1
fi

# 给执行文件添加执行权限
chmod +x demochaid

# 初始化节点
echo -e "${YELLOW}初始化区块链节点...${NC}"
./demochaid init mynode

# 启动节点
echo -e "${YELLOW}启动区块链节点...${NC}"
./demochaid start