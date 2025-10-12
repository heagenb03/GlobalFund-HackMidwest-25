"""
Simplified blockchain utilities - no Web3 needed since Privy handles it on frontend
"""


class BlockchainUtils:
    """
    Simple utilities for blockchain-related operations.
    All actual blockchain interactions are handled by Privy on the frontend.
    This backend just stores records and provides API endpoints.
    """
    
    @staticmethod
    def validate_eth_address(address):
        """Basic validation that a string looks like an Ethereum address"""
        if not address:
            return False
        
        # Remove 0x prefix if present
        addr = address.lower().replace('0x', '')
        
        # Check if it's 40 hex characters
        if len(addr) != 40:
            return False
        
        # Check if all characters are hex
        try:
            int(addr, 16)
            return True
        except ValueError:
            return False
    
    @staticmethod
    def validate_tx_hash(tx_hash):
        """Basic validation that a string looks like a transaction hash"""
        if not tx_hash:
            return False
        
        # Remove 0x prefix if present
        hash_str = tx_hash.lower().replace('0x', '')
        
        # Check if it's 64 hex characters
        if len(hash_str) != 64:
            return False
        
        # Check if all characters are hex
        try:
            int(hash_str, 16)
            return True
        except ValueError:
            return False
    
    @staticmethod
    def format_address(address):
        """Ensure address has 0x prefix and is lowercase"""
        if not address:
            return None
        
        addr = address.lower()
        if not addr.startswith('0x'):
            addr = '0x' + addr
        
        return addr
    
    @staticmethod
    def format_tx_hash(tx_hash):
        """Ensure transaction hash has 0x prefix and is lowercase"""
        if not tx_hash:
            return None
        
        hash_str = tx_hash.lower()
        if not hash_str.startswith('0x'):
            hash_str = '0x' + hash_str
        
        return hash_str


# Global instance
blockchain_utils = BlockchainUtils()
