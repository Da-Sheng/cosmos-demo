package types

import "context"

// QueryGetGreetingRequest 获取问候消息的请求
type QueryGetGreetingRequest struct {
	Sender string `json:"sender"`
}

// QueryGetGreetingResponse 获取问候消息的响应
type QueryGetGreetingResponse struct {
	Greeting *Greeting `json:"greeting"`
}

// QueryServer 定义模块的gRPC查询服务
type QueryServer interface {
	// GetGreeting 查询问候消息
	GetGreeting(context.Context, *QueryGetGreetingRequest) (*QueryGetGreetingResponse, error)
} 