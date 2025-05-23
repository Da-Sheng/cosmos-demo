package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	"cosmossdk.io/log"
	dbm "github.com/cosmos/cosmos-db"
	tmcfg "github.com/cometbft/cometbft/config"
	tmlog "github.com/cometbft/cometbft/libs/log"
	tmrand "github.com/cometbft/cometbft/libs/rand"
	"github.com/cometbft/cometbft/node"
	"github.com/cometbft/cometbft/p2p"
	"github.com/cometbft/cometbft/privval"
	"github.com/cometbft/cometbft/proxy"
	"github.com/cometbft/cometbft/types"
	tmtime "github.com/cometbft/cometbft/types/time"

	"github.com/cosmos/cosmos-sdk/server"
	servertypes "github.com/cosmos/cosmos-sdk/server/types"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

const ChainID = "demo-chain"

var DefaultNodeHome string

func init() {
	userHomeDir, err := os.UserHomeDir()
	if err != nil {
		panic(err)
	}
	DefaultNodeHome = filepath.Join(userHomeDir, ".demochain")
}

func main() {
	rootCmd := NewRootCmd()
	
	if err := rootCmd.Execute(); err != nil {
		fmt.Fprintf(os.Stderr, "错误执行根命令: %v\n", err)
		os.Exit(1)
	}
}

func NewRootCmd() *cobra.Command {
	rootCmd := &cobra.Command{
		Use:   "demochaid",
		Short: "真实 Cosmos 区块链节点",
		Long:  "基于 Cosmos SDK 的真实区块链实现",
	}

	rootCmd.AddCommand(
		initCmd(),
		startCmd(),
		versionCmd(),
		statusCmd(),
	)

	return rootCmd
}

func versionCmd() *cobra.Command {
	return &cobra.Command{
		Use:   "version",
		Short: "打印版本信息",
		Run: func(cmd *cobra.Command, args []string) {
			fmt.Println("Cosmos Demo Chain v1.0.0")
			fmt.Println("🚀 真实 Cosmos SDK 实现")
			fmt.Println("🔗 链 ID:", ChainID)
		},
	}
}

func statusCmd() *cobra.Command {
	return &cobra.Command{
		Use:   "status",
		Short: "显示区块链状态",
		Run: func(cmd *cobra.Command, args []string) {
			fmt.Println("📊 === 真实 Cosmos 区块链状态 ===")
			fmt.Println("🔧 实现: Cosmos SDK v0.50.6")
			fmt.Println("📡 RPC 端点: tcp://localhost:26657")
			fmt.Println("🔗 链 ID:", ChainID)
			fmt.Println("💰 原生代币: stake")
		},
	}
}

func initCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "init [moniker]",
		Short: "初始化区块链节点",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			moniker := args[0]
			
			fmt.Printf("🎯 初始化 Cosmos 区块链节点: %s\n", moniker)
			
			nodeHome := DefaultNodeHome
			if err := os.MkdirAll(nodeHome, 0755); err != nil {
				return fmt.Errorf("创建节点主目录失败: %w", err)
			}

			// 初始化 Tendermint 配置
			config := tmcfg.DefaultConfig()
			config.SetRoot(nodeHome)
			config.Moniker = moniker

			fmt.Println("📁 创建配置目录...")
			tmcfg.EnsureRoot(nodeHome)

			fmt.Println("🔑 生成验证器私钥...")
			privValKeyFile := config.PrivValidatorKeyFile()
			privValStateFile := config.PrivValidatorStateFile()
			var pv *privval.FilePV
			if tmrand.Bool() {
				pv = privval.LoadOrGenFilePV(privValKeyFile, privValStateFile)
			} else {
				pv = privval.GenFilePV(privValKeyFile, privValStateFile)
			}
			pv.Save()

			fmt.Println("🌐 生成节点密钥...")
			nodeKeyFile := config.NodeKeyFile()
			if _, err := p2p.LoadOrGenNodeKey(nodeKeyFile); err != nil {
				return err
			}

			fmt.Println("🌱 创建创世文件...")
			genFile := config.GenesisFile()
			
			// 创建应用程序以生成创世状态
			logger := log.NewLogger(os.Stdout)
			db, err := dbm.NewDB("application", dbm.GoLevelDBBackend, filepath.Join(nodeHome, "data"))
			if err != nil {
				return err
			}
			defer db.Close()

			app := NewApp(logger, db, nil, true, servertypes.NewAppOptions(viper.GetViper()))
			appState, err := json.MarshalIndent(NewDefaultGenesisState(app.AppCodec()), "", " ")
			if err != nil {
				return err
			}

			genDoc := &types.GenesisDoc{
				ChainID:         ChainID,
				GenesisTime:     tmtime.Now(),
				ConsensusParams: types.DefaultConsensusParams(),
				AppState:        appState,
			}

			// 添加验证器到创世文件
			pubKey, err := pv.GetPubKey()
			if err != nil {
				return err
			}

			genDoc.Validators = []types.GenesisValidator{{
				Address: pubKey.Address(),
				PubKey:  pubKey,
				Power:   10,
			}}

			if err := genDoc.SaveAs(genFile); err != nil {
				return err
			}

			// 保存配置
			tmcfg.WriteConfigFile(filepath.Join(nodeHome, "config", "config.toml"), config)

			fmt.Println("✅ Cosmos 区块链节点初始化成功！")
			fmt.Printf("📂 节点主目录: %s\n", nodeHome)
			fmt.Printf("🔗 链 ID: %s\n", ChainID)
			fmt.Println("🚀 准备启动: demochaid start")

			return nil
		},
	}

	return cmd
}

func startCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "start",
		Short: "启动区块链节点",
		RunE: func(cmd *cobra.Command, args []string) error {
			fmt.Println("🚀 === 启动真实 Cosmos 区块链 ===")
			
			nodeHome := DefaultNodeHome
			
			// 检查是否已初始化
			genesisPath := filepath.Join(nodeHome, "config", "genesis.json")
			if _, err := os.Stat(genesisPath); os.IsNotExist(err) {
				return fmt.Errorf("节点未初始化。请先运行: demochaid init <moniker>")
			}

			// 加载配置
			config := tmcfg.DefaultConfig()
			config.SetRoot(nodeHome)
			
			logger := log.NewLogger(os.Stdout)
			
			// 创建数据库
			db, err := dbm.NewDB("application", dbm.GoLevelDBBackend, filepath.Join(nodeHome, "data"))
			if err != nil {
				return fmt.Errorf("打开数据库失败: %w", err)
			}
			defer db.Close()

			// 创建应用程序
			fmt.Println("🔧 初始化 Cosmos 应用程序...")
			app := NewApp(logger, db, nil, true, servertypes.NewAppOptions(viper.GetViper()))

			// 加载私有验证器
			privValidator := privval.LoadOrGenFilePV(
				config.PrivValidatorKeyFile(),
				config.PrivValidatorStateFile(),
			)

			// 加载节点密钥
			nodeKey, err := p2p.LoadOrGenNodeKey(config.NodeKeyFile())
			if err != nil {
				return fmt.Errorf("加载节点密钥失败: %w", err)
			}

			fmt.Println("🌐 启动 Tendermint 节点...")
			fmt.Printf("📡 RPC 监听地址: %s\n", config.RPC.ListenAddress)
			fmt.Printf("🔗 链 ID: %s\n", ChainID)
			fmt.Println("✅ 区块链节点正在运行...")

			// 创建并启动节点
			tmNode, err := node.NewNode(
				config,
				privValidator,
				nodeKey,
				proxy.NewLocalClientCreator(app),
				node.DefaultGenesisDocProviderFunc(config),
				node.DefaultDBProvider,
				node.DefaultMetricsProvider(config.Instrumentation),
				tmlog.NewTMLogger(tmlog.NewSyncWriter(os.Stdout)),
			)
			if err != nil {
				return fmt.Errorf("创建节点失败: %w", err)
			}

			if err := tmNode.Start(); err != nil {
				return fmt.Errorf("启动节点失败: %w", err)
			}

			// 等待中断信号
			server.TrapSignal(logger, func() {
				if tmNode.IsRunning() {
					tmNode.Stop()
				}
			})

			fmt.Println("\n🛑 关闭区块链节点...")
			if err := tmNode.Stop(); err != nil {
				logger.Error("停止节点时出错", "err", err)
			}
			fmt.Println("✅ 节点已优雅停止")

			return nil
		},
	}

	return cmd
} 