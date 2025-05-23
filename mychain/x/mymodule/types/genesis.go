package types

// GenesisState 定义模块的创世状态
type GenesisState struct {
	Greetings []Greeting `json:"greetings"`
}

// DefaultGenesis 返回默认的创世状态
func DefaultGenesis() *GenesisState {
	return &GenesisState{
		Greetings: []Greeting{},
	}
}

// Validate 验证创世状态
func (gs GenesisState) Validate() error {
	// 简单地返回nil，因为我们没有特别的验证规则
	return nil
} 