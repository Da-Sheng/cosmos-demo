package app

import (
	"io"
	"os"
	"path/filepath"

	"cosmossdk.io/log"
	storetypes "cosmossdk.io/store/types"
	dbm "github.com/cometbft/cometbft-db"
	abci "github.com/cometbft/cometbft/abci/types"
	"github.com/cometbft/cometbft/libs/json"
	"github.com/cometbft/cometbft/proto/tendermint/types"
	"github.com/cosmos/cosmos-sdk/baseapp"
	"github.com/cosmos/cosmos-sdk/client"
	"github.com/cosmos/cosmos-sdk/codec"
	"github.com/cosmos/cosmos-sdk/codec/types"
	"github.com/cosmos/cosmos-sdk/server/types"
	"github.com/cosmos/cosmos-sdk/std"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/cosmos-sdk/types/module"
	"github.com/cosmos/cosmos-sdk/x/auth"
	authkeeper "github.com/cosmos/cosmos-sdk/x/auth/keeper"
	authsims "github.com/cosmos/cosmos-sdk/x/auth/simulation"
	authtypes "github.com/cosmos/cosmos-sdk/x/auth/types"
	"github.com/cosmos/cosmos-sdk/x/bank"
	bankkeeper "github.com/cosmos/cosmos-sdk/x/bank/keeper"
	banktypes "github.com/cosmos/cosmos-sdk/x/bank/types"
	"github.com/cosmos/cosmos-sdk/x/params"
	paramskeeper "github.com/cosmos/cosmos-sdk/x/params/keeper"
	paramstypes "github.com/cosmos/cosmos-sdk/x/params/types"

	"github.com/example/mychain/x/mymodule"
	mymodulekeeper "github.com/example/mychain/x/mymodule/keeper"
	mymoduletypes "github.com/example/mychain/x/mymodule/types"
)

const (
	AppName = "mychain"
)

var (
	// DefaultNodeHome 默认节点配置目录
	DefaultNodeHome string

	// ModuleBasics 基本模块管理器
	ModuleBasics = module.NewBasicManager(
		auth.AppModuleBasic{},
		bank.AppModuleBasic{},
		params.AppModuleBasic{},
		mymodule.AppModuleBasic{},
	)
)

// init 初始化默认的节点目录
func init() {
	userHomeDir, err := os.UserHomeDir()
	if err != nil {
		panic(err)
	}

	DefaultNodeHome = filepath.Join(userHomeDir, "."+AppName)
}

// App 定义应用程序
type App struct {
	*baseapp.BaseApp

	cdc               *codec.LegacyAmino
	appCodec          codec.Codec
	interfaceRegistry types.InterfaceRegistry

	// keys to access the substores
	keys    map[string]*storetypes.KVStoreKey
	tkeys   map[string]*storetypes.TransientStoreKey
	memKeys map[string]*storetypes.MemoryStoreKey

	// keepers
	AccountKeeper authkeeper.AccountKeeper
	BankKeeper    bankkeeper.Keeper
	ParamsKeeper  paramskeeper.Keeper
	MyModuleKeeper mymodulekeeper.Keeper

	// the module manager
	mm *module.Manager
}

// maccPerms 返回受限制的模块账户权限
var maccPerms = map[string][]string{
	authtypes.FeeCollectorName: nil,
}

// blockedAddrs 返回不能接收积分的地址
func blockedAddrs() map[string]bool {
	modAccAddrs := make(map[string]bool)
	for acc := range maccPerms {
		modAccAddrs[authtypes.NewModuleAddress(acc).String()] = true
	}
	return modAccAddrs
}

// NewApp 创建新的应用程序实例
func NewApp(
	logger log.Logger,
	db dbm.DB,
	traceStore io.Writer,
	loadLatest bool,
	appOpts types.AppOptions,
	baseAppOptions ...func(*baseapp.BaseApp),
) *App {
	// 创建编解码器
	interfaceRegistry := types.NewInterfaceRegistry()
	appCodec := codec.NewProtoCodec(interfaceRegistry)
	cdc := codec.NewLegacyAmino()

	// 注册标准类型
	std.RegisterLegacyAminoCodec(cdc)
	std.RegisterInterfaces(interfaceRegistry)

	// 初始化BaseApp
	bApp := baseapp.NewBaseApp(AppName, logger, db, nil, baseAppOptions...)
	bApp.SetCommitMultiStoreTracer(traceStore)
	bApp.SetVersion("1.0.0")
	bApp.SetInterfaceRegistry(interfaceRegistry)

	// 初始化键
	keys := sdk.NewKVStoreKeys(
		authtypes.StoreKey,
		banktypes.StoreKey,
		paramstypes.StoreKey,
		mymoduletypes.StoreKey,
	)
	tkeys := sdk.NewTransientStoreKeys(paramstypes.TStoreKey)
	memKeys := sdk.NewMemoryStoreKeys()

	// 初始化应用程序
	app := &App{
		BaseApp:           bApp,
		cdc:               cdc,
		appCodec:          appCodec,
		interfaceRegistry: interfaceRegistry,
		keys:              keys,
		tkeys:             tkeys,
		memKeys:           memKeys,
	}

	// 初始化参数Keeper
	app.ParamsKeeper = paramskeeper.NewKeeper(
		appCodec,
		cdc,
		keys[paramstypes.StoreKey],
		tkeys[paramstypes.TStoreKey],
	)

	// 初始化账户Keeper
	app.AccountKeeper = authkeeper.NewAccountKeeper(
		appCodec,
		keys[authtypes.StoreKey],
		authtypes.ProtoBaseAccount,
		maccPerms,
		"cosmos", // 地址前缀
	)

	// 初始化银行Keeper
	app.BankKeeper = bankkeeper.NewBaseKeeper(
		appCodec,
		keys[banktypes.StoreKey],
		app.AccountKeeper,
		blockedAddrs(),
		authtypes.NewModuleAddress("gov").String(),
	)

	// 初始化MyModule Keeper
	app.MyModuleKeeper = mymodulekeeper.NewKeeper(
		appCodec,
		keys[mymoduletypes.StoreKey],
	)

	// 初始化模块管理器
	app.mm = module.NewManager(
		auth.NewAppModule(appCodec, app.AccountKeeper, authsims.RandomGenesisAccounts),
		bank.NewAppModule(appCodec, app.BankKeeper, app.AccountKeeper),
		params.NewAppModule(app.ParamsKeeper),
		mymodule.NewAppModule(appCodec, app.MyModuleKeeper),
	)

	// 设置初始化顺序
	app.mm.SetOrderInitGenesis(
		authtypes.ModuleName,
		banktypes.ModuleName,
		mymoduletypes.ModuleName,
	)

	// 设置BeginBlockers顺序
	app.mm.SetOrderBeginBlockers(
		mymoduletypes.ModuleName,
	)

	// 设置EndBlockers顺序
	app.mm.SetOrderEndBlockers(
		mymoduletypes.ModuleName,
	)

	// 挂载存储
	app.MountKVStores(keys)
	app.MountTransientStores(tkeys)
	app.MountMemoryStores(memKeys)

	// 初始化应用程序
	if loadLatest {
		if err := app.LoadLatestVersion(); err != nil {
			logger.Error("加载最新版本出错", "err", err)
			os.Exit(1)
		}
	}

	return app
}

// Name 返回应用程序名称
func (app *App) Name() string {
	return app.BaseApp.Name()
}

// BeginBlocker 实现SDK应用程序接口
func (app *App) BeginBlocker(ctx sdk.Context, req abci.RequestBeginBlock) abci.ResponseBeginBlock {
	return app.mm.BeginBlock(ctx, req)
}

// EndBlocker 实现SDK应用程序接口
func (app *App) EndBlocker(ctx sdk.Context, req abci.RequestEndBlock) abci.ResponseEndBlock {
	return app.mm.EndBlock(ctx, req)
}

// InitChainer 初始化链，它将在启动时被调用
func (app *App) InitChainer(ctx sdk.Context, req abci.RequestInitChain) abci.ResponseInitChain {
	var genesisState map[string]json.RawMessage
	app.cdc.MustUnmarshalJSON(req.AppStateBytes, &genesisState)
	return app.mm.InitGenesis(ctx, app.appCodec, genesisState)
}

// LoadHeight 加载指定高度的状态
func (app *App) LoadHeight(height int64) error {
	return app.LoadVersion(height)
}

// AppCodec 返回应用程序的编解码器
func (app *App) AppCodec() codec.Codec {
	return app.appCodec
}

// InterfaceRegistry 返回应用程序的接口注册表
func (app *App) InterfaceRegistry() types.InterfaceRegistry {
	return app.interfaceRegistry
}

// ExportAppStateAndValidators 导出应用程序状态和验证器
func (app *App) ExportAppStateAndValidators(forZeroHeight bool, jailAllowedAddrs []string) (servertypes.ExportedApp, error) {
	// 导出应用程序的状态
	appState := make(map[string]json.RawMessage)
	for _, moduleName := range app.mm.ModuleNames() {
		if moduleState := app.mm.ExportGenesis(app.NewContext(true, tmproto.Header{}), app.appCodec)[moduleName]; moduleState != nil {
			appState[moduleName] = moduleState
		}
	}

	validators := make([]tmtypes.GenesisValidator, 0)
	return servertypes.ExportedApp{
		AppState:        appState,
		Validators:      validators,
		Height:          app.LastBlockHeight(),
		ConsensusParams: app.GetConsensusParams(app.NewContext(true, tmproto.Header{})),
	}, nil
} 