// WalletConnect functionality

// Initialize WalletConnect
function initWalletConnect() {
    try {
        // Initialize WalletConnect Provider
        walletConnectProvider = new WalletConnectProvider.default({
            rpc: {
                1: "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
                11155111: "https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"
            },
            chainId: 11155111, // Default to Sepolia
        });
        
        // Enable session (triggers QR Code modal)
        walletConnectProvider.enable().then(() => {
            // Create Web3 instance
            web3 = new Web3(walletConnectProvider);
            
            // Get accounts
            web3.eth.getAccounts().then(accounts => {
                if (accounts.length > 0) {
                    account = accounts[0];
                    setupWalletConnect();
                    walletModal.style.display = 'none';
                }
            });
        }).catch(err => {
            console.error("WalletConnect error:", err);
            showNotification('Failed to connect with WalletConnect', 'error');
        });
        
        // Display QR code
        walletConnectProvider.connector.on("display_uri", (err, payload) => {
            const uri = payload.params[0];
            QRCode.toDataURL(uri, function(err, url) {
                if (err) {
                    console.error("QR code generation error:", err);
                    return;
                }
                
                walletConnectQr.style.display = 'block';
                modalConnectBtn.style.display = 'none';
                
                document.getElementById('qrcode').innerHTML = `
                    <img src="${url}" alt="WalletConnect QR Code" style="max-width: 100%;">
                `;
            });
        });
        
        // Subscribe to accounts change
        walletConnectProvider.on("accountsChanged", (accounts) => {
            if (accounts.length === 0) {
                disconnectWallet();
            } else {
                account = accounts[0];
                updateUI();
            }
        });
        
        // Subscribe to chain change
        walletConnectProvider.on("chainChanged", (chainId) => {
            handleChainChanged(parseInt(chainId, 16));
        });
        
        // Subscribe to session disconnect
        walletConnectProvider.on("disconnect", (code, reason) => {
            console.log("WalletConnect session disconnected", code, reason);
            disconnectWallet();
        });
        
    } catch (error) {
        console.error("Error initializing WalletConnect:", error);
        showNotification('Error initializing WalletConnect', 'error');
    }
}

// Setup after WalletConnect connection
function setupWalletConnect() {
    web3.eth.getChainId().then(id => {
        chainId = id;
        isRightNetwork = chainId === 11155111;
        updateUI();
        updateBalance();
        loadTransactionHistory();
        
        showNotification('Connected via WalletConnect!', 'success');
    });
}
