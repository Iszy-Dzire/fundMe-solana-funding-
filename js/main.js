// Main application logic

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    connectWalletBtn = document.getElementById('connectWallet');
    disconnectWalletBtn = document.getElementById('disconnectWallet');
    copyAddressBtn = document.getElementById('copyAddress');
    walletModal = document.getElementById('walletModal');
    transactionModal = document.getElementById('transactionModal');
    modalConnectBtn = document.getElementById('modalConnect');
    closeTransactionBtn = document.getElementById('closeTransaction');
    fundBtn = document.getElementById('fundBtn');
    balanceElement = document.getElementById('balance');
    amountInput = document.getElementById('amountInput');
    transactionsList = document.getElementById('transactionsList');
    networkIndicator = document.getElementById('networkIndicator');
    networkName = document.getElementById('networkName');
    networkDot = document.getElementById('networkDot');
    gasEstimate = document.getElementById('gasEstimate');
    gasAmount = document.getElementById('gasAmount');
    walletConnectQr = document.getElementById('walletConnectQr');
    ethereumBtn = document.getElementById('ethereumBtn');
    solanaBtn = document.getElementById('solanaBtn');
    ethereumAlert = document.getElementById('ethereumAlert');
    solanaAlert = document.getElementById('solanaAlert');
    ethereumWallets = document.getElementById('ethereumWallets');
    solanaWallets = document.getElementById('solanaWallets');
    
    // State
    web3 = null;
    solanaConnection = null;
    account = null;
    chainId = null;
    balance = 0;
    isRightNetwork = false;
    walletConnectProvider = null;
    connector = null;
    currentNetwork = 'ethereum'; // 'ethereum' or 'solana'
    
    // Check if MetaMask is installed
    if (typeof window.ethereum !== 'undefined') {
        console.log('MetaMask is installed!');
        web3 = new Web3(window.ethereum);
    } else {
        showNotification('MetaMask not detected. Using WalletConnect for Ethereum connection.', 'info');
    }
    
    // Initialize Solana connection
    solanaConnection = new solanaWeb3.Connection(
        solanaWeb3.clusterApiUrl('devnet'),
        'confirmed'
    );
    
    // Network selection
    ethereumBtn.addEventListener('click', function() {
        currentNetwork = 'ethereum';
        ethereumBtn.classList.add('active');
        solanaBtn.classList.remove('active');
        ethereumAlert.style.display = 'flex';
        solanaAlert.style.display = 'none';
        
        // Update balance display
        if (account) {
            updateBalance();
        }
        
        // If wallet is connected but to wrong network for current selection
        if (account && currentNetwork === 'ethereum' && !isRightNetwork) {
            showNotification('Please switch to Sepolia Test Network', 'error');
        }
    });
    
    solanaBtn.addEventListener('click', function() {
        currentNetwork = 'solana';
        solanaBtn.classList.add('active');
        ethereumBtn.classList.remove('active');
        ethereumAlert.style.display = 'none';
        solanaAlert.style.display = 'flex';
        
        // Update balance display
        if (account) {
            updateBalance();
        }
        
        // For Solana, we don't need network checks like Ethereum
        if (account && currentNetwork === 'solana') {
            isRightNetwork = true;
            fundBtn.disabled = false;
            networkDot.classList.remove('network-wrong');
            networkName.textContent = 'Solana Devnet';
        }
    });
    
    // Connect Wallet Button Click
    connectWalletBtn.addEventListener('click', function() {
        if (account) {
            // Already connected, do nothing (disconnect is handled by separate button)
            return;
        } else {
            walletModal.style.display = 'flex';
            
            // Show appropriate wallet options based on selected network
            if (currentNetwork === 'ethereum') {
                ethereumWallets.style.display = 'grid';
                solanaWallets.style.display = 'none';
            } else {
                ethereumWallets.style.display = 'none';
                solanaWallets.style.display = 'flex';
            }
        }
    });
    
    // Wallet option selection for Ethereum
    document.querySelectorAll('#ethereumWallets .wallet-option').forEach(option => {
        option.addEventListener('click', function() {
            const walletType = this.getAttribute('data-wallet');
            
            if (walletType === 'metamask') {
                // Show MetaMask connection button
                walletConnectQr.style.display = 'none';
                modalConnectBtn.style.display = 'block';
                document.querySelectorAll('#ethereumWallets .wallet-option').forEach(opt => {
                    opt.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                });
                this.style.borderColor = 'var(--primary)';
            } else if (waltye === 'walletconnect') {
                // Initiate WalletConnect connection
                initWalletConnect();
                document.querySelectorAll('#ethereumWallets .wallet-option').forEach(opt => {
                    opt.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                });
                this.style.borderColor = 'var(--primary)';
            }
        });
    });
    
    // Wallet option selection for Solana
    document.querySelectorAll('#solanaWallets .solana-wallet-option').forEach(option => {
        option.addEventListener('click', function() {
            const walletType = this.getAttribute('data-wallet');
            
            // For Solana, we'll focus on Phantom for this example
            if (walletType === 'phantom') {
                connectSolanaWallet();
            } else if (walletType === 'solflare') {
                showNotification('Solflare support coming soon!', 'info');
            }
        });
    });
    
    // Disconnect Wallet Button
    disconnectWalletBtn.addEventListener('click', disconnectWallet);
    
    // Copy Address Button
    copyAddressBtn.addEventListener('click', function() {
        navigator.clipboard.writeText(account).then(() => {
            showNotification('Address copied to clipboard!', 'success');
        });
    });
    
    // Modal Connect Button (for MetaMask)
    modalConnectBtn.addEventListener('click', function() {
        connectEthereumWallet();
        walletModal.style.display = 'none';
    });
    
    // Amount input changes
    amountInput.addEventListener('input', function() {
        if (account && isRightNetwork && currentNetwork === 'ethereum') {
            estimateGas();
        }
    });
    
    // Fund Button Click
    fundBtn.addEventListener('click', async function() {
        const amount = parseFloat(amountInput.value);
        if (isNaN(amount) || amount <= 0) {
            showNotification('Please enter a valid amount', 'error');
            return;
        }
        
        // Show transaction modal
        transactionModal.style.display = 'flex';
        
        try {
            if (currentNetwork === 'ethereum') {
                await sendEthereumTransaction(amount);
            } else if (currentNetwork === 'solana') {
                await sendSolanaTransaction(amount);
            }
        } catch (error) {
            console.error('Transaction failed:', error);
            document.getElementById('pendingStatus').style.display = 'none';
            document.getElementById('errorStatus').style.display = 'flex';
            document.getElementById('transactionTitle').textContent = 'Transaction Failed';
            document.getElementById('transactionSpinner').className = 'fas fa-exclamation-circle';
            
            // User rejected the transaction
            if (error.code === 4001 || error.code === 4000) {
                document.getElementById('errorMessage').textContent = 'Transaction rejected by user.';
            } else {
                document.getElementById('errorMessage').textContent = error.message;
            }
        }
    });
    
    // Close Transaction Modal
    closeTransactionBtn.addEventListener('click', function() {
        transactionModal.style.display = 'none';
        resetTransactionModal();
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === walletModal) {
            walletModal.style.display = 'none';
        }
        if (event.target === transactionModal) {
            transactionModal.style.display = 'none';
            resetTransactionModal();
        }
    });
    
    // Handle accounts changed
    function handleAccountsChanged(accounts) {
        if (accounts.length === 0) {
            // User disconnected their wallet
            disconnectWallet();
        } else if (accounts[0] !== account) {
            // User switched accounts
            account = accounts[0];
            connectWalletBtn.innerHTML = `<i class="fas fa-check-circle"></i><span>${formatAddress(account)}</span>`;
            updateBalance();
            loadTransactionHistory();
        }
    }
    
    // Handle chain changed
    function handleChainChanged(newChainId) {
        // Convert hex chainId to decimal
        chainId = parseInt(newChainId, 16);
        networkName.textContent = getNetworkName(chainId);
        
        // Check if connected to Sepolia
        isRightNetwork = chainId === 11155111;
        
        if (isRightNetwork) {
            networkDot.classList.remove('network-wrong');
            fundBtn.disabled = false;
            showNotification('Connected to Sepolia network', 'success');
            
            // Update balance when switching to correct network
            updateBalance();
            estimateGas();
        } else {
            networkDot.classList.add('network-wrong');
            fundBtn.disabled = true;
            showNotification('Please switch to Sepolia Test Network', 'error');
            gasEstimate.style.display = 'none';
        }
    }
    
    // Update balance function
    async function updateBalance() {
        if (account) {
            try {
                if (currentNetwork === 'ethereum' && web3) {
                    // Get balance in wei
                    const balanceWei = await web3.eth.getBalance(account);
                    
                    // Convert from wei to ETH
                    balance = web3.utils.fromWei(balanceWei, 'ether');
                    
                    // Update UI
                    balanceElement.textContent = `${parseFloat(balance).toFixed(4)} ETH`;
                } else if (currentNetwork === 'solana') {
                    // Get balance in lamports
                    const publicKey = new solanaWeb3.PublicKey(account);
                    const balanceLamports = await solanaConnection.getBalance(publicKey);
                    
                    // Convert from lamports to SOL
                    balance = balanceLamports / solanaWeb3.LAMPORTS_PER_SOL;
                    
                    // Update UI
                    balanceElement.textContent = `${parseFloat(balance).toFixed(4)} SOL`;
                }
            } catch (error) {
                console.error('Error fetching balance:', error);
            }
        }
    }
    
    // Disconnect wallet function
    function disconnectWallet() {
        // Disconnect WalletConnect if active
        if (walletConnectProvider) {
            walletConnectProvider.disconnect();
            walletConnectProvider = null;
        }
        
        // Disconnect Solana wallet if connected
        if (currentNetwork === 'solana' && window.solana && window.solana.disconnect) {
            window.solana.disconnect();
        }
        
        account = null;
        isRightNetwork = false;
        connectWalletBtn.innerHTML = '<i class="fas fa-plug"></i><span>Connect Wallet</span>';
        connectWalletBtn.classList.remove('wallet-connected');
        networkIndicator.style.display = 'none';
        disconnectWalletBtn.style.display = 'none';
        copyAddressBtn.style.display = 'none';
        fundBtn.disabled = true;
        balanceElement.textContent = currentNetwork === 'ethereum' ? '0 ETH' : '0 SOL';
        gasEstimate.style.display = 'none';
        
        transactionsList.innerHTML = `
            <div class="transaction">
                <div class="transaction-details">
                    <div class="transaction-icon income">
                        <i class="fas fa-arrow-down"></i>
                    </div>
                    <div class="transaction-info">
                        <div class="transaction-title">No transactions yet</div>
                        <div class="transaction-date">Connect your wallet to see transactions</div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove listeners
        if (window.ethereum) {
            window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
        
        showNotification('Wallet disconnected', 'info');
    }
    
    // Initialize
    if (typeof window.ethereum !== 'undefined') {
        // Check if already connected to Ethereum
        window.ethereum.request({ method: 'eth_accounts' })
            .then(accounts => {
                if (accounts.length > 0) {
                    account = accounts[0];
                    connectEthereumWallet();
                }
            })
            .catch(console.error);
    }
    
    // Check if already connected to Solana (Phantom)
    if (window.solana && window.solana.isConnected) {
        window.solana.connect({ onlyIfTrusted: true })
            .then(response => {
                if (response.publicKey) {
                    account = response.publicKey.toString();
                    currentNetwork = 'solana';
                    ethereumBtn.classList.remove('active');
                    solanaBtn.classList.add('active');
                    ethereumAlert.style.display = 'none';
                    solanaAlert.style.display = 'flex';
                    isRightNetwork = true;
                    updateUI();
                    updateBalance();
                    loadTransactionHistory();
                }
            })
            .catch(console.error);
    }
});
