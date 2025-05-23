import React, { useEffect, useState } from 'react';
import { Table, Typography, Tag, Card, Input, Space, Button, Tooltip } from 'antd';
import { SearchOutlined, CheckCircleOutlined, CloseCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { useTransactions } from '../hooks/useTransactions';

const { Title } = Typography;

const Transactions: React.FC = () => {
  const { transactions, isLoading, fetchTransactions, fetchTransactionByHash } = useTransactions();
  const [searchValue, setSearchValue] = useState<string>('');

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleSearch = () => {
    if (searchValue.trim()) {
      fetchTransactionByHash(searchValue.trim());
    } else {
      fetchTransactions();
    }
  };

  const columns = [
    {
      title: 'Hash',
      dataIndex: 'hash',
      key: 'hash',
      render: (hash: string) => (
        <Tooltip title={hash}>
          <span>{hash.substring(0, 8)}...{hash.substring(hash.length - 8)}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        if (status === 'success') {
          return <Tag icon={<CheckCircleOutlined />} color="success">Success</Tag>;
        } else if (status === 'pending') {
          return <Tag icon={<SyncOutlined spin />} color="processing">Pending</Tag>;
        } else {
          return <Tag icon={<CloseCircleOutlined />} color="error">Failed</Tag>;
        }
      },
    },
    {
      title: 'Height',
      dataIndex: 'height',
      key: 'height',
    },
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: string) => new Date(timestamp).toLocaleString(),
    },
    {
      title: 'From',
      dataIndex: 'sender',
      key: 'sender',
      render: (sender: string) => (
        <Tooltip title={sender}>
          <span>{sender.substring(0, 8)}...{sender.substring(sender.length - 8)}</span>
        </Tooltip>
      ),
    },
    {
      title: 'To',
      dataIndex: 'recipient',
      key: 'recipient',
      render: (recipient: string) => (
        <Tooltip title={recipient}>
          <span>{recipient.substring(0, 8)}...{recipient.substring(recipient.length - 8)}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: string, record: any) => `${amount} ${record.denom}`,
    },
  ];

  return (
    <div>
      <Title level={2}>Transactions</Title>
      
      <Card style={{ marginBottom: '20px' }}>
        <Space>
          <Input
            placeholder="Search by transaction hash"
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
        dataSource={transactions} 
        rowKey="hash" 
        loading={isLoading}
        pagination={{ 
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} transactions`
        }}
      />
    </div>
  );
};

export default Transactions; 