// UI management functions

// Update UI after connection
function updateUI() {
    let displayAddress;
    
    if (currentNetwork === 'ethereum') {
        displayAddress = formatAddress(account);
    } else {
        displayAddress = formatAddress(account, 'solana');
    }
    
    connectWalletBtn.innerHTML = `<i class="fas fa-check-circle"></i><span>${displayAddress}</span>`;
    connectWalletBtn.classList.add('wallet-connected');
    
    // Show additional buttons
    disconnectWalletBtn.style.display = 'block';
    copyAddressBtn.style.display = 'block';
    
    // Show network indicator
    networkIndicator.style.display = 'flex';
    
    if (currentNetwork === 'ethereum') {
        networkName.textContent = getNetworkName(chainId);
        
        if (isRightNetwork) {
            networkDot.classList.remove('network-wrong');
            fundBtn.disabled = false;
        } else {
            networkDot.classList.add('network-wrong');
            fundBtn.disabled = true;
        }
    } else {
        networkName.textContent = 'Solana Devnet';
        networkDot.classList.remove('network-wrong');
        fundBtn.disabled = false;
    }
}

// Load transaction history
function loadTransactionHistory() {
    // In a real application, you would fetch transaction history from the blockchain
    // For demo purposes, we'll use local storage
    const storedTransactions = localStorage.getItem(`transactions_${account}`);
    
    if (storedTransactions) {
        const transactions = JSON.parse(storedTransactions);
        
        if (transactions.length > 0) {
            transactionsList.innerHTML = '';
            
            transactions.forEach(tx => {
                addTransactionToUI(tx.amount, tx.hash, tx.type, tx.date);
            });
        } else {
            transactionsList.innerHTML = `
                <div class="transaction">
                    <div class="transaction-details">
                        <div class="transaction-icon income">
                            <i class="fas fa-arrow-down"></i>
                        </div>
                        <div class="transaction-info">
                            <div class="transaction-title">No transactions yet</div>
                            <div class="transaction-date">Make your first transaction</div>
                        </div>
                    </div>
                </div>
            `;
        }
    }
}

// Add transaction to UI
function addTransactionToUI(amount, hash, type, date) {
    // Remove "no transactions" message if it exists
    if (transactionsList.querySelector('.transaction-title')?.textContent === 'No transactions yet') {
        transactionsList.innerHTML = '';
    }
    
    const transactionEl = document.createElement('div');
    transactionEl.className = 'transaction';
    
    const isIncome = type === 'income';
    const currency = currentNetwork === 'ethereum' ? 'ETH' : 'SOL';
    
    transactionEl.innerHTML = `
        <div class="transaction-details">
            <div class="transaction-icon ${isIncome ? 'income' : 'outcome'}">
                <i class="fas fa-${isIncome ? 'arrow-down' : 'arrow-up'}"></i>
            </div>
            <div class="transaction-info">
                <div class="transaction-title">${isIncome ? 'Received' : 'Sent'} ${currency}</div>
                <div class="transaction-date">${new Date(date).toLocaleString()}</div>
            </div>
        </div>
        <div class="transaction-amount ${isIncome ? 'income' : 'outcome'}">
            ${isIncome ? '+' : '-'}${amount} ${currency}
        </div>
    `;
    
    transactionsList.prepend(transactionEl);
}

// Add transaction to history
function addTransactionToHistory(amount, hash, type) {
    const transaction = {
        amount,
        hash,
        type,
        date: new Date().toISOString()
    };
    
    // Get existing transactions or create new array
    const storedTransactions = localStorage.getItem(`transactions_${account}`);
    let transactions = storedTransactions ? JSON.parse(storedTransactions) : [];
    
    // Add new transaction
    transactions.unshift(transaction);
    
    // Save to local storage
    localStorage.setItem(`transactions_${account}`, JSON.stringify(transactions));
    
    // Update UI
    addTransactionToUI(amount, hash, type, transaction.date);
}
