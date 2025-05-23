package main

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
)

func main() {
	rootCmd := &cobra.Command{
		Use:   "demochaid",
		Short: "Cosmos Demo Chain",
		Long:  "A simple Cosmos SDK blockchain for demonstration purposes",
	}

	// Add version command
	rootCmd.AddCommand(&cobra.Command{
		Use:   "version",
		Short: "Print the version",
		Run: func(cmd *cobra.Command, args []string) {
			fmt.Println("demochaid version 0.1.0")
		},
	})

	// Add start command
	rootCmd.AddCommand(&cobra.Command{
		Use:   "start",
		Short: "Start the blockchain node",
		Run: func(cmd *cobra.Command, args []string) {
			fmt.Println("Starting Cosmos Demo Chain...")
			fmt.Println("This is a minimal implementation for demonstration.")
			fmt.Println("The chain would start here in a full implementation.")
		},
	})

	// Add init command
	rootCmd.AddCommand(&cobra.Command{
		Use:   "init [moniker]",
		Short: "Initialize the blockchain",
		Args:  cobra.ExactArgs(1),
		Run: func(cmd *cobra.Command, args []string) {
			moniker := args[0]
			fmt.Printf("Initializing blockchain with moniker: %s\n", moniker)
			fmt.Println("This would initialize the blockchain in a full implementation.")
		},
	})

	if err := rootCmd.Execute(); err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}
} 