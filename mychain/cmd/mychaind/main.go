package main

import (
	"fmt"
	"io"
	"os"
	"path/filepath"

	"cosmossdk.io/log"
	dbm "github.com/cometbft/cometbft-db"
	tmcli "github.com/cometbft/cometbft/libs/cli"
	"github.com/cometbft/cometbft/libs/json"
	tmrand "github.com/cometbft/cometbft/libs/rand"
	tmtime "github.com/cometbft/cometbft/types/time"
	tmtypes "github.com/cometbft/cometbft/types"
	"github.com/cosmos/cosmos-sdk/baseapp"
	"github.com/cosmos/cosmos-sdk/client"
	"github.com/cosmos/cosmos-sdk/client/config"
	"github.com/cosmos/cosmos-sdk/client/flags"
	"github.com/cosmos/cosmos-sdk/client/rpc"
	"github.com/cosmos/cosmos-sdk/codec"
	"github.com/cosmos/cosmos-sdk/server"
	servertypes "github.com/cosmos/cosmos-sdk/server/types"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/cosmos-sdk/x/genutil"
	genutilcli "github.com/cosmos/cosmos-sdk/x/genutil/client/cli"
	"github.com/spf13/cast"
	"github.com/spf13/cobra"

	"github.com/example/mychain/app"
)

func main() {
	rootCmd := NewRootCmd()
	if err := rootCmd.Execute(); err != nil {
		os.Exit(1)
	}
}

// 检查文件是否存在
func fileExists(filename string) bool {
	info, err := os.Stat(filename)
	if os.IsNotExist(err) {
		return false
	}
	return !info.IsDir()
}

// NewRootCmd 创建根命令
func NewRootCmd() *cobra.Command {
	rootCmd := &cobra.Command{
		Use:   "mychaind",
		Short: "mychain 应用程序",
		Long:  "mychain 是一个基于 Cosmos SDK 的区块链应用程序",
	}

	// 添加子命令
	rootCmd.AddCommand(
		InitCmd(),
		genutilcli.ValidateGenesisCmd(app.ModuleBasics),
		rpc.StatusCommand(),
		tmcli.NewCompletionCmd(rootCmd, true),
	)

	// 添加服务器命令
	server.AddCommands(rootCmd, app.DefaultNodeHome, newApp, nil, nil)

	return rootCmd
}

// newApp 创建一个新的应用程序实例
func newApp(logger log.Logger, db dbm.DB, traceStore io.Writer, appOpts servertypes.AppOptions) servertypes.Application {
	return app.NewApp(
		logger, db, traceStore, true, appOpts,
	)
}

// InitCmd 初始化命令
func InitCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "init [moniker]",
		Short: "初始化节点配置文件",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			clientCtx, err := client.GetClientQueryContext(cmd)
			if err != nil {
				return err
			}
			
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
			genFile := config.GenesisFile()
			genDoc := &tmtypes.GenesisDoc{}
			
			if fileExists(genFile) {
				genDoc, err = tmtypes.GenesisDocFromFile(genFile)
				if err != nil {
					return err
				}
			} else {
				genDoc = tmtypes.GenesisDoc{
					ChainID:         chainID,
					GenesisTime:     tmtime.Now(),
					ConsensusParams: tmtypes.DefaultConsensusParams(),
				}
			}
			
			// 生成一个空的应用状态
			appState := make(map[string]json.RawMessage)
			appStateJSON, err := json.Marshal(appState)
			if err != nil {
				return err
			}
			
			genDoc.AppState = appStateJSON
			if err = genutil.ExportGenesisFile(genDoc, genFile); err != nil {
				return err
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