package blockchain

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"sync"
)

// WebServer 提供区块链的HTTP接口
type WebServer struct {
	node     *Node
	port     int
	webDir   string
	server   *http.Server
	stopChan chan struct{}
	mu       sync.Mutex
}

// NewWebServer 创建一个新的Web服务器实例
func NewWebServer(node *Node, port int, webDir string) *WebServer {
	return &WebServer{
		node:     node,
		port:     port,
		webDir:   webDir,
		stopChan: make(chan struct{}),
	}
}

// Start 启动Web服务器
func (ws *WebServer) Start() error {
	ws.mu.Lock()
	defer ws.mu.Unlock()

	if ws.server != nil {
		return fmt.Errorf("服务器已经运行")
	}

	mux := http.NewServeMux()

	// 静态文件服务
	mux.Handle("/", http.FileServer(http.Dir(ws.webDir)))

	// API 端点 - 使用CORS中间件包装
	mux.HandleFunc("/api/chain/info", ws.corsMiddleware(ws.getChainInfoHandler))
	mux.HandleFunc("/api/blocks", ws.corsMiddleware(ws.getBlocksHandler))
	mux.HandleFunc("/api/block", ws.corsMiddleware(ws.getBlockHandler))
	mux.HandleFunc("/api/genesis", ws.corsMiddleware(ws.createGenesisHandler))
	mux.HandleFunc("/api/mining/start", ws.corsMiddleware(ws.startMiningHandler))
	mux.HandleFunc("/api/mining/stop", ws.corsMiddleware(ws.stopMiningHandler))
	mux.HandleFunc("/api/transaction", ws.corsMiddleware(ws.addTransactionHandler))
	
	// 钱包相关API
	mux.HandleFunc("/api/wallet/create", ws.corsMiddleware(ws.createWalletHandler))
	mux.HandleFunc("/api/wallet/list", ws.corsMiddleware(ws.listWalletsHandler))
	mux.HandleFunc("/api/wallet/balance", ws.corsMiddleware(ws.getBalanceHandler))
	mux.HandleFunc("/api/wallet/transfer", ws.corsMiddleware(ws.transferHandler))
	mux.HandleFunc("/api/wallet/transactions", ws.corsMiddleware(ws.getTransactionsHandler))
	mux.HandleFunc("/api/wallet/miner", ws.corsMiddleware(ws.getMinerInfoHandler))

	addr := fmt.Sprintf(":%d", ws.port)
	ws.server = &http.Server{
		Addr:    addr,
		Handler: mux,
	}

	return ws.server.ListenAndServe()
}

// Stop 停止Web服务器
func (ws *WebServer) Stop() error {
	ws.mu.Lock()
	defer ws.mu.Unlock()

	if ws.server == nil {
		return nil
	}

	return ws.server.Close()
}

// getChainInfoHandler 返回区块链的基本信息
func (ws *WebServer) getChainInfoHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "只支持GET方法", http.StatusMethodNotAllowed)
		return
	}

	info := struct {
		Height        int    `json:"height"`
		PendingTxCount int    `json:"pendingTxCount"`
		Status        string `json:"status"`
	}{
		Height:        ws.node.GetHeight(),
		PendingTxCount: len(ws.node.pendingTransactions),
		Status:        "运行中",
	}

	ws.sendJSONResponse(w, info)
}

// getBlocksHandler 返回所有区块
func (ws *WebServer) getBlocksHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "只支持GET方法", http.StatusMethodNotAllowed)
		return
	}

	blocks := ws.node.GetAllBlocks()
	ws.sendJSONResponse(w, blocks)
}

// getBlockHandler 返回特定高度的区块
func (ws *WebServer) getBlockHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "只支持GET方法", http.StatusMethodNotAllowed)
		return
	}

	heightStr := r.URL.Query().Get("height")
	if heightStr == "" {
		http.Error(w, "缺少height参数", http.StatusBadRequest)
		return
	}

	height, err := strconv.Atoi(heightStr)
	if err != nil {
		http.Error(w, "height参数必须是整数", http.StatusBadRequest)
		return
	}

	block := ws.node.GetBlockByHeight(height)
	if block == nil {
		http.Error(w, "未找到指定高度的区块", http.StatusNotFound)
		return
	}

	ws.sendJSONResponse(w, block)
}

// createGenesisHandler 创建创世区块
func (ws *WebServer) createGenesisHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "只支持POST方法", http.StatusMethodNotAllowed)
		return
	}

	var request struct {
		Data string `json:"data"`
	}

	if err := ws.decodeJSONBody(r, &request); err != nil {
		http.Error(w, "无效的请求数据: "+err.Error(), http.StatusBadRequest)
		return
	}

	if ws.node.GetHeight() > 0 {
		http.Error(w, "区块链已初始化，无法创建创世区块", http.StatusBadRequest)
		return
	}

	err := ws.node.CreateGenesisBlock(request.Data)
	if err != nil {
		http.Error(w, "创建创世区块失败: "+err.Error(), http.StatusInternalServerError)
		return
	}

	ws.sendJSONResponse(w, struct {
		Success bool   `json:"success"`
		Message string `json:"message"`
	}{
		Success: true,
		Message: "创世区块创建成功",
	})
}

// startMiningHandler 开始挖矿
func (ws *WebServer) startMiningHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "只支持POST方法", http.StatusMethodNotAllowed)
		return
	}

	if ws.node.GetHeight() < 1 {
		http.Error(w, "请先创建创世区块", http.StatusBadRequest)
		return
	}

	ws.node.StartMining()

	ws.sendJSONResponse(w, struct {
		Success bool   `json:"success"`
		Message string `json:"message"`
	}{
		Success: true,
		Message: "区块生成已启动",
	})
}

// stopMiningHandler 停止挖矿
func (ws *WebServer) stopMiningHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "只支持POST方法", http.StatusMethodNotAllowed)
		return
	}

	ws.node.StopMining()

	ws.sendJSONResponse(w, struct {
		Success bool   `json:"success"`
		Message string `json:"message"`
	}{
		Success: true,
		Message: "区块生成已停止",
	})
}

// addTransactionHandler 添加交易
func (ws *WebServer) addTransactionHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "只支持POST方法", http.StatusMethodNotAllowed)
		return
	}

	var request struct {
		Data string `json:"data"`
	}

	if err := ws.decodeJSONBody(r, &request); err != nil {
		http.Error(w, "无效的请求数据: "+err.Error(), http.StatusBadRequest)
		return
	}

	if ws.node.GetHeight() < 1 {
		http.Error(w, "请先创建创世区块", http.StatusBadRequest)
		return
	}

	ws.node.AddTransaction(request.Data)

	ws.sendJSONResponse(w, struct {
		Success bool   `json:"success"`
		Message string `json:"message"`
	}{
		Success: true,
		Message: "交易已添加",
	})
}

// 辅助函数: 发送JSON响应
func (ws *WebServer) sendJSONResponse(w http.ResponseWriter, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	
	if err := json.NewEncoder(w).Encode(data); err != nil {
		log.Printf("发送JSON响应失败: %v", err)
		http.Error(w, "内部服务器错误", http.StatusInternalServerError)
	}
}

// 辅助函数: 解析JSON请求体
func (ws *WebServer) decodeJSONBody(r *http.Request, dst interface{}) error {
	if r.Header.Get("Content-Type") != "application/json" {
		return fmt.Errorf("需要Content-Type: application/json")
	}

	return json.NewDecoder(r.Body).Decode(dst)
}

// 钱包相关API处理函数

// createWalletHandler 创建新钱包
func (ws *WebServer) createWalletHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "只支持POST方法", http.StatusMethodNotAllowed)
		return
	}

	wallet := ws.node.CreateWallet()
	
	ws.sendJSONResponse(w, struct {
		Success bool   `json:"success"`
		Message string `json:"message"`
		Wallet  *Wallet `json:"wallet"`
	}{
		Success: true,
		Message: "钱包创建成功",
		Wallet:  wallet,
	})
}

// listWalletsHandler 获取所有钱包列表
func (ws *WebServer) listWalletsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "只支持GET方法", http.StatusMethodNotAllowed)
		return
	}

	wallets := ws.node.GetAllWallets()
	ws.sendJSONResponse(w, wallets)
}

// getBalanceHandler 获取钱包余额
func (ws *WebServer) getBalanceHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "只支持GET方法", http.StatusMethodNotAllowed)
		return
	}

	address := r.URL.Query().Get("address")
	if address == "" {
		http.Error(w, "缺少address参数", http.StatusBadRequest)
		return
	}

	balance := ws.node.GetBalance(address)
	
	ws.sendJSONResponse(w, struct {
		Address string `json:"address"`
		Balance int64  `json:"balance"`
	}{
		Address: address,
		Balance: balance,
	})
}

// transferHandler 处理转账请求
func (ws *WebServer) transferHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "只支持POST方法", http.StatusMethodNotAllowed)
		return
	}

	var request struct {
		From   string `json:"from"`
		To     string `json:"to"`
		Amount int64  `json:"amount"`
	}

	if err := ws.decodeJSONBody(r, &request); err != nil {
		http.Error(w, "无效的请求数据: "+err.Error(), http.StatusBadRequest)
		return
	}

	if request.From == "" || request.To == "" || request.Amount <= 0 {
		http.Error(w, "转账参数无效", http.StatusBadRequest)
		return
	}

	err := ws.node.Transfer(request.From, request.To, request.Amount)
	if err != nil {
		http.Error(w, "转账失败: "+err.Error(), http.StatusBadRequest)
		return
	}

	ws.sendJSONResponse(w, struct {
		Success bool   `json:"success"`
		Message string `json:"message"`
	}{
		Success: true,
		Message: "转账成功",
	})
}

// getTransactionsHandler 获取交易历史
func (ws *WebServer) getTransactionsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "只支持GET方法", http.StatusMethodNotAllowed)
		return
	}

	transactions := ws.node.GetTransactions()
	ws.sendJSONResponse(w, transactions)
}

// getMinerInfoHandler 获取矿工信息
func (ws *WebServer) getMinerInfoHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "只支持GET方法", http.StatusMethodNotAllowed)
		return
	}

	minerAddress := ws.node.GetMinerAddress()
	minerBalance := ws.node.GetBalance(minerAddress)
	miningStats := ws.node.GetMiningStats()

	ws.sendJSONResponse(w, struct {
		Address string                 `json:"address"`
		Balance int64                  `json:"balance"`
		Stats   map[string]interface{} `json:"stats"`
	}{
		Address: minerAddress,
		Balance: minerBalance,
		Stats:   miningStats,
	})
}

// corsMiddleware CORS中间件，允许跨域请求
func (ws *WebServer) corsMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// 设置CORS头
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Max-Age", "86400")

		// 处理预检请求
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		// 调用实际的处理函数
		next(w, r)
	}
}

