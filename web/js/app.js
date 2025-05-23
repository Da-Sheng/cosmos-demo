// 全局变量
let currentTab = 'blockchain';
let wallets = [];
let transactions = [];
let minerInfo = {};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 区块链钱包浏览器启动');
    initializeApp();
    setupEventListeners();
    loadInitialData();
});

// 初始化应用
function initializeApp() {
    console.log('⚙️ 初始化应用');
    updateChainStatus();
    
    // 每5秒更新一次状态
    setInterval(updateChainStatus, 5000);
    
    // 每10秒更新一次钱包和交易数据
    setInterval(() => {
        if (currentTab === 'wallet') {
            loadWallets();
        }
        if (currentTab === 'transactions') {
            loadTransactions();
        }
        if (currentTab === 'mining') {
            loadMinerInfo();
        }
    }, 10000);
}

// 设置事件监听器
function setupEventListeners() {
    console.log('🎧 设置事件监听器');
    
    // 标签页切换
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            switchTab(e.target.dataset.tab);
        });
    });

    // 区块链控制
    const createGenesisBtn = document.getElementById('create-genesis');
    const startMiningBtn = document.getElementById('start-mining');
    const stopMiningBtn = document.getElementById('stop-mining');
    const addTransactionBtn = document.getElementById('add-transaction');
    const searchBlockBtn = document.getElementById('search-block');
    
    if (createGenesisBtn) createGenesisBtn.addEventListener('click', createGenesis);
    if (startMiningBtn) startMiningBtn.addEventListener('click', startMining);
    if (stopMiningBtn) stopMiningBtn.addEventListener('click', stopMining);
    if (addTransactionBtn) addTransactionBtn.addEventListener('click', addTransaction);
    if (searchBlockBtn) searchBlockBtn.addEventListener('click', searchBlock);

    // 钱包管理
    const createWalletBtn = document.getElementById('create-wallet');
    const refreshWalletsBtn = document.getElementById('refresh-wallets');
    const transferSubmitBtn = document.getElementById('transfer-submit');
    
    if (createWalletBtn) createWalletBtn.addEventListener('click', createWallet);
    if (refreshWalletsBtn) refreshWalletsBtn.addEventListener('click', loadWallets);
    if (transferSubmitBtn) transferSubmitBtn.addEventListener('click', submitTransfer);

    // 挖矿控制
    const startMining2Btn = document.getElementById('start-mining-2');
    const stopMining2Btn = document.getElementById('stop-mining-2');
    
    if (startMining2Btn) startMining2Btn.addEventListener('click', startMining);
    if (stopMining2Btn) stopMining2Btn.addEventListener('click', stopMining);

    // 交易历史
    const refreshTransactionsBtn = document.getElementById('refresh-transactions');
    const transactionTypeFilter = document.getElementById('transaction-type-filter');
    
    if (refreshTransactionsBtn) refreshTransactionsBtn.addEventListener('click', loadTransactions);
    if (transactionTypeFilter) transactionTypeFilter.addEventListener('change', filterTransactions);
}

// 加载初始数据
function loadInitialData() {
    console.log('📊 加载初始数据');
    loadBlocks();
    loadWallets();
    loadTransactions();
    loadMinerInfo();
}

// 标签页切换 - 包含调试信息
function switchTab(tabName) {
    console.log('🔄 切换到标签页:', tabName);
    
    // 更新按钮状态
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
        console.log('✅ 按钮状态已更新');
    }

    // 更新内容显示
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
        console.log('🔍 隐藏标签页:', content.id);
    });
    const activeContent = document.getElementById(`${tabName}-tab`);
    if (activeContent) {
        activeContent.classList.add('active');
        console.log('✅ 显示标签页:', activeContent.id);
    }

    currentTab = tabName;

    // 加载对应数据
    switch(tabName) {
        case 'blockchain':
            console.log('📦 加载区块链数据');
            document.querySelector('.main-content-area').style.display = 'block';
            loadBlocks();
            break;
        case 'wallet':
            console.log('💰 加载钱包数据');
        document.querySelector('.main-content-area').style.display = 'none';
        loadWallets();
            break;
        case 'mining':
            console.log('⛏️ 加载挖矿数据');
        document.querySelector('.main-content-area').style.display = 'none';
        loadMinerInfo();
            break;
        case 'transactions':
            console.log('📋 加载交易数据');
        document.querySelector('.main-content-area').style.display = 'none';
            loadTransactions();
            break;
    }
    
    // 显示当前激活的标签页信息
    const allTabs = document.querySelectorAll('.tab-content');
    const activeTabs = document.querySelectorAll('.tab-content.active');
    console.log(`📊 标签页状态: 总共${allTabs.length}个, 激活${activeTabs.length}个`);
    activeTabs.forEach(tab => {
        console.log(`🎯 当前激活: ${tab.id}`);
    });
}

// API 调用函数
async function apiCall(url, options = {}) {
    try {
        // 确保API调用指向正确的后端端口
        const apiUrl = url.startsWith('/api/') ? `http://localhost:8080${url}` : url;
        
        const response = await fetch(apiUrl, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API调用失败:', error);
        showMessage(`API调用失败: ${error.message}`, 'error');
        throw error;
    }
}

// 更新区块链状态
async function updateChainStatus() {
    try {
        const data = await apiCall('/api/chain/info');
        
        const chainHeight = document.getElementById('chain-height');
        const pendingTx = document.getElementById('pending-tx');
        const miningStatus = document.getElementById('mining-status');
        
        if (chainHeight) chainHeight.textContent = data.height || 0;
        if (pendingTx) pendingTx.textContent = data.pendingTxCount || 0;
        if (miningStatus) miningStatus.textContent = data.status === '运行中' ? '运行中' : '停止';
    } catch (error) {
        console.error('更新链状态失败:', error);
    }
}

// 创建创世区块
async function createGenesis() {
    const genesisDataInput = document.getElementById('genesis-data');
    const data = genesisDataInput ? genesisDataInput.value || '区块链启动' : '区块链启动';
    
    try {
        const result = await apiCall('/api/genesis', {
            method: 'POST',
            body: JSON.stringify({ data })
        });
        showMessage('创世区块创建成功!', 'success');
        setTimeout(() => {
            updateChainStatus();
            loadBlocks();
        }, 1000);
    } catch (error) {
        showMessage('创世区块创建失败', 'error');
    }
}

// 开始挖矿
async function startMining() {
    try {
        const result = await apiCall('/api/mining/start', { method: 'POST' });
        showMessage('挖矿已启动!', 'success');
        updateChainStatus();
    } catch (error) {
        showMessage('启动挖矿失败', 'error');
    }
}

// 停止挖矿
async function stopMining() {
    try {
        const result = await apiCall('/api/mining/stop', { method: 'POST' });
        showMessage('挖矿已停止!', 'info');
        updateChainStatus();
    } catch (error) {
        showMessage('停止挖矿失败', 'error');
    }
}

// 添加交易
async function addTransaction() {
    const toAddressInput = document.getElementById('tx-to-address');
    const amountInput = document.getElementById('tx-amount');
    const memoInput = document.getElementById('tx-memo');
    
    const toAddress = toAddressInput ? toAddressInput.value.trim() : '';
    const amount = amountInput ? parseFloat(amountInput.value) : 0;
    const memo = memoInput ? memoInput.value.trim() : '';
    
    // 验证输入
    if (!toAddress) {
        showMessage('请输入接收方地址', 'error');
        return;
    }
    
    if (!amount || amount <= 0) {
        showMessage('请输入有效的转账金额', 'error');
        return;
    }

    try {
        // 首先获取矿工地址作为发送方
        const minerInfo = await apiCall('/api/wallet/miner');
        const fromAddress = minerInfo.address;
        
        if (!fromAddress) {
            showMessage('无法获取矿工地址', 'error');
            return;
        }
        
        // 构造转账数据
        const transferData = {
            from: fromAddress,
            to: toAddress,
            amount: parseInt(amount) // 确保是整数
        };
        
        const result = await apiCall('/api/wallet/transfer', {
            method: 'POST',
            body: JSON.stringify(transferData)
        });
        
        showMessage(`转账成功！从 ${fromAddress.substring(0, 16)}... 转账 ${amount} 币到 ${toAddress.substring(0, 16)}...`, 'success');
        
        // 清空表单
        if (toAddressInput) toAddressInput.value = '';
        if (amountInput) amountInput.value = '';
        if (memoInput) memoInput.value = '';
        
        // 刷新相关数据
        updateChainStatus();
        loadWallets();
        loadTransactions();
        loadMinerInfo();
    } catch (error) {
        showMessage('转账失败: ' + (error.message || '未知错误'), 'error');
    }
}

// 搜索区块
async function searchBlock() {
    const heightInput = document.getElementById('block-height');
    const height = heightInput ? heightInput.value : '';
    
    if (!height) {
        showMessage('请输入区块高度', 'error');
        return;
    }

    try {
        const block = await apiCall(`/api/block?height=${height}`);
        displayBlockDetails(block);
    } catch (error) {
        showMessage('查询区块失败', 'error');
        const blockDetails = document.getElementById('block-details');
        if (blockDetails) blockDetails.classList.add('hidden');
    }
}

// 显示区块详情
function displayBlockDetails(block) {
    const elements = {
        'block-detail-height': block.height,
        'block-detail-timestamp': new Date(block.timestamp).toLocaleString(),
        'block-detail-data': block.data || '无数据',
        'block-detail-prev-hash': block.prev_hash || '无',
        'block-detail-hash': block.hash,
        'block-detail-validator': block.validator || '未知'
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });
    
    const blockDetails = document.getElementById('block-details');
    if (blockDetails) blockDetails.classList.remove('hidden');
}

// 加载区块列表
async function loadBlocks() {
    try {
        const blocks = await apiCall('/api/blocks');
        console.log('📦 区块列表:', blocks?.length || 0, '个区块');
        displayBlocks(blocks);
    } catch (error) {
        console.error('加载区块失败:', error);
    }
}

// 显示区块列表
function displayBlocks(blocks) {
    const tbody = document.getElementById('blocks-table-body');
    if (!tbody) {
        console.warn('⚠️ 找不到区块表格元素');
        return;
    }
    
    tbody.innerHTML = '';

    if (!blocks || blocks.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">暂无区块数据</td></tr>';
        return;
    }

    blocks.reverse().forEach(block => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${block.height}</td>
            <td>${new Date(block.timestamp).toLocaleString()}</td>
            <td>${block.data || '无数据'}</td>
            <td title="${block.hash}">${block.hash ? block.hash.substring(0, 16) + '...' : '无'}</td>
            <td>
                <button class="view-block-btn btn-secondary" onclick="viewBlock(${block.height})">
                    查看详情
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    console.log('✅ 区块列表显示完成');
}

// 查看区块详情
async function viewBlock(height) {
    const heightInput = document.getElementById('block-height');
    if (heightInput) heightInput.value = height;
    await searchBlock();
}

// 创建钱包
async function createWallet() {
    try {
        const result = await apiCall('/api/wallet/create', { method: 'POST' });
        console.log('创建钱包结果:', result);
        
        if (result.wallet) {
            showMessage(`新钱包创建成功! 地址: ${result.wallet.address}`, 'success');
        } else if (result.address) {
            showMessage(`新钱包创建成功! 地址: ${result.address}`, 'success');
        } else {
            showMessage('新钱包创建成功!', 'success');
        }
        
        loadWallets();
    } catch (error) {
        showMessage('创建钱包失败', 'error');
    }
}

// 加载钱包列表
async function loadWallets() {
    try {
        const walletsData = await apiCall('/api/wallet/list');
        console.log('💰 钱包列表:', walletsData?.length || 0, '个钱包');
        wallets = walletsData || [];
        displayWallets(wallets);
        updateWalletSelect();
    } catch (error) {
        console.error('加载钱包失败:', error);
    }
}

// 显示钱包列表
function displayWallets(wallets) {
    const container = document.getElementById('wallets-container');
    if (!container) {
        console.warn('⚠️ 找不到钱包容器元素');
        return;
    }
    
    container.innerHTML = '';

    if (!wallets || wallets.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 2rem; color: #666;">暂无钱包数据</div>';
        return;
    }

    wallets.forEach(wallet => {
        const walletCard = document.createElement('div');
        walletCard.className = 'wallet-card';
        walletCard.innerHTML = `
            <div class="wallet-address">
                <strong>地址:</strong> ${wallet.address}
            </div>
            <div class="wallet-balance">
                余额: ${wallet.balance} 币
            </div>
            <div class="wallet-actions-btn">
                <button class="btn-primary" onclick="copyAddress('${wallet.address}')">
                    复制地址
                </button>
                <button class="btn-secondary" onclick="refreshBalance('${wallet.address}')">
                    刷新余额
                </button>
            </div>
        `;
        container.appendChild(walletCard);
    });
    console.log('✅ 钱包列表显示完成');
}

// 更新钱包选择器
function updateWalletSelect() {
    const select = document.getElementById('from-address');
    if (!select) return;
    
    select.innerHTML = '<option value="">选择发送方钱包</option>';
    
    if (wallets && wallets.length > 0) {
        wallets.forEach(wallet => {
            const option = document.createElement('option');
            option.value = wallet.address;
            option.textContent = `${wallet.address.substring(0, 20)}... (${wallet.balance} 币)`;
            select.appendChild(option);
        });
    }
}

// 复制地址
function copyAddress(address) {
    navigator.clipboard.writeText(address).then(() => {
        showMessage('地址已复制到剪贴板', 'success');
    }).catch(() => {
        showMessage('复制失败', 'error');
    });
}

// 刷新余额
async function refreshBalance(address) {
    try {
        const balance = await apiCall(`/api/wallet/balance?address=${address}`);
        showMessage(`余额: ${balance.balance} 币`, 'info');
        loadWallets();
    } catch (error) {
        showMessage('刷新余额失败', 'error');
    }
}

// 提交转账
async function submitTransfer() {
    const fromAddressSelect = document.getElementById('from-address');
    const toAddressInput = document.getElementById('to-address');
    const transferAmountInput = document.getElementById('transfer-amount');
    
    const fromAddress = fromAddressSelect ? fromAddressSelect.value : '';
    const toAddress = toAddressInput ? toAddressInput.value : '';
    const amount = transferAmountInput ? parseInt(transferAmountInput.value) : 0;

    if (!fromAddress || !toAddress || !amount) {
        showMessage('请填写完整的转账信息', 'error');
        return;
    }

    if (amount <= 0) {
        showMessage('转账金额必须大于0', 'error');
        return;
    }

    try {
        const result = await apiCall('/api/wallet/transfer', {
            method: 'POST',
            body: JSON.stringify({
                from: fromAddress,
                to: toAddress,
                amount: amount
            })
        });
        
        console.log('转账结果:', result);
        
        if (result.transaction_id) {
            showMessage(`转账成功! 交易ID: ${result.transaction_id}`, 'success');
        } else {
            showMessage('转账成功!', 'success');
        }
        
        // 清空表单
        if (fromAddressSelect) fromAddressSelect.value = '';
        if (toAddressInput) toAddressInput.value = '';
        if (transferAmountInput) transferAmountInput.value = '';
        
        // 刷新数据
        loadWallets();
        loadTransactions();
    } catch (error) {
        showMessage('转账失败', 'error');
    }
}

// 加载矿工信息
async function loadMinerInfo() {
    try {
        const miner = await apiCall('/api/wallet/miner');
        console.log('⛏️ 矿工信息:', miner);
        minerInfo = miner;
        displayMinerInfo(miner);
    } catch (error) {
        console.error('加载矿工信息失败:', error);
    }
}

// 显示矿工信息
function displayMinerInfo(miner) {
    console.log('显示矿工信息:', miner);
    
    const elements = {
        'miner-address': miner.address || '未获取',
        'miner-balance': miner.balance || 0,
        'blocks-mined': (miner.stats && miner.stats.blocks_mined) || 0,
        'total-rewards': (miner.stats && miner.stats.total_reward) || 0,
        'block-reward': (miner.stats && miner.stats.mining_reward) || 100
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });
    console.log('✅ 矿工信息显示完成');
}

// 加载交易历史
async function loadTransactions() {
    try {
        const txData = await apiCall('/api/wallet/transactions');
        console.log('📋 交易历史:', txData?.length || 0, '笔交易');
        transactions = txData || [];
        displayTransactions(transactions);
    } catch (error) {
        console.error('加载交易历史失败:', error);
    }
}

// 显示交易历史
function displayTransactions(transactions) {
    const tbody = document.getElementById('transactions-table-body');
    if (!tbody) {
        console.warn('⚠️ 找不到交易表格元素');
        return;
    }
    
    tbody.innerHTML = '';

    if (!transactions || transactions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">暂无交易数据</td></tr>';
        return;
    }

    transactions.reverse().forEach(tx => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td title="${tx.id}">${tx.id ? tx.id.substring(0, 16) + '...' : '无'}</td>
            <td>${getTransactionType(tx.type)}</td>
            <td title="${tx.from}">${tx.from ? tx.from.substring(0, 16) + '...' : '系统'}</td>
            <td title="${tx.to}">${tx.to ? tx.to.substring(0, 16) + '...' : '无'}</td>
            <td>${tx.amount} 币</td>
            <td>${tx.fee || 0} 币</td>
            <td>${new Date(tx.timestamp).toLocaleString()}</td>
        `;
        tbody.appendChild(row);
    });
    console.log('✅ 交易历史显示完成');
}

// 获取交易类型显示文本
function getTransactionType(type) {
    switch(type) {
        case 'transfer': return '用户转账';
        case 'mining': return '挖矿奖励';
        default: return '未知';
    }
}

// 过滤交易
function filterTransactions() {
    const filterSelect = document.getElementById('transaction-type-filter');
    const filter = filterSelect ? filterSelect.value : 'all';
    let filteredTx = transactions;
    
    if (filter !== 'all') {
        filteredTx = transactions.filter(tx => tx.type === filter);
    }
    
    displayTransactions(filteredTx);
}

// 显示消息
function showMessage(message, type = 'info') {
    console.log('💬 显示消息:', message, type);
    
    // 创建消息元素
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // 添加样式
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
    `;
    
    // 设置背景色
    switch(type) {
        case 'success':
            messageDiv.style.background = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)';
            break;
        case 'error':
            messageDiv.style.background = 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)';
            break;
        case 'info':
            messageDiv.style.background = 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)';
            break;
        default:
            messageDiv.style.background = 'linear-gradient(135deg, #a0aec0 0%, #718096 100%)';
    }
    
    // 添加到页面
    document.body.appendChild(messageDiv);
    
    // 3秒后自动移除
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 300);
    }, 3000);
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 导出函数供HTML调用
window.viewBlock = viewBlock;
window.copyAddress = copyAddress;
window.refreshBalance = refreshBalance; 