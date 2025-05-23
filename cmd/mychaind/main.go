package main

import (
	"os"

	"github.com/cosmos/cosmos-sdk/server"
	svrcmd "github.com/cosmos/cosmos-sdk/server/cmd"
	"github.com/spf13/cobra"

	"github.com/example/mychain/app"
)

func main() {
	rootCmd := NewRootCmd()
	if err := rootCmd.Execute(); err != nil {
		os.Exit(1)
	}
}

// NewRootCmd 创建根命令
func NewRootCmd() *cobra.Command {
	encodingConfig := app.MakeEncodingConfig()
	initClientCtx := client.Context{}.
		WithCodec(encodingConfig.Marshaler).
		WithInterfaceRegistry(encodingConfig.InterfaceRegistry).
		WithTxConfig(encodingConfig.TxConfig).
		WithLegacyAmino(encodingConfig.Amino)

	rootCmd := &cobra.Command{
		Use:   "mychaind",
		Short: "mychain 应用程序",
		Long:  "mychain 是一个基于 Cosmos SDK 的区块链应用程序",
	}

	// 添加子命令
	rootCmd.AddCommand(
		InitCmd(),
		genutilcli.Commands(app.ModuleBasics, app.DefaultNodeHome),
		server.StatusCommand(),
		server.ExportCommand(app.DefaultNodeHome, func(logger log.Logger, db dbm.DB, traceStore io.Writer, height int64, forZeroHeight bool, jailAllowedAddrs []string, appOpts server.AppOptions) (servertypes.ExportedApp, error) {
			return app.NewApp(
				logger, db, traceStore, height == -1, appOpts,
			).ExportAppStateAndValidators(forZeroHeight, jailAllowedAddrs)
		}),
	)

	server.AddCommands(rootCmd, app.DefaultNodeHome, newApp, createAppAndExport, addModuleInitFlags)

	return rootCmd
}

// newApp 创建一个新的应用程序实例
func newApp(logger log.Logger, db dbm.DB, traceStore io.Writer, appOpts servertypes.AppOptions) servertypes.Application {
	var cache sdk.MultiStorePersistentCache

	if cast.ToBool(appOpts.Get(server.FlagInterBlockCache)) {
		cache = store.NewCommitKVStoreCacheManager()
	}

	skipUpgradeHeights := make(map[int64]bool)
	for _, h := range cast.ToIntSlice(appOpts.Get(server.FlagUnsafeSkipUpgrades)) {
		skipUpgradeHeights[int64(h)] = true
	}

	pruningOpts, err := server.GetPruningOptionsFromFlags(appOpts)
	if err != nil {
		panic(err)
	}

	snapshotDir := filepath.Join(cast.ToString(appOpts.Get(flags.FlagHome)), "data", "snapshots")
	snapshotDB, err := sdk.NewLevelDB("metadata", snapshotDir)
	if err != nil {
		panic(err)
	}
	snapshotStore, err := snapshots.NewStore(snapshotDB, snapshotDir)
	if err != nil {
		panic(err)
	}

	return app.NewApp(
		logger, db, traceStore, true, appOpts,
		baseapp.SetPruning(pruningOpts),
		baseapp.SetMinGasPrices(cast.ToString(appOpts.Get(server.FlagMinGasPrices))),
		baseapp.SetHaltHeight(cast.ToUint64(appOpts.Get(server.FlagHaltHeight))),
		baseapp.SetHaltTime(cast.ToUint64(appOpts.Get(server.FlagHaltTime))),
		baseapp.SetMinRetainBlocks(cast.ToUint64(appOpts.Get(server.FlagMinRetainBlocks))),
		baseapp.SetInterBlockCache(cache),
		baseapp.SetTrace(cast.ToBool(appOpts.Get(server.FlagTrace))),
		baseapp.SetIndexEvents(cast.ToStringSlice(appOpts.Get(server.FlagIndexEvents))),
		baseapp.SetSnapshotStore(snapshotStore),
		baseapp.SetSnapshotInterval(cast.ToUint64(appOpts.Get(server.FlagStateSyncSnapshotInterval))),
		baseapp.SetSnapshotKeepRecent(cast.ToUint32(appOpts.Get(server.FlagStateSyncSnapshotKeepRecent))),
	)
}

// createAppAndExport 创建应用程序并导出状态
func createAppAndExport(
	logger log.Logger, db dbm.DB, traceStore io.Writer, height int64, forZeroHeight bool, jailAllowedAddrs []string,
	appOpts servertypes.AppOptions,
) (servertypes.ExportedApp, error) {
	encCfg := app.MakeEncodingConfig()
	encCfg.Marshaler = codec.NewProtoCodec(encCfg.InterfaceRegistry)
	var a *app.App
	if height != -1 {
		a = app.NewApp(logger, db, traceStore, false, appOpts)
		if err := a.LoadHeight(height); err != nil {
			return servertypes.ExportedApp{}, err
		}
	} else {
		a = app.NewApp(logger, db, traceStore, true, appOpts)
	}

	return a.ExportAppStateAndValidators(forZeroHeight, jailAllowedAddrs)
}

// addModuleInitFlags 添加模块初始化标志
func addModuleInitFlags(startCmd *cobra.Command) {
	crisis.AddModuleInitFlags(startCmd)
}

// InitCmd 初始化命令
func InitCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "init [moniker]",
		Short: "初始化节点配置文件",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			clientCtx := client.GetClientContextFromCmd(cmd)
			serverCtx := server.GetServerContextFromCmd(cmd)
			config := serverCtx.Config
			config.SetRoot(clientCtx.HomeDir)

			chainID, _ := cmd.Flags().GetString(flags.FlagChainID)
			if chainID == "" {
				chainID = fmt.Sprintf("mychain-%v", tmrand.Str(6))
			}

			// 生成节点私钥
			nodeID, pubKey, err := genutil.InitializeNodeValidatorFiles(config)
			if err != nil {
				return err
			}

			// 生成创世文件
			appState, err := server.AppGenState(serverCtx.Config, clientCtx.TxConfig, args[0], chainID)
			if err != nil {
				return err
			}

			genFile := config.GenesisFile()
			if !fileExists(genFile) {
				if err = genutil.ExportGenesisFile(genFile, chainID, []tmtypes.GenesisValidator{}, appState); err != nil {
					return err
				}
			}

			// 输出成功信息
			fmt.Printf("成功初始化节点 '%s':\n", args[0])
			fmt.Printf("- 节点ID: %s\n", nodeID)
			fmt.Printf("- 公钥: %s\n", pubKey)
			fmt.Printf("- 主目录: %s\n", clientCtx.HomeDir)
			fmt.Printf("- 链ID: %s\n", chainID)

			return nil
		},
	}

	cmd.Flags().String(flags.FlagChainID, "", "创世文件的链ID")
	cmd.Flags().String(flags.FlagHome, app.DefaultNodeHome, "节点主目录")

	return cmd
} 