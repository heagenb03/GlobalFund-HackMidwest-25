
class BlockchainUtils:
    @staticmethod
    def validate_eth_address(address):
        if not address:
            return False
        
        addr = address.lower().replace('0x', '')
        
        if len(addr) != 40:
            return False
        
        try:
            int(addr, 16)
            return True
        except ValueError:
            return False
    
    @staticmethod
    def validate_tx_hash(tx_hash):
        if not tx_hash:
            return False
        
        hash_str = tx_hash.lower().replace('0x', '')
        
        if len(hash_str) != 64:
            return False
        
        try:
            int(hash_str, 16)
            return True
        except ValueError:
            return False
    
    @staticmethod
    def format_address(address):
        if not address:
            return None
        
        addr = address.lower()
        if not addr.startswith('0x'):
            addr = '0x' + addr
        
        return addr
    
    @staticmethod
    def format_tx_hash(tx_hash):
        if not tx_hash:
            return None
        
        hash_str = tx_hash.lower()
        if not hash_str.startswith('0x'):
            hash_str = '0x' + hash_str
        
        return hash_str


# Global instance
blockchain_utils = BlockchainUtils()
