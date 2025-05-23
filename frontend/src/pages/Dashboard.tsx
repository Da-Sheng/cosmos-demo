import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Typography, List, Tag, Spin } from 'antd';
import { BlockOutlined, TransactionOutlined, NodeIndexOutlined, FieldTimeOutlined } from '@ant-design/icons';
import { useChainStatus } from '../hooks/useChainStatus';

const { Title } = Typography;

const Dashboard: React.FC = () => {
  const { chainStatus, latestBlocks, isLoading } = useChainStatus();

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p>Loading chain data...</p>
      </div>
    );
  }

  return (
    <div>
      <Title level={2}>Network Overview</Title>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Latest Block" 
              value={chainStatus?.latestHeight || 0} 
              prefix={<BlockOutlined />} 
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Total Transactions" 
              value={chainStatus?.txCount || 0} 
              prefix={<TransactionOutlined />} 
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Validators" 
              value={chainStatus?.validatorCount || 0} 
              prefix={<NodeIndexOutlined />} 
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Block Time" 
              value={chainStatus?.blockTime || '0.00'} 
              suffix="s" 
              precision={2} 
              prefix={<FieldTimeOutlined />} 
            />
          </Card>
        </Col>
      </Row>

      <Title level={3} style={{ marginTop: '24px' }}>Latest Blocks</Title>
      <List
        bordered
        dataSource={latestBlocks}
        renderItem={item => (
          <List.Item>
            <List.Item.Meta
              title={<span>Block #{item.height}</span>}
              description={`Transactions: ${item.txCount}`}
            />
            <div>
              <Tag color="blue">{item.proposer}</Tag>
              <span style={{ marginLeft: '8px' }}>{new Date(item.timestamp).toLocaleString()}</span>
            </div>
          </List.Item>
        )}
      />
    </div>
  );
};

export default Dashboard; 