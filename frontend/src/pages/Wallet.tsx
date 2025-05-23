import React, { useState } from 'react';
import { Card, Button, Input, Form, Select, Row, Col, Typography, List, Tag, Divider, message, Spin } from 'antd';
import { WalletOutlined, SendOutlined, KeyOutlined, CopyOutlined } from '@ant-design/icons';
import { useWallet } from '../hooks/useWallet';

const { Title, Text } = Typography;
const { Option } = Select;

const Wallet: React.FC = () => {
  const [form] = Form.useForm();
  const [transferForm] = Form.useForm();
  const { 
    account, 
    balance, 
    isConnected, 
    isLoading, 
    connectWallet, 
    createWallet, 
    sendTokens, 
    transactions 
  } = useWallet();

  const onConnect = () => {
    form.validateFields().then(values => {
      connectWallet(values.mnemonic);
    });
  };

  const onCreateWallet = () => {
    createWallet();
  };

  const onSendTokens = () => {
    transferForm.validateFields().then(values => {
      sendTokens(values.recipient, values.amount);
      transferForm.resetFields();
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      message.success('Copied to clipboard');
    });
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p>Loading wallet data...</p>
      </div>
    );
  }

  return (
    <div>
      <Title level={2}>Wallet</Title>
      
      {!isConnected ? (
        <Card title="Connect Wallet" style={{ marginBottom: '20px' }}>
          <Form form={form} layout="vertical">
            <Form.Item 
              name="mnemonic" 
              label="Mnemonic Phrase"
              rules={[{ required: true, message: 'Please input your mnemonic phrase' }]}
            >
              <Input.TextArea rows={4} placeholder="Enter your 24-word mnemonic phrase" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" onClick={onConnect} icon={<WalletOutlined />} style={{ marginRight: '10px' }}>
                Connect Existing Wallet
              </Button>
              <Button onClick={onCreateWallet} icon={<KeyOutlined />}>
                Create New Wallet
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ) : (
        <>
          <Row gutter={16}>
            <Col span={12}>
              <Card title="Account Information" style={{ marginBottom: '20px' }}>
                <div style={{ marginBottom: '10px' }}>
                  <Text strong>Address: </Text>
                  <Text copyable>{account?.address}</Text>
                </div>
                <div>
                  <Text strong>Balance: </Text>
                  <Text>{balance?.amount || 0} {balance?.denom || 'UDEMO'}</Text>
                </div>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Send Tokens" style={{ marginBottom: '20px' }}>
                <Form form={transferForm} layout="vertical">
                  <Form.Item 
                    name="recipient" 
                    label="Recipient Address"
                    rules={[{ required: true, message: 'Please input recipient address' }]}
                  >
                    <Input placeholder="cosmos1..." />
                  </Form.Item>
                  <Form.Item 
                    name="amount" 
                    label="Amount"
                    rules={[{ required: true, message: 'Please input amount' }]}
                  >
                    <Input type="number" placeholder="Amount" addonAfter="UDEMO" />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" onClick={onSendTokens} icon={<SendOutlined />}>
                      Send
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </Col>
          </Row>

          <Divider orientation="left">Recent Transactions</Divider>
          <List
            bordered
            dataSource={transactions}
            renderItem={item => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <span>
                      <Tag color={item.type === 'receive' ? 'green' : 'blue'}>
                        {item.type === 'receive' ? 'Received' : 'Sent'}
                      </Tag>
                      {item.hash}
                    </span>
                  }
                  description={`${item.amount} ${item.denom}`}
                />
                <div>
                  <Tag color="default">{new Date(item.timestamp).toLocaleString()}</Tag>
                </div>
              </List.Item>
            )}
          />
        </>
      )}
    </div>
  );
};

export default Wallet; 