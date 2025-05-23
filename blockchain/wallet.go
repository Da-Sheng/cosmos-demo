package blockchain

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"sync"
	"time"
)

// Wallet 表示一个钱包
type Wallet struct {
	Address    string `json:"address"`
	PrivateKey string `json:"private_key"`
	PublicKey  string `json:"public_key"`
	Balance    int64  `json:"balance"`
}

// Transaction 表示一笔交易
type Transaction struct {
	ID        string `json:"id"`
	From      string `json:"from"`
	To        string `json:"to"`
	Amount    int64  `json:"amount"`
	Fee       int64  `json:"fee"`
	Timestamp int64  `json:"timestamp"`
	Signature string `json:"signature"`
}

// WalletManager 钱包管理器
type WalletManager struct {
	wallets map[string]*Wallet
	mu      sync.RWMutex
}

// NewWalletManager 创建钱包管理器
func NewWalletManager() *WalletManager {
	return &WalletManager{
		wallets: make(map[string]*Wallet),
	}
}

// CreateWallet 创建新钱包
func (wm *WalletManager) CreateWallet() *Wallet {
	wm.mu.Lock()
	defer wm.mu.Unlock()

	privateKey := wm.generatePrivateKey()
	publicKey := wm.generatePublicKey(privateKey)
	address := wm.generateAddress(publicKey)

	wallet := &Wallet{
		Address:    address,
		PrivateKey: privateKey,
		PublicKey:  publicKey,
		Balance:    1000, // 初始余额1000币
	}

	wm.wallets[address] = wallet
	return wallet
}

// GetWallet 获取钱包
func (wm *WalletManager) GetWallet(address string) *Wallet {
	wm.mu.RLock()
	defer wm.mu.RUnlock()
	
	return wm.wallets[address]
}

// GetAllWallets 获取所有钱包
func (wm *WalletManager) GetAllWallets() []*Wallet {
	wm.mu.RLock()
	defer wm.mu.RUnlock()
	
	wallets := make([]*Wallet, 0, len(wm.wallets))
	for _, wallet := range wm.wallets {
		wallets = append(wallets, wallet)
	}
	return wallets
}

// UpdateBalance 更新钱包余额
func (wm *WalletManager) UpdateBalance(address string, amount int64) {
	wm.mu.Lock()
	defer wm.mu.Unlock()
	
	if wallet, exists := wm.wallets[address]; exists {
		wallet.Balance += amount
	}
}

// GetBalance 获取钱包余额
func (wm *WalletManager) GetBalance(address string) int64 {
	wm.mu.RLock()
	defer wm.mu.RUnlock()
	
	if wallet, exists := wm.wallets[address]; exists {
		return wallet.Balance
	}
	return 0
}

// ValidateTransaction 验证交易
func (wm *WalletManager) ValidateTransaction(tx *Transaction) error {
	wm.mu.RLock()
	defer wm.mu.RUnlock()

	if tx.From == "system" {
		// 系统转账（挖矿奖励）总是有效的
		return nil
	}

	fromWallet, exists := wm.wallets[tx.From]
	if !exists {
		return fmt.Errorf("发送方钱包不存在")
	}

	totalAmount := tx.Amount + tx.Fee
	if fromWallet.Balance < totalAmount {
		return fmt.Errorf("余额不足：需要 %d，实际 %d", totalAmount, fromWallet.Balance)
	}

	return nil
}

// ProcessTransaction 处理交易
func (wm *WalletManager) ProcessTransaction(tx *Transaction) error {
	if err := wm.ValidateTransaction(tx); err != nil {
		return err
	}

	wm.mu.Lock()
	defer wm.mu.Unlock()

	// 扣除发送方余额
	if tx.From != "system" {
		if fromWallet, exists := wm.wallets[tx.From]; exists {
			fromWallet.Balance -= (tx.Amount + tx.Fee)
		}
	}

	// 增加接收方余额
	if toWallet, exists := wm.wallets[tx.To]; exists {
		toWallet.Balance += tx.Amount
	} else {
		// 创建新钱包（只有地址）
		wm.wallets[tx.To] = &Wallet{
			Address: tx.To,
			Balance: tx.Amount,
		}
	}

	return nil
}

// CreateTransaction 创建交易
func (wm *WalletManager) CreateTransaction(from, to string, amount, fee int64) *Transaction {
	txData := fmt.Sprintf("%s%s%d%d", from, to, amount, fee)
	hash := sha256.Sum256([]byte(txData))
	
	return &Transaction{
		ID:        hex.EncodeToString(hash[:])[:16],
		From:      from,
		To:        to,
		Amount:    amount,
		Fee:       fee,
		Timestamp: time.Now().Unix(),
		Signature: wm.signTransaction(txData),
	}
}

// 生成私钥
func (wm *WalletManager) generatePrivateKey() string {
	key := make([]byte, 32)
	rand.Read(key)
	return hex.EncodeToString(key)
}

// 生成公钥
func (wm *WalletManager) generatePublicKey(privateKey string) string {
	hash := sha256.Sum256([]byte(privateKey + "public"))
	return hex.EncodeToString(hash[:])
}

// 生成地址
func (wm *WalletManager) generateAddress(publicKey string) string {
	hash := sha256.Sum256([]byte(publicKey))
	return "cosmos" + hex.EncodeToString(hash[:])[:20]
}

// 签名交易（简化版）
func (wm *WalletManager) signTransaction(data string) string {
	hash := sha256.Sum256([]byte(data + "signature"))
	return hex.EncodeToString(hash[:])[:32]
} 