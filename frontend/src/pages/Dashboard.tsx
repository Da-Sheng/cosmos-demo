import React from 'react';
import { Card, Row, Col, Statistic, Typography, List, Tag, Spin } from 'antd';
import { BlockOutlined, TransactionOutlined, NodeIndexOutlined, FieldTimeOutlined } from '@ant-design/icons';
import { useChainStatus, ChainStatus } from '../hooks/useChainStatus';

const { Title } = Typography;

const Dashboard: React.FC = () => {
  const { chainStatus, loading, error } = useChainStatus();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p style={{ marginTop: '20px' }}>加载数据中...</p>
      </div>
    );
  }

  if (error || !chainStatus) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
        <p>加载数据失败: {error || '未知错误'}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <Title className="page-title">区块链概览</Title>
        <p className="page-description">Cosmos区块链网络的实时状态和统计数据</p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stats-card">
            <Statistic
              title="最新区块高度"
              value={chainStatus.latestHeight}
              prefix={<BlockOutlined />}
              className="stats-number"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stats-card">
            <Statistic
              title="交易总数"
              value={chainStatus.txCount}
              prefix={<TransactionOutlined />}
              className="stats-number"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stats-card">
            <Statistic
              title="验证节点"
              value={chainStatus.activeValidators}
              suffix={`/${chainStatus.totalValidators}`}
              prefix={<NodeIndexOutlined />}
              className="stats-number"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stats-card">
            <Statistic
              title="出块时间"
              value={chainStatus.blockTime}
              suffix="秒"
              prefix={<FieldTimeOutlined />}
              precision={1}
              className="stats-number"
            />
          </Card>
        </Col>
      </Row>

      <Card title="最新区块" style={{ marginTop: '24px' }}>
        <List
          dataSource={chainStatus.latestBlocks}
          renderItem={(item) => (
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
      </Card>
    </div>
  );
};

export default Dashboard; 