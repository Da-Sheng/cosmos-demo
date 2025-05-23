import { useState, useEffect, useCallback } from 'react';
import { blockchainApi } from '../services/api';

// 定义钱包类型
export interface WalletBalance {
  denom: string;
  amount: string;
  usdValue?: string;
}

export interface WalletTransaction {
  hash: string;
  type: 'send' | 'receive' | 'delegate' | 'undelegate' | 'reward';
  amount: string;
  denom: string;
  timestamp: string;
  status: 'success' | 'pending' | 'failed';
  from?: string;
  to?: string;
  memo?: string;
}

export interface WalletInfo {
  address: string;
  name: string;
  balances: WalletBalance[];
  transactions: WalletTransaction[];
  delegations: Array<{
    validator: string;
    amount: string;
    rewards: string;
  }>;
  totalBalance: string;
  totalUsdValue: string;
  availableBalance: string;
}

// 钱包钩子
export const useWallet = () => {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<{name: string, address: string}[]>([]);

  // 获取账户列表
  const fetchAccounts = useCallback(async () => {
    // 在真实环境中应该从区块链API获取账户列表
    // 这里我们先使用本地存储
    const storedAccounts = localStorage.getItem('blockchain_accounts');
    if (storedAccounts) {
      setAccounts(JSON.parse(storedAccounts));
    }
  }, []);

  // 创建账户
  const createAccount = async (name: string) => {
    setLoading(true);
    try {
      // 调用API创建账户
      const response = await blockchainApi.createAccount(name);
      if (response.success) {
        const newAccount = {
          name: response.account_name,
          address: response.address
        };
        
        // 更新账户列表
        const updatedAccounts = [...accounts, newAccount];
        setAccounts(updatedAccounts);
        
        // 保存到本地存储
        localStorage.setItem('blockchain_accounts', JSON.stringify(updatedAccounts));
        
        setLoading(false);
        return { success: true, account: newAccount };
      } else {
        throw new Error(response.error || '创建账户失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建账户失败');
      setLoading(false);
      return { success: false, error: err instanceof Error ? err.message : '创建账户失败' };
    }
  };

  // 连接钱包 (在这里实际上是选择一个账户)
  const connectWallet = async (address?: string) => {
    setLoading(true);
    try {
      // 如果没有提供地址，使用上次连接的地址或账户列表中的第一个
      if (!address) {
        address = localStorage.getItem('lastConnectedAddress') || 
                  (accounts.length > 0 ? accounts[0].address : undefined);
      }
      
      if (!address) {
        throw new Error('没有可用的账户，请先创建账户');
      }
      
      // 获取账户余额
      const balanceResponse = await blockchainApi.getBalance(address);
      if (!balanceResponse.success) {
        throw new Error(balanceResponse.error || '获取余额失败');
      }
      
      // 获取对应账户名
      const account = accounts.find(acc => acc.address === address);
      if (!account) {
        throw new Error('找不到对应的账户信息');
      }
      
      // 构建钱包信息
      const balances: WalletBalance[] = balanceResponse.balance.balances.map(bal => ({
        denom: bal.denom,
        amount: bal.amount,
        // 实际应用中可以从价格API获取美元价值
        usdValue: undefined
      }));
      
      const totalBalance = balances.reduce((sum, bal) => sum + parseFloat(bal.amount), 0).toFixed(6);
      
      const walletInfo: WalletInfo = {
        address,
        name: account.name,
        balances,
        // 交易列表应该从API获取，这里先用空数组
        transactions: [],
        // 委托列表应该从API获取，这里先用空数组
        delegations: [],
        totalBalance,
        // 实际应用中应该计算美元价值
        totalUsdValue: '$ --',
        availableBalance: totalBalance
      };
      
      // 保存钱包信息
      setWalletInfo(walletInfo);
      setConnected(true);
      
      // 保存最后连接的地址
      localStorage.setItem('lastConnectedAddress', address);
      
      // 获取交易历史
      fetchTransactionHistory(address);
      
      setLoading(false);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : '钱包连接失败');
      setLoading(false);
      return false;
    }
  };

  // 获取交易历史
  const fetchTransactionHistory = async (address: string) => {
    try {
      // 实际应用中应该从API获取交易历史
      // 这里暂时使用模拟数据，后续应替换为真实API
      const mockTransactions: WalletTransaction[] = Array.from({ length: 5 }, (_, i) => ({
        hash: `TX${Math.random().toString(36).substring(2, 15)}`,
        type: Math.random() > 0.5 ? 'send' : 'receive',
        amount: `${Math.floor(Math.random() * 100) + 1}`,
        denom: 'stake',
        timestamp: new Date(Date.now() - i * 86400000).toISOString(),
        status: 'success',
        from: Math.random() > 0.5 ? address : `cosmos1${Math.random().toString(36).substring(2, 10)}`,
        to: Math.random() > 0.5 ? `cosmos1${Math.random().toString(36).substring(2, 10)}` : address
      }));
      
      // 更新钱包信息
      setWalletInfo(prev => {
        if (prev) {
          return { ...prev, transactions: mockTransactions };
        }
        return prev;
      });
    } catch (err) {
      console.error('获取交易历史失败:', err);
    }
  };

  // 断开钱包连接
  const disconnectWallet = () => {
    setWalletInfo(null);
    setConnected(false);
    localStorage.removeItem('lastConnectedAddress');
  };

  // 发送交易
  const sendTransaction = async (
    recipient: string,
    amount: string,
    denom: string,
    memo?: string
  ): Promise<{success: boolean; hash?: string; error?: string}> => {
    setLoading(true);
    try {
      if (!walletInfo) {
        throw new Error('钱包未连接');
      }
      
      // 调用API发送交易
      const response = await blockchainApi.transfer(
        walletInfo.name, // 使用账户名
        recipient,
        amount,
        denom
      );
      
      if (response.success) {
        // 更新钱包信息
        // 1. 更新余额
        connectWallet(walletInfo.address);
        
        // 2. 添加到交易记录
        const newTransaction: WalletTransaction = {
          hash: response.tx_hash,
          type: 'send',
          amount,
          denom,
          timestamp: new Date().toISOString(),
          status: 'success',
          from: walletInfo.address,
          to: recipient,
          memo
        };
        
        setWalletInfo(prev => {
          if (prev) {
            return {
              ...prev,
              transactions: [newTransaction, ...prev.transactions]
            };
          }
          return prev;
        });
        
        setLoading(false);
        return { success: true, hash: response.tx_hash };
      } else {
        throw new Error(response.error || '交易发送失败');
      }
    } catch (err) {
      setLoading(false);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : '交易处理出错'
      };
    }
  };

  // 自动连接（使用之前连接的账户）
  useEffect(() => {
    const init = async () => {
      await fetchAccounts();
      const lastAddress = localStorage.getItem('lastConnectedAddress');
      if (lastAddress) {
        await connectWallet(lastAddress);
      } else {
        setLoading(false);
      }
    };
    
    init();
  }, [fetchAccounts]);

  return {
    walletInfo,
    connected,
    loading,
    error,
    accounts,
    createAccount,
    connectWallet,
    disconnectWallet,
    sendTransaction
  };
}; 