import React, { useEffect, useState } from 'react';
import { Table, Typography, Tag, Card, Input, Button, Space, Modal, Descriptions, Collapse, Spin } from 'antd';
import { SearchOutlined, BlockOutlined } from '@ant-design/icons';
import { useBlocks } from '../hooks/useBlocks';

const { Title } = Typography;
const { Panel } = Collapse;

const Blocks: React.FC = () => {
  const { blocks, blockDetails, isLoading, isDetailsLoading, fetchBlocks, fetchBlockByHeight } = useBlocks();
  const [searchValue, setSearchValue] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  useEffect(() => {
    fetchBlocks();
  }, [fetchBlocks]);

  const handleSearch = () => {
    if (searchValue.trim() && !isNaN(Number(searchValue.trim()))) {
      fetchBlockByHeight(Number(searchValue.trim()));
    } else {
      fetchBlocks();
    }
  };

  const showBlockDetails = (height: number) => {
    fetchBlockByHeight(height);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const columns = [
    {
      title: 'Height',
      dataIndex: 'height',
      key: 'height',
      render: (height: number) => (
        <Button type="link" onClick={() => showBlockDetails(height)}>
          {height}
        </Button>
      ),
    },
    {
      title: 'Hash',
      dataIndex: 'hash',
      key: 'hash',
      render: (hash: string) => (
        <span title={hash}>
          {hash.substring(0, 10)}...{hash.substring(hash.length - 10)}
        </span>
      ),
    },
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: string) => new Date(timestamp).toLocaleString(),
    },
    {
      title: 'Transactions',
      dataIndex: 'txCount',
      key: 'txCount',
      render: (txCount: number) => (
        <Tag color={txCount > 0 ? 'green' : 'default'}>
          {txCount}
        </Tag>
      ),
    },
    {
      title: 'Proposer',
      dataIndex: 'proposer',
      key: 'proposer',
      render: (proposer: string) => (
        <span title={proposer}>
          {proposer.substring(0, 10)}...{proposer.substring(proposer.length - 10)}
        </span>
      ),
    },
    {
      title: 'Gas Used',
      dataIndex: 'gasUsed',
      key: 'gasUsed',
    },
    {
      title: 'Gas Limit',
      dataIndex: 'gasLimit',
      key: 'gasLimit',
    },
  ];

  return (
    <div>
      <Title level={2}>Blocks</Title>
      
      <Card style={{ marginBottom: '20px' }}>
        <Space>
          <Input
            placeholder="Search by block height"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            style={{ width: '300px' }}
            onPressEnter={handleSearch}
          />
          <Button 
            type="primary" 
            icon={<SearchOutlined />} 
            onClick={handleSearch}
          >
            Search
          </Button>
        </Space>
      </Card>
      
      <Table 
        columns={columns} 
        dataSource={blocks} 
        rowKey="height" 
        loading={isLoading}
        pagination={{ 
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} blocks`
        }}
      />

      <Modal
        title={<span><BlockOutlined /> Block Details</span>}
        open={isModalVisible}
        onCancel={closeModal}
        footer={[
          <Button key="close" onClick={closeModal}>
            Close
          </Button>
        ]}
        width={800}
      >
        {isDetailsLoading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin size="large" />
            <p>Loading block details...</p>
          </div>
        ) : blockDetails ? (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Height" span={2}>{blockDetails.height}</Descriptions.Item>
              <Descriptions.Item label="Hash" span={2}>{blockDetails.hash}</Descriptions.Item>
              <Descriptions.Item label="Timestamp">{new Date(blockDetails.timestamp).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="Transactions">{blockDetails.txCount}</Descriptions.Item>
              <Descriptions.Item label="Proposer">{blockDetails.proposer}</Descriptions.Item>
              <Descriptions.Item label="Gas Used / Limit">{blockDetails.gasUsed} / {blockDetails.gasLimit}</Descriptions.Item>
            </Descriptions>

            {blockDetails.transactions && blockDetails.transactions.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <Title level={4}>Transactions</Title>
                <Collapse>
                  {blockDetails.transactions.map((tx, index) => (
                    <Panel header={`Transaction #${index + 1}: ${tx.hash.substring(0, 20)}...`} key={index}>
                      <Descriptions bordered column={1} size="small">
                        <Descriptions.Item label="Hash">{tx.hash}</Descriptions.Item>
                        <Descriptions.Item label="Type">{tx.type}</Descriptions.Item>
                        <Descriptions.Item label="Status">
                          <Tag color={tx.status === 'success' ? 'success' : 'error'}>
                            {tx.status}
                          </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="From">{tx.sender}</Descriptions.Item>
                        <Descriptions.Item label="To">{tx.recipient}</Descriptions.Item>
                        <Descriptions.Item label="Amount">{tx.amount} {tx.denom}</Descriptions.Item>
                        <Descriptions.Item label="Gas Used">{tx.gasUsed}</Descriptions.Item>
                      </Descriptions>
                    </Panel>
                  ))}
                </Collapse>
              </div>
            )}
          </div>
        ) : (
          <div>No block details available</div>
        )}
      </Modal>
    </div>
  );
};

export default Blocks; 