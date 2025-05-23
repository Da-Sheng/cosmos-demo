import { useState, useEffect } from 'react';

// 定义链状态类型
export interface ChainStatus {
  latestHeight: number;
  latestBlocks: Array<{
    height: number;
    hash: string;
    timestamp: string;
    proposer: string;
    txCount: number;
  }>;
  blockTime: number; // 平均出块时间（秒）
  activeValidators: number;
  totalValidators: number;
  txCount: number; // 总交易数
  bondedTokens: string;
  inflation: string;
}

// 模拟链状态数据
const mockChainStatus: ChainStatus = {
  latestHeight: 12345,
  latestBlocks: Array.from({ length: 5 }, (_, i) => ({
    height: 12345 - i,
    hash: `B${Math.random().toString(36).substring(2, 15)}`,
    timestamp: new Date(Date.now() - i * 15000).toISOString(),
    proposer: `validator${(i % 5) + 1}`,
    txCount: Math.floor(Math.random() * 20)
  })),
  blockTime: 5.2, // 秒
  activeValidators: 42,
  totalValidators: 50,
  txCount: 98765,
  bondedTokens: '1,256,789,456 ATOM',
  inflation: '7.8%'
};

// 链状态钩子
export const useChainStatus = () => {
  const [chainStatus, setChainStatus] = useState<ChainStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChainStatus = async () => {
      try {
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 1200));
        setChainStatus(mockChainStatus);
        setLoading(false);
      } catch (err) {
        setError('获取链状态失败');
        setLoading(false);
      }
    };

    fetchChainStatus();
  }, []);

  return { chainStatus, loading, error };
}; 