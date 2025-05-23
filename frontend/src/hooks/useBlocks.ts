import { useState, useCallback } from 'react';
import { StargateClient } from '@cosmjs/stargate';

const RPC_ENDPOINT = 'http://localhost:26657';

type Block = {
  height: number;
  hash: string;
  timestamp: string;
  proposer: string;
  txCount: number;
  gasUsed: number;
  gasLimit: number;
};

type Transaction = {
  hash: string;
  type: string;
  status: string;
  sender: string;
  recipient: string;
  amount: string;
  denom: string;
  gasUsed: number;
};

type BlockDetails = Block & {
  transactions: Transaction[];
};

export const useBlocks = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [blockDetails, setBlockDetails] = useState<BlockDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDetailsLoading, setIsDetailsLoading] = useState<boolean>(false);

  // 获取最新的区块
  const fetchBlocks = useCallback(async () => {
    setIsLoading(true);
    try {
      // 使用模拟数据代替连接实际区块链节点
      // const client = await StargateClient.connect(RPC_ENDPOINT);
      // const latestHeight = await client.getHeight();
      
      // 模拟区块高度
      const latestHeight = Math.floor(100000 + Math.random() * 1000);
      
      const mockBlocks: Block[] = [];
      for (let i = 0; i < 10; i++) {
        const height = latestHeight - i;
        if (height <= 0) break;
        
        mockBlocks.push({
          height,
          hash: `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
          timestamp: new Date(Date.now() - i * 600000).toISOString(),
          proposer: `cosmos1validator${Math.random().toString(16).substring(2, 10)}`,
          txCount: Math.floor(Math.random() * 5),
          gasUsed: Math.floor(Math.random() * 100000),
          gasLimit: 200000,
        });
      }
      
      setBlocks(mockBlocks);
    } catch (error) {
      console.error('Error fetching blocks:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 根据高度获取特定区块
  const fetchBlockByHeight = useCallback(async (height: number) => {
    setIsDetailsLoading(true);
    try {
      // 在实际应用中，这里会连接到Cosmos节点并获取特定高度的区块数据
      // 目前使用模拟数据
      const mockBlock: Block = {
        height,
        hash: `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
        timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        proposer: `cosmos1validator${Math.random().toString(16).substring(2, 10)}`,
        txCount: Math.floor(Math.random() * 5),
        gasUsed: Math.floor(Math.random() * 100000),
        gasLimit: 200000,
      };
      
      // 生成模拟交易
      const mockTransactions: Transaction[] = [];
      for (let i = 0; i < mockBlock.txCount; i++) {
        mockTransactions.push({
          hash: `0x${Math.random().toString(16).substring(2, 30)}`,
          type: Math.random() > 0.5 ? 'transfer' : 'delegate',
          status: Math.random() > 0.1 ? 'success' : 'failed',
          sender: `cosmos1sender${Math.random().toString(16).substring(2, 10)}`,
          recipient: `cosmos1recipient${Math.random().toString(16).substring(2, 10)}`,
          amount: (Math.random() * 1000).toFixed(0),
          denom: 'udemo',
          gasUsed: Math.floor(Math.random() * 50000),
        });
      }
      
      setBlockDetails({
        ...mockBlock,
        transactions: mockTransactions,
      });
      
      // 如果是搜索单个区块，也更新blocks列表
      setBlocks([mockBlock]);
      
    } catch (error) {
      console.error(`Error fetching block at height ${height}:`, error);
    } finally {
      setIsDetailsLoading(false);
    }
  }, []);

  return {
    blocks,
    blockDetails,
    isLoading,
    isDetailsLoading,
    fetchBlocks,
    fetchBlockByHeight,
  };
}; 