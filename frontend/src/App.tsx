import React from 'react';
import { Layout, Menu, theme } from 'antd';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';
import Dashboard from './pages/Dashboard';
import Wallet from './pages/Wallet';
import Transactions from './pages/Transactions';
import Blocks from './pages/Blocks';

const { Header, Content, Footer, Sider } = Layout;

const App: React.FC = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  
  const location = useLocation();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
      >
        <div className="logo" style={{ height: '32px', margin: '16px', color: '#fff', textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>
          Cosmos Demo
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={[
            {
              key: '/',
              label: <Link to="/">Dashboard</Link>,
            },
            {
              key: '/wallet',
              label: <Link to="/wallet">Wallet</Link>,
            },
            {
              key: '/transactions',
              label: <Link to="/transactions">Transactions</Link>,
            },
            {
              key: '/blocks',
              label: <Link to="/blocks">Blocks</Link>,
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }} />
        <Content style={{ margin: '24px 16px 0' }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/blocks" element={<Blocks />} />
            </Routes>
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Cosmos Demo ©{new Date().getFullYear()} Created by Da-Sheng
        </Footer>
      </Layout>
    </Layout>
  );
};

export default App; 