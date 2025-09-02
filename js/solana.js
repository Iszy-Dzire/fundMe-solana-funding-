// Solana-specific functionality

// Connect to Solana wallet
async function connectSolanaWallet() {
    try {
        // Check if Phantom is installed
        if (!window.solana || !window.solana.isPhantom) {
            showNotification('Phantom wallet not detected. Please install it first.', 'error');
            return;
        }
        
        // Connect to Phantom wallet
        const response = await window.solana.connect();
        account = response.publicKey.toString();
        
        // For Solana, we don't have the same network checks as Ethereum
        isRightNetwork = true;
        
        // Update UI
        updateUI();
        
        // Update balance
        await updateBalance();
        
        // Load transaction history
        loadTransactionHistory();
        
        walletModal.style.display = 'none';
        
        showNotification('Connected to Phantom wallet!', 'success');
        
    } catch (error) {
        console.error('Error connecting to Solana wallet:', error);
        showNotification('Failed to connect to wallet. Please try again.', 'error');
    }
}

// Send Solana transaction
async function sendSolanaTransaction(amount) {
    // Convert amount to lamports (1 SOL = 10^9 lamports)
    const amountInLamports = amount * solanaWeb3.LAMPORTS_PER_SOL;
    
    // For demo purposes, we'll send to a hardcoded address
    // In production, never hardcode addresses!
    const recipientAddress = new solanaWeb3.PublicKey("C6QpFpY6gKZSmdYsCj9qS3xSxpfa3FSsXv9VjB6aVXq9"); // Example address
    const fromPublicKey = new solanaWeb3.PublicKey(account);
    
    // Get latest blockhash
    const { blockhash } = await solanaConnection.getLatestBlockhash();
    
    // Create transaction
    const transaction = new solanaWeb3.Transaction().add(
        solanaWeb3.SystemProgram.transfer({
            fromPubkey: fromPublicKey,
            toPubkey: recipientAddress,
            lamports: amountInLamports,
        })
    );
    
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromPublicKey;
    
    // Request signature from wallet
    const { signature } = await window.solana.signAndSendTransaction(transaction);
    
    // Confirm transaction
    await solanaConnection.confirmTransaction(signature);
    
    // Transaction successful
    document.getElementById('pendingStatus').style.display = 'none';
    document.getElementById('successStatus').style.display = 'flex';
    document.getElementById('transactionTitle').textContent = 'Transaction Successful';
    document.getElementById('transactionSpinner').className = 'fas fa-check-circle';
    document.getElementById('transactionText').textContent = 'Your transaction was successful.';
    
    // Show transaction hash
    document.getElementById('transactionHash').textContent = `Transaction Signature: ${signature}`;
    document.getElementById('transactionHash').style.display = 'block';
    
    // Show explorer link
    const explorerLink = document.getElementById('explorerLink');
    explorerLink.href = `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
    explorerLink.style.display = 'inline-block';
    
    // Update balance
    await updateBalance();
    
    // Add transaction to history
    addTransactionToHistory(amount, signature, 'outcome');
}
