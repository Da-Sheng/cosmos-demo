package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"
	
	"cosmos-demo/blockchain"
)

func main() {
	// 定义命令行参数
	portFlag := flag.Int("port", 8080, "Web服务器端口")
	blockTimeFlag := flag.Int("blocktime", 10, "区块生成间隔（秒）")
	webDir := flag.String("webdir", "./web", "Web文件目录路径")
	flag.Parse()
	
	// 确保web目录存在
	if _, err := os.Stat(*webDir); os.IsNotExist(err) {
		log.Fatalf("Web目录不存在: %s", *webDir)
	}
	
	// 创建区块链节点
	node := blockchain.NewNode(*blockTimeFlag)
	
	// 创建Web服务器
	webServer := blockchain.NewWebServer(node, *portFlag, *webDir)
	
	// 启动Web服务器
	go func() {
		log.Printf("启动Web服务器在 http://localhost:%d", *portFlag)
		if err := webServer.Start(); err != nil {
			log.Fatalf("Web服务器启动失败: %v", err)
		}
	}()
	
	// 处理退出信号
	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)
	
	<-sigCh
	fmt.Println("\n正在关闭服务...")
	
	// 停止挖矿
	node.StopMining()
	
	// 导出区块链状态
	stateFile := "blockchain_final_state.json"
	if err := node.ExportBlockchain(stateFile); err != nil {
		log.Printf("导出区块链状态失败: %v", err)
	} else {
		absPath, _ := filepath.Abs(stateFile)
		log.Printf("区块链状态已保存到: %s", absPath)
	}
	
	fmt.Println("程序已安全退出")
} 