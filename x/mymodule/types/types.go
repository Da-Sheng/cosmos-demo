package types

// Greeting 定义问候消息结构
type Greeting struct {
	Sender  string `json:"sender"`
	Message string `json:"message"`
} 