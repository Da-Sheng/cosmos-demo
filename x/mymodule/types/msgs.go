package types

import (
	"context"
	
	"cosmossdk.io/errors"
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
)

// 常量
const (
	TypeMsgCreateGreeting = "create_greeting"
)

var _ sdk.Msg = &MsgCreateGreeting{}

// MsgCreateGreeting 定义创建问候的消息
type MsgCreateGreeting struct {
	Sender  string `json:"sender"`
	Message string `json:"message"`
}

// NewMsgCreateGreeting 返回一个新的MsgCreateGreeting
func NewMsgCreateGreeting(sender, message string) *MsgCreateGreeting {
	return &MsgCreateGreeting{
		Sender:  sender,
		Message: message,
	}
}

// Route 实现sdk.Msg
func (msg MsgCreateGreeting) Route() string {
	return RouterKey
}

// Type 实现sdk.Msg
func (msg MsgCreateGreeting) Type() string {
	return TypeMsgCreateGreeting
}

// GetSigners 实现sdk.Msg
func (msg MsgCreateGreeting) GetSigners() []sdk.AccAddress {
	sender, err := sdk.AccAddressFromBech32(msg.Sender)
	if err != nil {
		panic(err)
	}
	return []sdk.AccAddress{sender}
}

// GetSignBytes 实现sdk.Msg
func (msg MsgCreateGreeting) GetSignBytes() []byte {
	bz := ModuleCdc.MustMarshalJSON(&msg)
	return sdk.MustSortJSON(bz)
}

// ValidateBasic 实现sdk.Msg
func (msg MsgCreateGreeting) ValidateBasic() error {
	_, err := sdk.AccAddressFromBech32(msg.Sender)
	if err != nil {
		return errors.Wrapf(sdkerrors.ErrInvalidAddress, "无效的发送者地址 (%s)", err)
	}

	if msg.Message == "" {
		return errors.Wrap(sdkerrors.ErrInvalidRequest, "消息不能为空")
	}

	return nil
} 