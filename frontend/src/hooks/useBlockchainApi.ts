import { useState, useCallback } from 'react';
import { 
  blockchainApi, 
  HealthResponse, 
  AccountResponse, 
  BalanceResponse, 
  TransferResponse, 
  TransactionResponse, 
  NodeStatusResponse
} from '../services/api';

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useBlockchainApi() {
  // 健康状态
  const [healthState, setHealthState] = useState<ApiState<HealthResponse>>({
    data: null,
    loading: false,
    error: null
  });

  // 账户状态
  const [accountState, setAccountState] = useState<ApiState<AccountResponse>>({
    data: null,
    loading: false,
    error: null
  });

  // 余额状态
  const [balanceState, setBalanceState] = useState<ApiState<BalanceResponse>>({
    data: null,
    loading: false,
    error: null
  });

  // 转账状态
  const [transferState, setTransferState] = useState<ApiState<TransferResponse>>({
    data: null,
    loading: false,
    error: null
  });

  // 交易状态
  const [transactionState, setTransactionState] = useState<ApiState<TransactionResponse>>({
    data: null,
    loading: false,
    error: null
  });

  // 节点状态
  const [nodeStatusState, setNodeStatusState] = useState<ApiState<NodeStatusResponse>>({
    data: null,
    loading: false,
    error: null
  });

  // 健康检查
  const checkHealth = useCallback(async () => {
    setHealthState({ data: null, loading: true, error: null });
    try {
      const response = await blockchainApi.checkHealth();
      setHealthState({ data: response, loading: false, error: null });
      return response;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      setHealthState({ data: null, loading: false, error: errorMsg });
      throw error;
    }
  }, []);

  // 创建账户
  const createAccount = useCallback(async (name: string) => {
    setAccountState({ data: null, loading: true, error: null });
    try {
      const response = await blockchainApi.createAccount(name);
      if (!response.success && response.error) {
        throw new Error(response.error);
      }
      setAccountState({ data: response, loading: false, error: null });
      return response;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      setAccountState({ data: null, loading: false, error: errorMsg });
      throw error;
    }
  }, []);

  // 查询余额
  const getBalance = useCallback(async (address: string) => {
    setBalanceState({ data: null, loading: true, error: null });
    try {
      const response = await blockchainApi.getBalance(address);
      if (!response.success && response.error) {
        throw new Error(response.error);
      }
      setBalanceState({ data: response, loading: false, error: null });
      return response;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      setBalanceState({ data: null, loading: false, error: errorMsg });
      throw error;
    }
  }, []);

  // 转账
  const transfer = useCallback(async (from: string, to: string, amount: string, denom?: string) => {
    setTransferState({ data: null, loading: true, error: null });
    try {
      const response = await blockchainApi.transfer(from, to, amount, denom);
      if (!response.success && response.error) {
        throw new Error(response.error);
      }
      setTransferState({ data: response, loading: false, error: null });
      return response;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      setTransferState({ data: null, loading: false, error: errorMsg });
      throw error;
    }
  }, []);

  // 查询交易
  const queryTransaction = useCallback(async (hash: string) => {
    setTransactionState({ data: null, loading: true, error: null });
    try {
      const response = await blockchainApi.queryTransaction(hash);
      if (!response.success && response.error) {
        throw new Error(response.error);
      }
      setTransactionState({ data: response, loading: false, error: null });
      return response;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      setTransactionState({ data: null, loading: false, error: errorMsg });
      throw error;
    }
  }, []);

  // 获取节点状态
  const getNodeStatus = useCallback(async () => {
    setNodeStatusState({ data: null, loading: true, error: null });
    try {
      const response = await blockchainApi.getNodeStatus();
      if (!response.success && response.error) {
        throw new Error(response.error);
      }
      setNodeStatusState({ data: response, loading: false, error: null });
      return response;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      setNodeStatusState({ data: null, loading: false, error: errorMsg });
      throw error;
    }
  }, []);

  return {
    healthState,
    accountState,
    balanceState,
    transferState,
    transactionState,
    nodeStatusState,
    checkHealth,
    createAccount,
    getBalance,
    transfer,
    queryTransaction,
    getNodeStatus
  };
} 