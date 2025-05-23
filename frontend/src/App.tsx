import React, { useState } from 'react';
import './App.css';
import { Dashboard, Blocks, Transactions, Wallet } from './pages';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'wallet':
        return <Wallet />;
      case 'transactions':
        return <Transactions />;
      case 'blocks':
        return <Blocks />;
      default:
        return <div>页面未找到</div>;
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>🚀 Cosmos Demo</h1>
        <p>区块链应用演示平台</p>
      </header>
      
      <nav className="app-nav">
        <button 
          className={activeTab === 'dashboard' ? 'nav-button active' : 'nav-button'}
          onClick={() => setActiveTab('dashboard')}
        >
          控制台
        </button>
        <button 
          className={activeTab === 'wallet' ? 'nav-button active' : 'nav-button'}
          onClick={() => setActiveTab('wallet')}
        >
          钱包
        </button>
        <button 
          className={activeTab === 'transactions' ? 'nav-button active' : 'nav-button'}
          onClick={() => setActiveTab('transactions')}
        >
          交易
        </button>
        <button 
          className={activeTab === 'blocks' ? 'nav-button active' : 'nav-button'}
          onClick={() => setActiveTab('blocks')}
        >
          区块
        </button>
      </nav>

      <main className="app-main">
        {renderContent()}
      </main>

      <footer className="app-footer">
        <p>Cosmos Demo © 2024 Created by Da-Sheng</p>
      </footer>
    </div>
  );
};

export default App; 