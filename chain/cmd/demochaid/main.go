package main

import (
	"os"

	"github.com/cosmos/cosmos-sdk/server"
	svrcmd "github.com/cosmos/cosmos-sdk/server/cmd"
	"github.com/spf13/cobra"

	"github.com/da-sheng/cosmos-demo/chain/app"
)

func main() {
	rootCmd := NewRootCmd()
	if err := svrcmd.Execute(rootCmd, "DEMOCHAIND", app.DefaultNodeHome); err != nil {
		switch e := err.(type) {
		case server.ErrorCode:
			os.Exit(e.Code)
		default:
			os.Exit(1)
		}
	}
}

func NewRootCmd() *cobra.Command {
	encodingConfig := app.MakeEncodingConfig()
	rootCmd := &cobra.Command{
		Use:   "demochaid",
		Short: "Cosmos Demo Chain App",
		Long:  "Cosmos Demo Chain application with basic transfer and mining functionality",
	}

	initRootCmd(rootCmd, encodingConfig)
	return rootCmd
}

func initRootCmd(rootCmd *cobra.Command, encodingConfig app.EncodingConfig) {
	// 添加子命令
	rootCmd.AddCommand(
		InitCmd(app.ModuleBasics, app.DefaultNodeHome),
		AddGenesisAccountCmd(app.DefaultNodeHome),
		server.StatusCommand(),
		Keys(),
		Version(app.Version),
	)

	// 添加服务端命令
	server.AddCommands(
		rootCmd,
		app.DefaultNodeHome,
		NewAppCreator(),
		NewAppExporter(),
		func(cmd *cobra.Command) {},
	)
}

// 创建应用实例
func NewAppCreator() server.AppCreator {
	return func(logger log.Logger, db dbm.DB, traceStore io.Writer, appOpts servertypes.AppOptions) servertypes.Application {
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

		return app.NewCosmosApp(
			logger,
			db,
			traceStore,
			true,
			appOpts,
		)
	}
}

// 创建应用导出器
func NewAppExporter() server.AppExporter {
	return func(logger log.Logger, db dbm.DB, traceStore io.Writer, height int64, forZeroHeight bool, jailAllowedAddrs []string, appOpts servertypes.AppOptions) (servertypes.ExportedApp, error) {
		var cosmosApp *app.App
		if height != -1 {
			cosmosApp = app.NewCosmosApp(logger, db, traceStore, false, appOpts)
			if err := cosmosApp.LoadHeight(height); err != nil {
				return servertypes.ExportedApp{}, err
			}
		} else {
			cosmosApp = app.NewCosmosApp(logger, db, traceStore, true, appOpts)
		}

		return cosmosApp.ExportAppStateAndValidators(forZeroHeight, jailAllowedAddrs)
	}
} 