# 如何实现一个简单的Cosmos SDK模块

本教程将指导您实现一个简单的Cosmos SDK模块，这个模块允许用户存储和检索问候消息。

## 1. 模块结构

一个典型的Cosmos SDK模块应包含以下组件：

```
mymodule/
├── keeper/           # 状态管理
│   ├── keeper.go     # 主要Keeper实现
│   ├── msg_server.go # 消息服务器实现
│   └── query_server.go # 查询服务器实现
├── types/            # 类型定义
│   ├── codec.go      # 编码相关
│   ├── errors.go     # 错误定义
│   ├── events.go     # 事件定义
│   ├── expected_keepers.go # 依赖接口
│   ├── genesis.go    # 创世状态类型
│   ├── keys.go       # 存储键定义
│   ├── msgs.go       # 消息类型定义
│   └── queries.go    # 查询类型定义
├── client/           # 客户端接口
│   ├── cli/          # 命令行接口
│   └── rest/         # REST接口
├── genesis.go        # 创世状态处理
├── handler.go        # 消息处理器
└── module.go         # 模块定义
```

## 2. 定义消息类型

首先，我们在`types/msgs.go`中定义模块的消息类型：

```go
package types

import (
    sdk "github.com/cosmos/cosmos-sdk/types"
    sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
)

// MsgCreateGreeting 定义创建问候消息的结构
type MsgCreateGreeting struct {
    Sender  string `json:"sender"`
    Message string `json:"message"`
}

// NewMsgCreateGreeting 创建一个新的MsgCreateGreeting实例
func NewMsgCreateGreeting(sender, message string) *MsgCreateGreeting {
    return &MsgCreateGreeting{
        Sender:  sender,
        Message: message,
    }
}

// Route 返回消息的路由键
func (msg MsgCreateGreeting) Route() string {
    return RouterKey
}

// Type 返回消息的类型
func (msg MsgCreateGreeting) Type() string {
    return "create_greeting"
}

// ValidateBasic 执行基本验证
func (msg MsgCreateGreeting) ValidateBasic() error {
    if msg.Sender == "" {
        return sdkerrors.Wrap(sdkerrors.ErrInvalidAddress, "sender cannot be empty")
    }
    if msg.Message == "" {
        return sdkerrors.Wrap(sdkerrors.ErrInvalidRequest, "message cannot be empty")
    }
    return nil
}

// GetSignBytes 返回签名字节
func (msg MsgCreateGreeting) GetSignBytes() []byte {
    bz := ModuleCdc.MustMarshalJSON(&msg)
    return sdk.MustSortJSON(bz)
}

// GetSigners 返回签名者
func (msg MsgCreateGreeting) GetSigners() []sdk.AccAddress {
    sender, err := sdk.AccAddressFromBech32(msg.Sender)
    if err != nil {
        panic(err)
    }
    return []sdk.AccAddress{sender}
}
```

## 3. 定义Keeper

接下来，在`keeper/keeper.go`中实现模块的Keeper：

```go
package keeper

import (
    "github.com/cosmos/cosmos-sdk/codec"
    sdk "github.com/cosmos/cosmos-sdk/types"
    "github.com/example/mychain/x/mymodule/types"
)

// Keeper 管理模块状态
type Keeper struct {
    storeKey sdk.StoreKey
    cdc      codec.BinaryCodec
}

// NewKeeper 创建一个新的Keeper实例
func NewKeeper(storeKey sdk.StoreKey, cdc codec.BinaryCodec) Keeper {
    return Keeper{
        storeKey: storeKey,
        cdc:      cdc,
    }
}

// SetGreeting 保存问候消息
func (k Keeper) SetGreeting(ctx sdk.Context, sender, message string) {
    store := ctx.KVStore(k.storeKey)
    key := []byte(sender)
    value := []byte(message)
    store.Set(key, value)
}

// GetGreeting 获取问候消息
func (k Keeper) GetGreeting(ctx sdk.Context, sender string) (string, bool) {
    store := ctx.KVStore(k.storeKey)
    key := []byte(sender)
    value := store.Get(key)
    
    if value == nil {
        return "", false
    }
    
    return string(value), true
}

// DeleteGreeting 删除问候消息
func (k Keeper) DeleteGreeting(ctx sdk.Context, sender string) {
    store := ctx.KVStore(k.storeKey)
    key := []byte(sender)
    store.Delete(key)
}
```

## 4. 实现消息服务器

在`keeper/msg_server.go`中实现消息处理服务器：

```go
package keeper

import (
    "context"
    
    sdk "github.com/cosmos/cosmos-sdk/types"
    "github.com/example/mychain/x/mymodule/types"
)

type msgServer struct {
    Keeper
}

// NewMsgServerImpl 返回一个实现了MsgServer接口的实例
func NewMsgServerImpl(keeper Keeper) types.MsgServer {
    return &msgServer{Keeper: keeper}
}

// CreateGreeting 处理创建问候消息
func (ms msgServer) CreateGreeting(goCtx context.Context, msg *types.MsgCreateGreeting) (*types.MsgCreateGreetingResponse, error) {
    ctx := sdk.UnwrapSDKContext(goCtx)
    
    // 保存问候消息
    ms.Keeper.SetGreeting(ctx, msg.Sender, msg.Message)
    
    // 发出事件
    ctx.EventManager().EmitEvent(
        sdk.NewEvent(
            types.EventTypeGreetingCreated,
            sdk.NewAttribute(types.AttributeKeySender, msg.Sender),
            sdk.NewAttribute(types.AttributeKeyMessage, msg.Message),
        ),
    )
    
    return &types.MsgCreateGreetingResponse{}, nil
}
```

## 5. 实现模块

在`module.go`中定义模块：

```go
package mymodule

import (
    "encoding/json"
    
    "github.com/cosmos/cosmos-sdk/codec"
    sdk "github.com/cosmos/cosmos-sdk/types"
    "github.com/cosmos/cosmos-sdk/types/module"
    
    "github.com/example/mychain/x/mymodule/keeper"
    "github.com/example/mychain/x/mymodule/types"
)

// AppModuleBasic 定义模块的基本功能
type AppModuleBasic struct {}

// Name 返回模块名称
func (AppModuleBasic) Name() string {
    return types.ModuleName
}

// RegisterLegacyAminoCodec 注册模块的Amino编解码器
func (AppModuleBasic) RegisterLegacyAminoCodec(cdc *codec.LegacyAmino) {
    types.RegisterLegacyAminoCodec(cdc)
}

// DefaultGenesis 返回默认创世状态
func (AppModuleBasic) DefaultGenesis(cdc codec.JSONCodec) json.RawMessage {
    return cdc.MustMarshalJSON(types.DefaultGenesis())
}

// ValidateGenesis 验证创世状态
func (AppModuleBasic) ValidateGenesis(cdc codec.JSONCodec, _ client.TxEncodingConfig, bz json.RawMessage) error {
    var genState types.GenesisState
    if err := cdc.UnmarshalJSON(bz, &genState); err != nil {
        return err
    }
    return genState.Validate()
}

// AppModule 是模块的主要实现
type AppModule struct {
    AppModuleBasic
    keeper keeper.Keeper
}

// NewAppModule 创建一个新的AppModule实例
func NewAppModule(k keeper.Keeper) AppModule {
    return AppModule{
        AppModuleBasic: AppModuleBasic{},
        keeper:         k,
    }
}

// InitGenesis 初始化创世状态
func (am AppModule) InitGenesis(ctx sdk.Context, cdc codec.JSONCodec, data json.RawMessage) []abci.ValidatorUpdate {
    var genesisState types.GenesisState
    cdc.MustUnmarshalJSON(data, &genesisState)
    InitGenesis(ctx, am.keeper, genesisState)
    return []abci.ValidatorUpdate{}
}

// ExportGenesis 导出创世状态
func (am AppModule) ExportGenesis(ctx sdk.Context, cdc codec.JSONCodec) json.RawMessage {
    gs := ExportGenesis(ctx, am.keeper)
    return cdc.MustMarshalJSON(gs)
}

// RegisterInvariants 注册不变量检查器
func (am AppModule) RegisterInvariants(_ sdk.InvariantRegistry) {}

// Route 返回模块的消息路由器
func (am AppModule) Route() sdk.Route {
    return sdk.NewRoute(types.RouterKey, NewHandler(am.keeper))
}

// QuerierRoute 返回模块的查询路由
func (AppModule) QuerierRoute() string {
    return types.QuerierRoute
}

// LegacyQuerierHandler 返回模块的遗留查询处理程序
func (am AppModule) LegacyQuerierHandler(legacyQuerierCdc *codec.LegacyAmino) sdk.Querier {
    return nil
}

// RegisterServices 注册模块服务
func (am AppModule) RegisterServices(cfg module.Configurator) {
    types.RegisterMsgServer(cfg.MsgServer(), keeper.NewMsgServerImpl(am.keeper))
    types.RegisterQueryServer(cfg.QueryServer(), am.keeper)
}

// ConsensusVersion 返回模块的共识版本
func (AppModule) ConsensusVersion() uint64 { return 1 }
```

## 6. 创世状态处理

在`genesis.go`中实现创世状态处理：

```go
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
```

## 7. 将模块集成到应用中

要将此模块集成到您的Cosmos SDK应用中，需要在应用的`app.go`文件中：

1. 导入模块
2. 添加模块存储键
3. 在应用构造函数中初始化Keeper
4. 在模块管理器中注册模块

```go
// app.go
import (
    // 其他导入
    "github.com/example/mychain/x/mymodule"
    mymodulekeeper "github.com/example/mychain/x/mymodule/keeper"
    mymoduletypes "github.com/example/mychain/x/mymodule/types"
)

// 添加存储键
keys := sdk.NewKVStoreKeys(
    // 其他键
    mymoduletypes.StoreKey,
)

// 初始化Keeper
app.MyModuleKeeper = mymodulekeeper.NewKeeper(
    appCodec,
    keys[mymoduletypes.StoreKey],
)

// 在模块管理器中注册模块
app.mm = module.NewManager(
    // 其他模块
    mymodule.NewAppModule(appCodec, app.MyModuleKeeper),
)
```

## 结论

通过上述步骤，您已经实现了一个简单的Cosmos SDK模块，该模块允许用户存储和检索问候消息。这个例子展示了Cosmos SDK模块的基本结构和实现方式，您可以根据自己的需求扩展此模块，增加更多功能。

## 拓展建议

- 添加更多消息类型，如更新和删除问候消息
- 实现查询功能，如获取所有问候消息或按条件筛选
- 添加参数管理，如限制消息长度
- 实现命令行和REST接口
- 添加自定义事件和索引