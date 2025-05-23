import { useState, useCallback, useEffect } from 'react';
import { StargateClient } from '@cosmjs/stargate';

const RPC_ENDPOINT = 'http://localhost:26657';

export type LatestBlock = {
  height: number;
  hash: string;
  timestamp: string;
  txCount: number;
  proposer: string;
};

export type ChainStatus = {
  latestHeight: number;
  blockTime: number; // 毫秒
  txCount: number;
  validatorCount: number;
};

export const useChainStatus = () => {
  const [chainStatus, setChainStatus] = useState<ChainStatus | null>(null);
  const [latestBlocks, setLatestBlocks] = useState<LatestBlock[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchChainStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      // 使用模拟数据，不实际连接到区块链节点
      // const client = await StargateClient.connect(RPC_ENDPOINT);
      // const latestHeight = await client.getHeight();
      
      // 模拟的区块高度
      const latestHeight = Math.floor(100000 + Math.random() * 1000);
      
      // 模拟最近的区块数据
      const blocks: LatestBlock[] = [];
      for (let i = 0; i < 5; i++) {
        const height = latestHeight - i;
        if (height <= 0) break;
        
        blocks.push({
          height,
          hash: `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
          timestamp: new Date(Date.now() - i * 600000).toISOString(),
          txCount: Math.floor(Math.random() * 5),
          proposer: `validator${Math.floor(Math.random() * 10) + 1}`
        });
      }
      
      // 设置链状态
      setChainStatus({
        latestHeight: latestHeight,
        blockTime: 6.0, // 6秒
        txCount: Math.floor(10000 + Math.random() * 5000),
        validatorCount: 100,
      });
      
      setLatestBlocks(blocks);
    } catch (error) {
      console.error('Error fetching chain status:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 初始化时获取一次链状态
  useEffect(() => {
    fetchChainStatus();
    
    // 每60秒自动刷新一次
    const interval = setInterval(() => {
      fetchChainStatus();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [fetchChainStatus]);

  return {
    chainStatus,
    latestBlocks,
    isLoading,
    fetchChainStatus,
  };
}; 