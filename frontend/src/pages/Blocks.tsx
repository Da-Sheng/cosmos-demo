import React, { useState } from 'react';
import { Table, Typography, Tag, Card, Input, Button, Space, Modal, Descriptions, Collapse, Spin } from 'antd';
import { SearchOutlined, BlockOutlined } from '@ant-design/icons';
import { useBlocks, Block, BlockDetails } from '../hooks/useBlocks';

const { Title } = Typography;
const { Panel } = Collapse;

const Blocks: React.FC = () => {
  const { blocks, loading, error, getBlockDetails } = useBlocks();
  const [searchText, setSearchText] = useState('');
  const [blockDetailsVisible, setBlockDetailsVisible] = useState(false);
  const [blockDetails, setBlockDetails] = useState<BlockDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // 处理查看区块详情
  const handleViewBlockDetails = async (height: number) => {
    setDetailsLoading(true);
    setBlockDetailsVisible(true);
    
    try {
      const details = await getBlockDetails(height);
      setBlockDetails(details);
    } catch (error) {
      console.error('获取区块详情失败:', error);
    } finally {
      setDetailsLoading(false);
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '高度',
      dataIndex: 'height',
      key: 'height',
      render: (height: number) => (
        <span className="block-height">{height}</span>
      ),
    },
    {
      title: '区块哈希',
      dataIndex: 'hash',
      key: 'hash',
      ellipsis: true,
      render: (hash: string) => (
        <span className="transaction-hash">{hash}</span>
      ),
    },
    {
      title: '提案者',
      dataIndex: 'proposer',
      key: 'proposer',
      render: (proposer: string) => (
        <Tag color="blue">{proposer}</Tag>
      ),
    },
    {
      title: '交易数',
      dataIndex: 'txCount',
      key: 'txCount',
      render: (txCount: number) => (
        <Tag color="green">{txCount}</Tag>
      ),
    },
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: string) => (
        <span>{new Date(timestamp).toLocaleString()}</span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: Block) => (
        <Button 
          type="link" 
          onClick={() => handleViewBlockDetails(record.height)}
          icon={<BlockOutlined />}
        >
          详情
        </Button>
      ),
    },
  ];

  // 过滤区块列表
  const getFilteredBlocks = () => {
    if (!searchText) {
      return blocks;
    }
    
    return blocks.filter(
      block => 
        block.height.toString().includes(searchText) || 
        block.hash.toLowerCase().includes(searchText.toLowerCase()) ||
        block.proposer.toLowerCase().includes(searchText.toLowerCase())
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
        <p style={{ marginTop: '20px' }}>加载区块数据...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>获取区块数据失败: {error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <Title className="page-title">区块列表</Title>
        <p className="page-description">查看区块链上的所有区块详情</p>
      </div>
      
      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Input
            placeholder="搜索区块高度/哈希/提案者"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
          />
        </Space>
        
        <Table 
          columns={columns}
          dataSource={getFilteredBlocks()}
          rowKey="height"
          pagination={{ pageSize: 10 }}
        />
      </Card>
      
      <Modal
        title={<span><BlockOutlined /> 区块详情</span>}
        open={blockDetailsVisible}
        onCancel={() => setBlockDetailsVisible(false)}
        footer={null}
        width={800}
      >
        {detailsLoading ? (
          <div className="loading-container">
            <Spin />
          </div>
        ) : blockDetails ? (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="高度" span={2}>{blockDetails.height}</Descriptions.Item>
              <Descriptions.Item label="时间" span={2}>{new Date(blockDetails.timestamp).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="哈希" span={2}>{blockDetails.hash}</Descriptions.Item>
              <Descriptions.Item label="提案者">{blockDetails.proposer}</Descriptions.Item>
              <Descriptions.Item label="交易数">{blockDetails.txCount}</Descriptions.Item>
              <Descriptions.Item label="Gas已使用">{blockDetails.gasUsed}</Descriptions.Item>
              <Descriptions.Item label="Gas限制">{blockDetails.gasLimit}</Descriptions.Item>
              <Descriptions.Item label="验证人哈希" span={2}>{blockDetails.validatorHash}</Descriptions.Item>
              <Descriptions.Item label="共识哈希" span={2}>{blockDetails.consensusHash}</Descriptions.Item>
              <Descriptions.Item label="应用哈希" span={2}>{blockDetails.appHash}</Descriptions.Item>
              <Descriptions.Item label="上一区块哈希" span={2}>{blockDetails.lastBlockHash}</Descriptions.Item>
            </Descriptions>
            
            {blockDetails.transactions && blockDetails.transactions.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <Title level={4}>Transactions</Title>
                <Collapse>
                  {blockDetails.transactions.map((tx, index) => (
                    <Panel header={`Transaction #${index + 1}: ${tx.hash.substring(0, 20)}...`} key={index}>
                      <Descriptions bordered column={1} size="small">
                        <Descriptions.Item label="Hash">{tx.hash}</Descriptions.Item>
                        <Descriptions.Item label="From">{tx.from}</Descriptions.Item>
                        <Descriptions.Item label="To">{tx.to}</Descriptions.Item>
                        <Descriptions.Item label="Amount">{tx.amount}</Descriptions.Item>
                        <Descriptions.Item label="Fee">{tx.fee}</Descriptions.Item>
                        <Descriptions.Item label="Status">
                          {tx.status === 'success' && <Tag color="green">Success</Tag>}
                          {tx.status === 'failed' && <Tag color="red">Failed</Tag>}
                          {tx.status === 'pending' && <Tag color="orange">Pending</Tag>}
                        </Descriptions.Item>
                        {tx.memo && <Descriptions.Item label="Memo">{tx.memo}</Descriptions.Item>}
                        <Descriptions.Item label="Timestamp">{new Date(tx.timestamp).toLocaleString()}</Descriptions.Item>
                      </Descriptions>
                    </Panel>
                  ))}
                </Collapse>
              </div>
            )}
          </div>
        ) : (
          <p>没有找到区块详情</p>
        )}
      </Modal>
    </div>
  );
};

export default Blocks; 