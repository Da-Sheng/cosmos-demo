import { useState, useEffect } from 'react';

// 定义交易类型
export interface Transaction {
  hash: string;
  height: number;
  timestamp: string;
  from: string;
  to: string;
  amount: string;
  denom: string;
  fee: string;
  status: 'success' | 'failed' | 'pending';
  memo?: string;
  type: string;
}

// 模拟交易数据
const mockTransactions: Transaction[] = Array.from({ length: 30 }, (_, i) => ({
  hash: `TX${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
  height: 12345 - Math.floor(i / 2),
  timestamp: new Date(Date.now() - i * 60000).toISOString(),
  from: `cosmos1${Math.random().toString(36).substring(2, 10)}`,
  to: `cosmos1${Math.random().toString(36).substring(2, 10)}`,
  amount: `${Math.floor(Math.random() * 1000) + 1}.${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
  denom: 'ATOM',
  fee: `0.${Math.floor(Math.random() * 100).toString().padStart(3, '0')}`,
  status: ['success', 'failed', 'pending'][Math.floor(Math.random() * 2.2)] as 'success' | 'failed' | 'pending',
  memo: Math.random() > 0.7 ? `Transfer ${i}` : undefined,
  type: ['transfer', 'delegate', 'undelegate', 'redelegate', 'reward'][Math.floor(Math.random() * 5)]
}));

// 交易钩子
export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 过滤和分页状态
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filter, setFilter] = useState<{
    status?: 'success' | 'failed' | 'pending';
    type?: string;
    address?: string;
  }>({});
  
  // 获取交易列表
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        // 模拟API延迟
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 过滤交易
        let filteredTxs = [...mockTransactions];
        
        if (filter.status) {
          filteredTxs = filteredTxs.filter(tx => tx.status === filter.status);
        }
        
        if (filter.type) {
          filteredTxs = filteredTxs.filter(tx => tx.type === filter.type);
        }
        
        if (filter.address) {
          filteredTxs = filteredTxs.filter(tx => 
            tx.from.includes(filter.address!) || tx.to.includes(filter.address!)
          );
        }
        
        setTransactions(filteredTxs);
        setLoading(false);
      } catch (err) {
        setError('获取交易数据失败');
        setLoading(false);
      }
    };
    
    fetchTransactions();
  }, [filter]);
  
  // 获取分页后的交易
  const getPaginatedTransactions = () => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return transactions.slice(startIndex, endIndex);
  };
  
  // 根据交易哈希获取详情
  const getTransactionByHash = async (hash: string): Promise<Transaction | null> => {
    setLoading(true);
    try {
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 800));
      const tx = mockTransactions.find(t => t.hash === hash);
      setLoading(false);
      return tx || null;
    } catch (err) {
      setError('获取交易详情失败');
      setLoading(false);
      return null;
    }
  };
  
  return {
    transactions: getPaginatedTransactions(),
    totalCount: transactions.length,
    loading,
    error,
    page,
    pageSize,
    setPage,
    setPageSize,
    setFilter,
    getTransactionByHash
  };
}; 