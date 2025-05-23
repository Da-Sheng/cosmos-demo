import { useState, useEffect } from 'react';

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

// 模拟钱包数据
const mockWalletInfo: WalletInfo = {
  address: 'cosmos1abcdefghijklmnopqrstuvwxyz012345',
  balances: [
    { denom: 'ATOM', amount: '1000.42', usdValue: '$11,004.62' },
    { denom: 'OSMO', amount: '2500.00', usdValue: '$3,750.00' },
    { denom: 'AKT', amount: '5000.33', usdValue: '$1,500.10' }
  ],
  transactions: Array.from({ length: 15 }, (_, i) => ({
    hash: `TX${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
    type: ['send', 'receive', 'delegate', 'undelegate', 'reward'][Math.floor(Math.random() * 5)] as any,
    amount: `${Math.floor(Math.random() * 100) + 1}.${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    denom: ['ATOM', 'OSMO', 'AKT'][Math.floor(Math.random() * 3)],
    timestamp: new Date(Date.now() - i * 86400000).toISOString(),
    status: ['success', 'pending', 'failed'][Math.floor(Math.random() * 2.2)] as any,
    from: i % 2 === 0 ? 'cosmos1abcdefghijklmnopqrstuvwxyz012345' : `cosmos1${Math.random().toString(36).substring(2, 10)}`,
    to: i % 2 === 0 ? `cosmos1${Math.random().toString(36).substring(2, 10)}` : 'cosmos1abcdefghijklmnopqrstuvwxyz012345',
    memo: Math.random() > 0.7 ? `Memo ${i}` : undefined
  })),
  delegations: [
    { validator: 'validator1', amount: '500.00', rewards: '12.34' },
    { validator: 'validator2', amount: '300.00', rewards: '8.45' },
    { validator: 'validator3', amount: '200.00', rewards: '5.67' }
  ],
  totalBalance: '1000.42',
  totalUsdValue: '$16,254.72',
  availableBalance: '850.42'
};

// 钱包钩子
export const useWallet = () => {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 连接钱包
  const connectWallet = async () => {
    setLoading(true);
    try {
      // 模拟连接延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      setWalletInfo(mockWalletInfo);
      setConnected(true);
      setLoading(false);
      return true;
    } catch (err) {
      setError('钱包连接失败');
      setLoading(false);
      return false;
    }
  };

  // 断开钱包连接
  const disconnectWallet = () => {
    setWalletInfo(null);
    setConnected(false);
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
      // 模拟交易延迟
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 90%的概率成功
      if (Math.random() > 0.1) {
        const txHash = `TX${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
        
        // 更新钱包信息（模拟）
        if (walletInfo) {
          const updatedWalletInfo = { ...walletInfo };
          
          // 更新余额
          const balanceIndex = updatedWalletInfo.balances.findIndex(b => b.denom === denom);
          if (balanceIndex >= 0) {
            const currentAmount = parseFloat(updatedWalletInfo.balances[balanceIndex].amount);
            const sendAmount = parseFloat(amount);
            updatedWalletInfo.balances[balanceIndex].amount = (currentAmount - sendAmount).toFixed(3);
          }
          
          // 添加交易记录
          updatedWalletInfo.transactions.unshift({
            hash: txHash,
            type: 'send',
            amount,
            denom,
            timestamp: new Date().toISOString(),
            status: 'success',
            from: walletInfo.address,
            to: recipient,
            memo
          });
          
          setWalletInfo(updatedWalletInfo);
        }
        
        setLoading(false);
        return { success: true, hash: txHash };
      } else {
        setLoading(false);
        return { success: false, error: '交易发送失败，请重试' };
      }
    } catch (err) {
      setLoading(false);
      return { success: false, error: '交易处理出错' };
    }
  };

  // 自动连接（模拟持久化连接）
  useEffect(() => {
    if (localStorage.getItem('walletConnected') === 'true') {
      connectWallet();
    } else {
      setLoading(false);
    }
  }, []);

  // 保存连接状态
  useEffect(() => {
    if (connected) {
      localStorage.setItem('walletConnected', 'true');
    } else {
      localStorage.removeItem('walletConnected');
    }
  }, [connected]);

  return {
    walletInfo,
    connected,
    loading,
    error,
    connectWallet,
    disconnectWallet,
    sendTransaction
  };
}; 