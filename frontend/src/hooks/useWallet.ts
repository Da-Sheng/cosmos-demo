import { useState, useCallback } from 'react';
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { SigningStargateClient, StargateClient, coin } from '@cosmjs/stargate';

const RPC_ENDPOINT = 'http://localhost:26657';
const PREFIX = 'cosmos';
const DENOM = 'udemo';

type Transaction = {
  hash: string;
  type: string;
  amount: string;
  denom: string;
  sender: string;
  recipient: string;
  timestamp: string;
};

export const useWallet = () => {
  const [account, setAccount] = useState<{ address: string; pubkey: Uint8Array } | null>(null);
  const [balance, setBalance] = useState<{ amount: string; denom: string } | null>(null);
  const [mnemonic, setMnemonic] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [signer, setSigner] = useState<DirectSecp256k1HdWallet | null>(null);
  const [signingClient, setSigningClient] = useState<SigningStargateClient | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 连接到已有钱包
  const connectWallet = useCallback(async (mnemonicPhrase: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 创建钱包实例
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonicPhrase, {
        prefix: PREFIX,
      });
      
      // 获取账户
      const [firstAccount] = await wallet.getAccounts();
      
      // 使用模拟数据，不实际连接到区块链节点
      // const client = await SigningStargateClient.connectWithSigner(
      //   RPC_ENDPOINT,
      //   wallet
      // );
      
      // 模拟一个签名客户端
      const mockSigningClient = {
        getBalance: async () => ({ amount: '10000000', denom: DENOM }),
        sendTokens: async () => ({ 
          transactionHash: `0x${Math.random().toString(16).substring(2, 66)}` 
        })
      } as unknown as SigningStargateClient;
      
      // 获取账户余额
      const balanceResponse = await mockSigningClient.getBalance(firstAccount.address, DENOM);
      
      setSigner(wallet);
      setSigningClient(mockSigningClient);
      setAccount(firstAccount);
      setBalance({
        amount: balanceResponse.amount,
        denom: balanceResponse.denom,
      });
      setMnemonic(mnemonicPhrase);
      setIsConnected(true);
      
      // 获取账户相关交易
      fetchTransactions(firstAccount.address);
      
    } catch (error) {
      console.error('Error connecting wallet:', error);
      if (error instanceof Error) {
        setError(`Failed to connect wallet: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 创建新钱包
  const createWallet = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 创建随机助记词的新钱包
      const wallet = await DirectSecp256k1HdWallet.generate(24, {
        prefix: PREFIX,
      });
      
      // 获取助记词和账户
      const mnemonic = wallet.mnemonic;
      const [firstAccount] = await wallet.getAccounts();
      
      // 使用模拟数据，不实际连接到区块链节点
      // const client = await SigningStargateClient.connectWithSigner(
      //   RPC_ENDPOINT,
      //   wallet
      // );
      
      // 模拟一个签名客户端
      const mockSigningClient = {
        getBalance: async () => ({ amount: '10000000', denom: DENOM }),
        sendTokens: async () => ({ 
          transactionHash: `0x${Math.random().toString(16).substring(2, 66)}` 
        })
      } as unknown as SigningStargateClient;
      
      setSigner(wallet);
      setSigningClient(mockSigningClient);
      setAccount(firstAccount);
      setBalance({
        amount: '10000000',
        denom: DENOM,
      });
      setMnemonic(mnemonic);
      setIsConnected(true);
      
      console.info('创建新钱包成功！请妥善保存助记词：', mnemonic);
      
    } catch (error) {
      console.error('Error creating wallet:', error);
      if (error instanceof Error) {
        setError(`Failed to create wallet: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 发送代币
  const sendTokens = useCallback(async (recipient: string, amount: string) => {
    if (!signingClient || !account) {
      setError('Wallet not connected!');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await signingClient.sendTokens(
        account.address,
        recipient,
        [coin(amount, DENOM)],
        {
          amount: [{ amount: '5000', denom: DENOM }],
          gas: '200000',
        }
      );
      
      // 更新余额 - 使用模拟数据
      const balanceResponse = await signingClient.getBalance(account.address, DENOM);
      setBalance({
        amount: (parseInt(balance?.amount || '0') - parseInt(amount)).toString(),
        denom: DENOM,
      });
      
      // 添加到交易列表
      const newTransaction: Transaction = {
        hash: response.transactionHash,
        type: 'send',
        amount,
        denom: DENOM,
        sender: account.address,
        recipient,
        timestamp: new Date().toISOString(),
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
      console.info(`Transaction sent! Hash: ${response.transactionHash}`);
      
    } catch (error) {
      console.error('Error sending tokens:', error);
      if (error instanceof Error) {
        setError(`Failed to send tokens: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, [signingClient, account, balance]);

  // 获取交易历史
  const fetchTransactions = useCallback(async (address: string) => {
    try {
      setIsLoading(true);
      
      // 在实际应用中，这里会调用区块链API获取交易历史
      // 这里只是模拟一些交易数据
      const mockTransactions: Transaction[] = [
        {
          hash: '0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234',
          type: 'receive',
          amount: '1000',
          denom: DENOM,
          sender: 'cosmos1sender123456789abcdef123456789abcdef1234',
          recipient: address,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          hash: '0xabcdef123456789abcdef123456789abcdef123456789abcdef123456789abcd',
          type: 'send',
          amount: '500',
          denom: DENOM,
          sender: address,
          recipient: 'cosmos1recipient123456789abcdef123456789abcdef1234',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
        },
      ];
      
      setTransactions(mockTransactions);
      
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    account,
    balance,
    mnemonic,
    isConnected,
    isLoading,
    transactions,
    error,
    connectWallet,
    createWallet,
    sendTokens,
  };
}; 