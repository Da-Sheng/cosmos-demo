import React, { useState } from 'react';
import { Card, Button, Input, Form, Select, Row, Col, Typography, List, Tag, Divider, message, Spin, Modal } from 'antd';
import { WalletOutlined, SendOutlined, KeyOutlined, CopyOutlined } from '@ant-design/icons';
import { useWallet, WalletTransaction } from '../hooks/useWallet';

const { Title, Text } = Typography;
const { Option } = Select;

const Wallet: React.FC = () => {
  const { walletInfo, connected, loading, connectWallet, disconnectWallet, sendTransaction } = useWallet();
  
  const [sendForm] = Form.useForm();
  const [isSending, setIsSending] = useState(false);
  const [sendVisible, setSendVisible] = useState(false);
  
  // 连接钱包
  const handleConnect = async () => {
    await connectWallet();
  };
  
  // 断开连接
  const handleDisconnect = () => {
    disconnectWallet();
    message.success('钱包已断开连接');
  };
  
  // 复制地址
  const copyAddress = () => {
    if (walletInfo?.address) {
      navigator.clipboard.writeText(walletInfo.address);
      message.success('地址已复制到剪贴板');
    }
  };
  
  // 发送交易
  const handleSend = async (values: any) => {
    setIsSending(true);
    
    try {
      const result = await sendTransaction(
        values.recipient,
        values.amount,
        values.denom,
        values.memo
      );
      
      if (result.success) {
        message.success('交易发送成功');
        setSendVisible(false);
        sendForm.resetFields();
      } else {
        message.error(result.error || '交易发送失败');
      }
    } catch (error) {
      message.error('交易处理失败');
    } finally {
      setIsSending(false);
    }
  };
  
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p style={{ marginTop: '20px' }}>加载钱包数据...</p>
      </div>
    );
  }
  
  // 未连接钱包展示连接界面
  if (!connected || !walletInfo) {
    return (
      <div className="page-header">
        <Title className="page-title">连接钱包</Title>
        <p className="page-description">连接您的Cosmos钱包以管理资产和进行交易</p>
        
        <Card style={{ maxWidth: '500px', margin: '40px auto' }}>
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <WalletOutlined style={{ fontSize: '64px', color: '#1890ff', marginBottom: '20px' }} />
            <Title level={3}>您尚未连接钱包</Title>
            <p style={{ marginBottom: '30px' }}>点击下方按钮连接您的Cosmos钱包</p>
            <Button 
              type="primary" 
              size="large" 
              icon={<WalletOutlined />} 
              onClick={handleConnect}
              loading={loading}
            >
              连接钱包
            </Button>
          </div>
        </Card>
      </div>
    );
  }
  
  return (
    <div>
      <div className="page-header">
        <Title className="page-title">我的钱包</Title>
        <p className="page-description">管理您的资产和交易</p>
      </div>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} md={10}>
          <Card title="钱包信息" extra={<Button type="link" onClick={handleDisconnect}>断开连接</Button>}>
            <div style={{ marginBottom: '20px' }}>
              <Text strong>钱包地址:</Text>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: '5px' }}>
                <Input value={walletInfo.address} readOnly />
                <Button icon={<CopyOutlined />} onClick={copyAddress} style={{ marginLeft: '8px' }} />
              </div>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <Text strong>总余额:</Text>
              <div style={{ fontSize: '24px', fontWeight: 'bold', margin: '5px 0' }}>
                {walletInfo.totalBalance} ATOM
              </div>
              <Text type="secondary">≈ {walletInfo.totalUsdValue}</Text>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <Text strong>可用余额:</Text>
              <div style={{ fontSize: '18px', margin: '5px 0' }}>
                {walletInfo.availableBalance} ATOM
              </div>
            </div>
            
            <Button 
              type="primary" 
              icon={<SendOutlined />} 
              onClick={() => setSendVisible(true)}
              style={{ width: '100%' }}
            >
              发送代币
            </Button>
          </Card>
          
          <Card title="资产列表" style={{ marginTop: '16px' }}>
            {walletInfo.balances.map((balance, index) => (
              <div 
                key={balance.denom} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '10px 0',
                  borderBottom: index < walletInfo.balances.length - 1 ? '1px solid #f0f0f0' : 'none'
                }}
              >
                <div>
                  <div style={{ fontWeight: 'bold' }}>{balance.denom}</div>
                  {balance.usdValue && <Text type="secondary">{balance.usdValue}</Text>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div>{balance.amount}</div>
                </div>
              </div>
            ))}
          </Card>
        </Col>
        
        <Col xs={24} md={14}>
          <Card title="交易历史">
            <List
              itemLayout="horizontal"
              dataSource={walletInfo.transactions}
              renderItem={(item: WalletTransaction) => (
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
          </Card>
        </Col>
      </Row>
      
      {/* 发送交易表单 */}
      <Modal
        title="发送代币"
        open={sendVisible}
        onCancel={() => setSendVisible(false)}
        footer={null}
      >
        <Form 
          form={sendForm}
          layout="vertical"
          onFinish={handleSend}
        >
          <Form.Item
            name="recipient"
            label="接收地址"
            rules={[{ required: true, message: '请输入接收地址' }]}
          >
            <Input placeholder="cosmos1..." />
          </Form.Item>
          
          <Form.Item
            name="amount"
            label="金额"
            rules={[{ required: true, message: '请输入金额' }]}
          >
            <Input type="number" placeholder="0.0" min="0.1" step="0.1" />
          </Form.Item>
          
          <Form.Item
            name="denom"
            label="代币"
            initialValue="ATOM"
            rules={[{ required: true, message: '请选择代币' }]}
          >
            <Select>
              {walletInfo.balances.map(balance => (
                <Option key={balance.denom} value={balance.denom}>{balance.denom}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="memo"
            label="备注"
          >
            <Input placeholder="可选" />
          </Form.Item>
          
          <Form.Item>
            <div style={{ textAlign: 'right' }}>
              <Button 
                style={{ marginRight: 8 }} 
                onClick={() => setSendVisible(false)}
              >
                取消
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={isSending}
                icon={<SendOutlined />}
              >
                发送
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Wallet; 