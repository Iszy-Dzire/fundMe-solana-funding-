// Utility functions

// Get network name from chain ID
function getNetworkName(chainId) {
    switch (chainId) {
        case 1: return 'Ethereum Mainnet';
        case 11155111: return 'Sepolia Testnet';
        case 5: return 'Goerli Testnet';
        case 137: return 'Polygon Mainnet';
        case 80001: return 'Mumbai Testnet';
        default: return `Unknown Network (${chainId})`;
    }
}

// Show notification
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    let icon = 'fas fa-info-circle';
    if (type === 'success') icon = 'fas fa-check-circle';
    if (type === 'error') icon = 'fas fa-exclamation-circle';
    
    notification.innerHTML = `
        <i class="${icon}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Hide and remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Format address for display
function formatAddress(address, network = 'ethereum') {
    if (!address) return '';
    
    if (network === 'ethereum') {
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    } else {
        return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
    }
}

// Reset transaction modal
function resetTransactionModal() {
    document.getElementById('pendingStatus').style.display = 'flex';
    document.getElementById('successStatus').style.display = 'none';
    document.getElementById('errorStatus').style.display = 'none';
    document.getElementById('transactionTitle').textContent = 'Processing Transaction';
    document.getElementById('transactionSpinner').className = 'fas fa-spinner fa-spin';
    document.getElementById('transactionText').textContent = 'Please confirm the transaction in your wallet to complete the funding process.';
    document.getElementById('transactionHash').style.display = 'none';
    document.getElementById('explorerLink').style.display = 'none';
}
