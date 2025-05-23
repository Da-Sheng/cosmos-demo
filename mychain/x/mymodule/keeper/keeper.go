package keeper

import (
	"github.com/cosmos/cosmos-sdk/codec"
	storetypes "github.com/cosmos/cosmos-sdk/store/types"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/example/mychain/x/mymodule/types"
)

// Keeper 定义模块的状态管理器
type Keeper struct {
	cdc      codec.BinaryCodec
	storeKey storetypes.StoreKey
}

// NewKeeper 创建新的Keeper
func NewKeeper(
	cdc codec.BinaryCodec,
	storeKey storetypes.StoreKey,
) *Keeper {
	return &Keeper{
		cdc:      cdc,
		storeKey: storeKey,
	}
}

// SetGreeting 设置问候消息
func (k Keeper) SetGreeting(ctx sdk.Context, sender string, message string) {
	store := ctx.KVStore(k.storeKey)
	greeting := types.Greeting{
		Sender:  sender,
		Message: message,
	}
	
	store.Set(types.GetGreetingKey(sender), k.cdc.MustMarshal(&greeting))
}

// GetGreeting 获取问候消息
func (k Keeper) GetGreeting(ctx sdk.Context, sender string) (types.Greeting, bool) {
	store := ctx.KVStore(k.storeKey)
	bz := store.Get(types.GetGreetingKey(sender))
	if bz == nil {
		return types.Greeting{}, false
	}

	var greeting types.Greeting
	k.cdc.MustUnmarshal(bz, &greeting)
	return greeting, true
}

// DeleteGreeting 删除问候消息
func (k Keeper) DeleteGreeting(ctx sdk.Context, sender string) {
	store := ctx.KVStore(k.storeKey)
	store.Delete(types.GetGreetingKey(sender))
} 