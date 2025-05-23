import { useState, useEffect } from 'react';

// 定义区块和交易类型
export interface Transaction {
  hash: string;
  from: string;
  to: string;
  amount: string;
  fee: string;
  status: 'success' | 'failed' | 'pending';
  memo?: string;
  timestamp: string;
}

export interface Block {
  height: number;
  hash: string;
  timestamp: string;
  proposer: string;
  txCount: number;
  gasUsed: number;
  gasLimit: number;
  transactions: Transaction[];
}

// 区块详情接口
export interface BlockDetails extends Block {
  validatorHash: string;
  consensusHash: string;
  appHash: string;
  lastBlockHash: string;
}

// 模拟数据
const mockBlocks: Block[] = Array.from({ length: 20 }, (_, i) => ({
  height: 12345 - i,
  hash: `B${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
  timestamp: new Date(Date.now() - i * 10000).toISOString(),
  proposer: `validator${(i % 5) + 1}`,
  txCount: Math.floor(Math.random() * 20),
  gasUsed: Math.floor(Math.random() * 1000000),
  gasLimit: 2000000,
  transactions: Array.from({ length: Math.floor(Math.random() * 5) }, (_, j) => ({
    hash: `TX${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
    from: `cosmos1${Math.random().toString(36).substring(2, 10)}`,
    to: `cosmos1${Math.random().toString(36).substring(2, 10)}`,
    amount: `${Math.floor(Math.random() * 100)}.${Math.floor(Math.random() * 1000)} ATOM`,
    fee: `${Math.floor(Math.random() * 10) / 10} ATOM`,
    status: ['success', 'failed', 'pending'][Math.floor(Math.random() * 3)] as 'success' | 'failed' | 'pending',
    memo: Math.random() > 0.5 ? `Memo ${j}` : undefined,
    timestamp: new Date(Date.now() - (i * 10000 + j * 1000)).toISOString()
  }))
}));

// 钩子函数，获取区块列表
export const useBlocks = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        // 这里模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 1000));
        setBlocks(mockBlocks);
        setLoading(false);
      } catch (err) {
        setError('获取区块数据失败');
        setLoading(false);
      }
    };

    fetchBlocks();
  }, []);

  // 获取单个区块详情的函数
  const getBlockDetails = async (height: number): Promise<BlockDetails | null> => {
    setLoading(true);
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 800));
      const block = mockBlocks.find(b => b.height === height);
      if (!block) {
        setLoading(false);
        return null;
      }
      
      // 添加附加详情信息
      const details: BlockDetails = {
        ...block,
        validatorHash: `VL${Math.random().toString(36).substring(2, 15)}`,
        consensusHash: `CS${Math.random().toString(36).substring(2, 15)}`,
        appHash: `AP${Math.random().toString(36).substring(2, 15)}`,
        lastBlockHash: `B${Math.random().toString(36).substring(2, 15)}`
      };
      
      setLoading(false);
      return details;
    } catch (err) {
      setError('获取区块详情失败');
      setLoading(false);
      return null;
    }
  };

  return { blocks, loading, error, getBlockDetails };
}; 