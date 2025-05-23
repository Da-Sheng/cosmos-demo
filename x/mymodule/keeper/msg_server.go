package keeper

import (
	"context"

	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/example/mychain/x/mymodule/types"
)

type msgServer struct {
	Keeper
}

// NewMsgServerImpl 返回一个消息服务器实现
func NewMsgServerImpl(keeper Keeper) types.MsgServer {
	return &msgServer{Keeper: keeper}
}

var _ types.MsgServer = msgServer{}

// CreateGreeting 实现MsgCreateGreeting消息处理
func (s msgServer) CreateGreeting(goCtx context.Context, msg *types.MsgCreateGreeting) (*types.MsgCreateGreetingResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)

	s.Keeper.SetGreeting(ctx, msg.Sender, msg.Message)

	ctx.EventManager().EmitEvent(
		sdk.NewEvent(
			types.EventTypeCreateGreeting,
			sdk.NewAttribute(types.AttributeKeySender, msg.Sender),
			sdk.NewAttribute(types.AttributeKeyMessage, msg.Message),
		),
	)

	return &types.MsgCreateGreetingResponse{}, nil
} 