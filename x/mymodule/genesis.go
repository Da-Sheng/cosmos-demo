package mymodule

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	
	"github.com/example/mychain/x/mymodule/keeper"
	"github.com/example/mychain/x/mymodule/types"
)

// InitGenesis 初始化模块的创世状态
func InitGenesis(ctx sdk.Context, k keeper.Keeper, genState types.GenesisState) {
	// 初始化所有问候消息
	for _, greeting := range genState.Greetings {
		k.SetGreeting(ctx, greeting.Sender, greeting.Message)
	}
}

// ExportGenesis 导出模块的创世状态
func ExportGenesis(ctx sdk.Context, k keeper.Keeper) *types.GenesisState {
	// 暂时实现一个简单版本，返回空的创世状态
	// 在实际应用中，我们应该遍历存储并提取所有问候消息
	return &types.GenesisState{
		Greetings: []types.Greeting{},
	}
} 