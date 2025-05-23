import React, { useState } from 'react';
import { Card, Button, Input, Form, Select, Row, Col, Typography, List, Tag, Divider, message, Spin, Modal } from 'antd';
import { WalletOutlined, SendOutlined, KeyOutlined, CopyOutlined, PlusOutlined, SyncOutlined } from '@ant-design/icons';
import { useWallet, WalletTransaction } from '../hooks/useWallet';

const { Title, Text } = Typography;
const { Option } = Select;

const Wallet: React.FC = () => {
  const { 
    walletInfo, 
    connected, 
    loading, 
    accounts, 
    createAccount, 
    connectWallet, 
    disconnectWallet, 
    sendTransaction 
  } = useWallet();
  
  const [sendForm] = Form.useForm();
  const [createForm] = Form.useForm();
  const [isSending, setIsSending] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [sendVisible, setSendVisible] = useState(false);
  const [createVisible, setCreateVisible] = useState(false);
  
  // 连接钱包
  const handleConnect = async (address: string) => {
    const success = await connectWallet(address);
    if (success) {
      message.success('钱包已连接');
    }
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
  
  // 创建新账户
  const handleCreateAccount = async (values: { name: string }) => {
    setIsCreating(true);
    
    try {
      const result = await createAccount(values.name);
      if (result.success && result.account) {
        message.success(`账户 ${result.account.name} 已创建`);
        setCreateVisible(false);
        createForm.resetFields();
        // 连接到新创建的钱包
        await connectWallet(result.account.address);
      } else {
        message.error(result.error || '创建账户失败');
      }
    } catch (error) {
      message.error('创建账户处理失败');
    } finally {
      setIsCreating(false);
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
  
  // 未连接钱包展示连接界面或创建界面
  if (!connected || !walletInfo) {
    return (
      <div className="page-header">
        <Title className="page-title">连接钱包</Title>
        <p className="page-description">连接您的Cosmos钱包以管理资产和进行交易</p>
        
        <Card style={{ maxWidth: '500px', margin: '40px auto' }}>
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <WalletOutlined style={{ fontSize: '64px', color: '#1890ff', marginBottom: '20px' }} />
            <Title level={3}>您尚未连接钱包</Title>
            
            {accounts.length > 0 ? (
              <div>
                <p style={{ marginBottom: '20px' }}>选择一个账户进行连接:</p>
                <List
                  style={{ textAlign: 'left', marginBottom: '20px' }}
                  bordered
                  dataSource={accounts}
                  renderItem={account => (
                    <List.Item
                      actions={[
                        <Button 
                          type="primary" 
                          onClick={() => handleConnect(account.address)}
                        >
                          连接
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        title={account.name}
                        description={account.address}
                      />
                    </List.Item>
                  )}
                />
              </div>
            ) : (
              <p style={{ marginBottom: '20px' }}>您还没有账户，请先创建一个账户</p>
            )}
            
            <Button 
              type="primary" 
              size="large" 
              icon={<PlusOutlined />} 
              onClick={() => setCreateVisible(true)}
              style={{ marginRight: '10px' }}
            >
              创建新账户
            </Button>
          </div>
        </Card>
        
        {/* 创建账户表单 */}
        <Modal
          title="创建新账户"
          open={createVisible}
          onCancel={() => setCreateVisible(false)}
          footer={null}
        >
          <Form 
            form={createForm}
            layout="vertical"
            onFinish={handleCreateAccount}
          >
            <Form.Item
              name="name"
              label="账户名称"
              rules={[{ required: true, message: '请输入账户名称' }]}
            >
              <Input placeholder="输入账户名称" />
            </Form.Item>
            
            <Form.Item>
              <div style={{ textAlign: 'right' }}>
                <Button 
                  style={{ marginRight: 8 }} 
                  onClick={() => setCreateVisible(false)}
                >
                  取消
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={isCreating}
                >
                  创建账户
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Modal>
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
              <Text strong>账户名称:</Text>
              <div style={{ fontSize: '18px', margin: '5px 0' }}>
                {walletInfo.name}
              </div>
            </div>
            
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
                {walletInfo.totalBalance}
              </div>
              <Text type="secondary">{walletInfo.totalUsdValue}</Text>
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
            {walletInfo.balances.length > 0 ? (
              walletInfo.balances.map((balance, index) => (
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
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Text type="secondary">暂无资产</Text>
              </div>
            )}
          </Card>
        </Col>
        
        <Col xs={24} md={14}>
          <Card 
            title="交易历史"
            extra={
              <Button
                type="link"
                icon={<SyncOutlined />}
                onClick={() => connectWallet(walletInfo.address)}
              >
                刷新
              </Button>
            }
          >
            {walletInfo.transactions.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={walletInfo.transactions}
                renderItem={(item: WalletTransaction) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <span>
                          <Tag color={item.type === 'receive' ? 'green' : 'blue'}>
                            {item.type === 'receive' ? '接收' : '发送'}
                          </Tag>
                          {item.hash.substring(0, 8)}...{item.hash.substring(item.hash.length - 8)}
                        </span>
                      }
                      description={
                        <>
                          <div>金额: {item.amount} {item.denom}</div>
                          <div>
                            {item.type === 'receive' ? '从' : '至'}: 
                            {item.type === 'receive' 
                              ? item.from?.substring(0, 8) + '...' + item.from?.substring(item.from.length - 8)
                              : item.to?.substring(0, 8) + '...' + item.to?.substring(item.to.length - 8)
                            }
                          </div>
                        </>
                      }
                    />
                    <div>
                      <Tag color="default">{new Date(item.timestamp).toLocaleString()}</Tag>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Text type="secondary">暂无交易记录</Text>
              </div>
            )}
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
            initialValue={walletInfo.balances.length > 0 ? walletInfo.balances[0].denom : 'stake'}
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