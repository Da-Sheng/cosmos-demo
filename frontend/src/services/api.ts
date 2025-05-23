import axios from 'axios';

// API基础URL
const API_BASE_URL = 'http://127.0.0.1:4500'; // 使用代理路径

// 定义各种API响应类型
export interface HealthResponse {
  status: string;
}

export interface AccountResponse {
  success: boolean;
  account_name: string;
  address: string;
  output?: string;
  error?: string;
}

export interface BalanceData {
  balances: {
    denom: string;
    amount: string;
  }[];
  pagination: {
    next_key: string | null;
    total: string;
  };
}

export interface BalanceResponse {
  success: boolean;
  address: string;
  balance: BalanceData;
  error?: string;
}

export interface TransferResponse {
  success: boolean;
  from: string;
  to: string;
  amount: string;
  tx_hash: string;
  output?: string;
  error?: string;
}

export interface TransactionResponse {
  success: boolean;
  tx_hash: string;
  tx_data?: any;
  error?: string;
}

export interface NodeStatusResponse {
  success: boolean;
  status: any;
  error?: string;
}

// API服务类
class BlockchainApiService {
  // 健康检查
  async checkHealth(): Promise<HealthResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`);
      return response.data;
    } catch (error) {
      console.error('健康检查失败:', error);
      return { status: 'error' };
    }
  }

  // 创建账户
  async createAccount(name: string): Promise<AccountResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/create_account`, { name });
      return response.data;
    } catch (error) {
      console.error('创建账户失败:', error);
      return { 
        success: false, 
        account_name: name, 
        address: '', 
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  // 查询账户余额
  async getBalance(address: string): Promise<BalanceResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/account_balance`, {
        params: { address }
      });
      return response.data;
    } catch (error) {
      console.error('查询余额失败:', error);
      return { 
        success: false, 
        address, 
        balance: { 
          balances: [], 
          pagination: { next_key: null, total: '0' } 
        },
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  // 转账
  async transfer(from: string, to: string, amount: string, denom: string = 'stake'): Promise<TransferResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/transfer`, {
        from,
        to,
        amount,
        denom
      });
      return response.data;
    } catch (error) {
      console.error('转账失败:', error);
      return { 
        success: false, 
        from, 
        to, 
        amount: `${amount}${denom}`,
        tx_hash: '',
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  // 查询交易
  async queryTransaction(hash: string): Promise<TransactionResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/query_tx`, {
        params: { hash }
      });
      return response.data;
    } catch (error) {
      console.error('查询交易失败:', error);
      return { 
        success: false, 
        tx_hash: hash,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  // 获取节点状态
  async getNodeStatus(): Promise<NodeStatusResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/node_status`);
      return response.data;
    } catch (error) {
      console.error('获取节点状态失败:', error);
      return { 
        success: false, 
        status: null,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }
}

// 导出API服务实例
export const blockchainApi = new BlockchainApiService(); 