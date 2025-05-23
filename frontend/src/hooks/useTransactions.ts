import { useState, useCallback } from 'react';
import { StargateClient } from '@cosmjs/stargate';

const RPC_ENDPOINT = 'http://localhost:26657';

export type Transaction = {
  hash: string;
  height: number;
  type: string;
  status: string;
  timestamp: string;
  sender: string;
  recipient: string;
  amount: string;
  denom: string;
  fee: string;
  memo?: string;
  gasUsed: number;
  gasWanted: number;
};

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTransactionLoading, setIsTransactionLoading] = useState<boolean>(false);

  // 获取最近的交易
  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      // 使用模拟数据代替连接实际区块链节点
      // const client = await StargateClient.connect(RPC_ENDPOINT);
      // const latestHeight = await client.getHeight();
      
      // 模拟区块高度
      const latestHeight = Math.floor(100000 + Math.random() * 1000);
      
      const mockTransactions: Transaction[] = [];
      for (let i = 0; i < 10; i++) {
        const height = latestHeight - Math.floor(Math.random() * 10);
        if (height <= 0) continue;
        
        mockTransactions.push({
          hash: `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
          height,
          type: Math.random() > 0.5 ? 'transfer' : 'delegate',
          status: Math.random() > 0.1 ? 'success' : 'failed',
          timestamp: new Date(Date.now() - i * 600000).toISOString(),
          sender: `cosmos1sender${Math.random().toString(16).substring(2, 10)}`,
          recipient: `cosmos1recipient${Math.random().toString(16).substring(2, 10)}`,
          amount: (Math.random() * 1000).toFixed(0),
          denom: 'udemo',
          fee: '0.01',
          memo: Math.random() > 0.5 ? '交易备注' : undefined,
          gasUsed: Math.floor(Math.random() * 50000),
          gasWanted: 200000,
        });
      }
      
      setTransactions(mockTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 根据哈希获取特定交易
  const fetchTransactionByHash = useCallback(async (hash: string) => {
    setIsTransactionLoading(true);
    try {
      // 在实际应用中，这里会连接到Cosmos节点并获取特定哈希的交易数据
      // 目前使用模拟数据
      const mockTransaction: Transaction = {
        hash,
        height: Math.floor(1000 + Math.random() * 1000),
        type: Math.random() > 0.5 ? 'transfer' : 'delegate',
        status: Math.random() > 0.1 ? 'success' : 'failed',
        timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        sender: `cosmos1sender${Math.random().toString(16).substring(2, 10)}`,
        recipient: `cosmos1recipient${Math.random().toString(16).substring(2, 10)}`,
        amount: (Math.random() * 1000).toFixed(0),
        denom: 'udemo',
        fee: '0.01',
        memo: Math.random() > 0.5 ? '交易备注' : undefined,
        gasUsed: Math.floor(Math.random() * 50000),
        gasWanted: 200000,
      };
      
      setTransaction(mockTransaction);
      
      // 如果是搜索单个交易，也更新transactions列表
      setTransactions([mockTransaction]);
      
    } catch (error) {
      console.error(`Error fetching transaction with hash ${hash}:`, error);
    } finally {
      setIsTransactionLoading(false);
    }
  }, []);

  return {
    transactions,
    transaction,
    isLoading,
    isTransactionLoading,
    fetchTransactions,
    fetchTransactionByHash,
  };
}; 