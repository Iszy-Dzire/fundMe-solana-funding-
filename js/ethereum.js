// Ethereum-specific functionality

// Connect Ethereum wallet function (for MetaMask)
async function connectEthereumWallet() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            // Request account access
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            account = accounts[0];
            
            // Get current chain ID
            chainId = await web3.eth.getChainId();
            
            // Check if connected to Sepolia (chainId: 11155111)
            isRightNetwork = chainId === 11155111;
            
            if (!isRightNetwork) {
                networkDot.classList.add('network-wrong');
                showNotification('Please switch to Sepolia Test Network', 'error');
                
                try {
                    // Try to switch to Sepolia
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: '0xaa36a7' }], // Sepolia chainId
                    });
                    
                    // Update chainId after switching
                    chainId = await web3.eth.getChainId();
                    isRightNetwork = chainId === 11155111;
                    
                    if (isRightNetwork) {
                        networkDot.classList.remove('network-wrong');
                        showNotification('Switched to Sepolia network', 'success');
                    }
                } catch (switchError) {
                    // This error code indicates that the chain has not been added to MetaMask
                    if (switchError.code === 4902) {
                        try {
                            await window.ethereum.request({
                                method: 'wallet_addEthereumChain',
                                params: [
                                    {
                                        chainId: '0xaa36a7',
                                        chainName: 'Sepolia Test Network',
                                        rpcUrls: ['https://rpc.sepolia.org'],
                                        nativeCurrency: {
                                            name: 'Sepolia ETH',
                                            symbol: 'ETH',
                                            decimals: 18
                                        },
                                        blockExplorerUrls: ['https://sepolia.etherscan.io']
                                    }
                                ]
                            });
                            
                            // Update chainId after adding and switching
                            chainId = await web3.eth.getChainId();
                            isRightNetwork = chainId === 11155111;
                            
                            if (isRightNetwork) {
                                networkDot.classList.remove('network-wrong');
                                showNotification('Added and switched to Sepolia network', 'success');
                            }
                        } catch (addError) {
                            console.error('Error adding Sepolia network:', addError);
                            showNotification('Failed to add Sepolia network', 'error');
                        }
                    } else {
                        console.error('Error switching to Sepolia:', switchError);
                    }
                }
            } else {
                networkDot.classList.remove('network-wrong');
            }
            
            // Update UI
            updateUI();
            
            // Update balance
            await updateBalance();
            
            // Load transaction history
            loadTransactionHistory();
            
            // Listen for account changes
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            
            // Listen for chain changes
            window.ethereum.on('chainChanged', handleChainChanged);
            
        } catch (error) {
            console.error('User denied account access or error occurred:', error);
            showNotification('Failed to connect wallet. Please try again.', 'error');
        }
    } else {
        showNotification('Please install MetaMask or use WalletConnect!', 'error');
    }
}

// Send Ethereum transaction
async function sendEthereumTransaction(amount) {
    // Convert amount to wei (1 ETH = 10^18 wei)
    const amountInWei = web3.utils.toWei(amount.toString(), 'ether');
    
    // In a real dApp, you would send to a contract address
    // For demo purposes, we'll send to a hardcoded address
    // In production, never hardcode addresses!
    const recipientAddress = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"; // Example address
    
    // Send transaction
    const transaction = await web3.eth.sendTransaction({
        from: account,
        to: recipientAddress,
        value: amountInWei
    });
    
    // Transaction successful
    document.getElementById('pendingStatus').style.display = 'none';
    document.getElementById('successStatus').style.display = 'flex';
    document.getElementById('transactionTitle').textContent = 'Transaction Successful';
    document.getElementById('transactionSpinner').className = 'fas fa-check-circle';
    document.getElementById('transactionText').textContent = 'Your transaction was successful.';
    
    // Show transaction hash
    document.getElementById('transactionHash').textContent = `Transaction Hash: ${transaction.transactionHash}`;
    document.getElementById('transactionHash').style.display = 'block';
    
    // Show explorer link
    const explorerLink = document.getElementById('explorerLink');
    explorerLink.href = `https://sepolia.etherscan.io/tx/${transaction.transactionHash}`;
    explorerLink.style.display = 'inline-block';
    
    // Update balance
    await updateBalance();
    
    // Add transaction to history
    addTransactionToHistory(amount, transaction.transactionHash, 'outcome');
}

// Estimate gas for Ethereum transaction
async function estimateGas() {
    const amount = parseFloat(amountInput.value);
    
    if (isNaN(amount) || amount <= 0) {
        gasEstimate.style.display = 'none';
        return;
    }
    
    try {
        // Convert amount to wei
        const amountInWei = web3.utils.toWei(amount.toString(), 'ether');
        
        // Estimate gas (for demo purposes, we'll use a fixed value)
        // In a real application, you would use web3.eth.estimateGas()
        const estimatedGas = 21000; // Standard gas for simple ETH transfer
        const gasPrice = await web3.eth.getGasPrice();
        
        // Calculate gas cost in ETH
        const gasCostWei = estimatedGas * gasPrice;
        const gasCostEth = web3.utils.fromWei(gasCostWei.toString(), 'ether');
        
        // Update UI
        gasAmount.textContent = parseFloat(gasCostEth).toFixed(6);
        gasEstimate.style.display = 'block';
        
    } catch (error) {
        console.error('Error estimating gas:', error);
        gasEstimate.style.display = 'none';
    }
}
