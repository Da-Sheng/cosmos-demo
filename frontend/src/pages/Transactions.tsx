import React, { useState } from 'react';
import { Table, Typography, Tag, Card, Input, Space, Button, Tooltip } from 'antd';
import { SearchOutlined, CheckCircleOutlined, CloseCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { useTransactions, Transaction } from '../hooks/useTransactions';

const { Title } = Typography;

const Transactions: React.FC = () => {
  const { 
    transactions, 
    totalCount,
    loading, 
    error,
    page,
    pageSize,
    setPage,
    setPageSize,
    setFilter
  } = useTransactions();
  
  const [searchText, setSearchText] = useState('');

  // 处理搜索
  const handleSearch = () => {
    if (searchText.trim()) {
      setFilter({ address: searchText.trim() });
    } else {
      setFilter({});
    }
  };

  // 处理状态筛选
  const handleStatusFilter = (status?: 'success' | 'failed' | 'pending') => {
    setFilter({ status });
  };

  // 表格列配置
  const columns = [
    {
      title: '交易哈希',
      dataIndex: 'hash',
      key: 'hash',
      ellipsis: true,
      render: (hash: string) => (
        <Tooltip title={hash}>
          <span className="transaction-hash">{hash.substring(0, 8)}...{hash.substring(hash.length - 8)}</span>
        </Tooltip>
      ),
    },
    {
      title: '区块',
      dataIndex: 'height',
      key: 'height',
      render: (height: number) => (
        <Tag color="purple">{height}</Tag>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        let color = 'blue';
        if (type === 'delegate') color = 'cyan';
        if (type === 'undelegate') color = 'orange';
        if (type === 'reward') color = 'gold';
        
        return <Tag color={color}>{type}</Tag>;
      },
    },
    {
      title: '金额',
      key: 'amount',
      render: (_: unknown, record: Transaction) => (
        <span>{record.amount} {record.denom}</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let icon = null;
        let color = '';
        
        if (status === 'success') {
          icon = <CheckCircleOutlined />;
          color = 'green';
        } else if (status === 'failed') {
          icon = <CloseCircleOutlined />;
          color = 'red';
        } else {
          icon = <SyncOutlined spin />;
          color = 'orange';
        }
        
        return (
          <Tag color={color} icon={icon}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Tag>
        );
      },
    },
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: string) => new Date(timestamp).toLocaleString(),
    },
  ];

  if (loading && transactions.length === 0) {
    return (
      <div className="loading-container">
        <Title level={3}>加载交易数据...</Title>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <Title level={3}>获取交易数据失败</Title>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <Title className="page-title">交易列表</Title>
        <p className="page-description">查看区块链上的所有交易记录</p>
      </div>
      
      <Card style={{ marginBottom: 16 }}>
        <Space style={{ marginBottom: 16 }}>
          <Input
            placeholder="搜索地址"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
          />
          <Button type="primary" onClick={handleSearch}>
            搜索
          </Button>
          <Button onClick={() => setFilter({})}>
            重置
          </Button>
        </Space>
        
        <Space>
          <span>状态筛选:</span>
          <Button 
            type="link" 
            onClick={() => handleStatusFilter('success')}
          >
            <Tag color="green" icon={<CheckCircleOutlined />}>成功</Tag>
          </Button>
          <Button 
            type="link" 
            onClick={() => handleStatusFilter('failed')}
          >
            <Tag color="red" icon={<CloseCircleOutlined />}>失败</Tag>
          </Button>
          <Button 
            type="link" 
            onClick={() => handleStatusFilter('pending')}
          >
            <Tag color="orange" icon={<SyncOutlined spin />}>处理中</Tag>
          </Button>
          <Button 
            type="link" 
            onClick={() => handleStatusFilter()}
          >
            全部
          </Button>
        </Space>
      </Card>
      
      <Table 
        columns={columns} 
        dataSource={transactions} 
        rowKey="hash"
        loading={loading}
        pagination={{
          current: page,
          pageSize: pageSize,
          total: totalCount,
          onChange: (newPage) => setPage(newPage),
          onShowSizeChange: (_, newSize) => setPageSize(newSize),
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 笔交易`
        }}
      />
    </div>
  );
};

export default Transactions; 