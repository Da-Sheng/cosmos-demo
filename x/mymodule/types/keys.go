package types

const (
	// ModuleName 定义模块名称
	ModuleName = "mymodule"

	// StoreKey 定义模块的存储Key
	StoreKey = ModuleName

	// RouterKey 定义用于消息路由的Key
	RouterKey = ModuleName

	// QuerierRoute 定义用于查询的路由
	QuerierRoute = ModuleName
)

// 键前缀
var (
	// GreetingPrefix 用于存储问候消息的前缀
	GreetingPrefix = []byte{0x01}
)

// GetGreetingKey 返回问候消息的存储键
func GetGreetingKey(sender string) []byte {
	return append(GreetingPrefix, []byte(sender)...)
} 