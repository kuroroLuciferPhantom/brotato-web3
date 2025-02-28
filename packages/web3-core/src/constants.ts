/**
 * Constantes pour l'intégration Web3
 */

// Configurations de chaînes
export const SUPPORTED_CHAINS = {
  LOCALHOST: 31337,
  SEPOLIA: 11155111,
  POLYGON: 137,
  POLYGON_MUMBAI: 80001,
  ARBITRUM: 42161,
  ARBITRUM_GOERLI: 421613
};

// Configuration par défaut
export const DEFAULT_CHAIN_ID = SUPPORTED_CHAINS.POLYGON_MUMBAI;

// Adresses de contrats
export const CONTRACT_ADDRESSES = {
  [SUPPORTED_CHAINS.LOCALHOST]: {
    Characters: '0x0000000000000000000000000000000000000000', // À remplacer après déploiement
    ScoreRegistry: '0x0000000000000000000000000000000000000000' // À remplacer après déploiement
  },
  [SUPPORTED_CHAINS.POLYGON_MUMBAI]: {
    Characters: '0x0000000000000000000000000000000000000000', // À remplacer après déploiement
    ScoreRegistry: '0x0000000000000000000000000000000000000000' // À remplacer après déploiement
  }
};

// Métadonnées des chaînes
export const CHAIN_METADATA = {
  [SUPPORTED_CHAINS.LOCALHOST]: {
    name: 'Localhost',
    shortName: 'localhost',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    },
    blockExplorerUrls: ['http://localhost:8545']
  },
  [SUPPORTED_CHAINS.SEPOLIA]: {
    name: 'Sepolia',
    shortName: 'sepolia',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    },
    blockExplorerUrls: ['https://sepolia.etherscan.io']
  },
  [SUPPORTED_CHAINS.POLYGON]: {
    name: 'Polygon',
    shortName: 'polygon',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    },
    blockExplorerUrls: ['https://polygonscan.com']
  },
  [SUPPORTED_CHAINS.POLYGON_MUMBAI]: {
    name: 'Polygon Mumbai',
    shortName: 'mumbai',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    },
    blockExplorerUrls: ['https://mumbai.polygonscan.com']
  },
  [SUPPORTED_CHAINS.ARBITRUM]: {
    name: 'Arbitrum One',
    shortName: 'arbitrum',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    },
    blockExplorerUrls: ['https://arbiscan.io']
  },
  [SUPPORTED_CHAINS.ARBITRUM_GOERLI]: {
    name: 'Arbitrum Goerli',
    shortName: 'arbitrum-goerli',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    },
    blockExplorerUrls: ['https://goerli.arbiscan.io']
  }
};

// Configuration des prix
export const PRICE_CONFIG = {
  CHARACTER_MINT_PRICE: '0.01', // en ETH/MATIC
  CHARACTER_MINT_PRICE_WEI: '10000000000000000', // en wei
  SCORE_REGISTRATION_PRICE: '0.001', // en ETH/MATIC
  SCORE_REGISTRATION_PRICE_WEI: '1000000000000000' // en wei
};

// Temps d'attente pour les transactions
export const TRANSACTION_WAIT_TIME = {
  CONFIRMATION_BLOCKS: 1,
  POLL_INTERVAL_MS: 5000,
  MAX_WAIT_TIME_MS: 120000 // 2 minutes
};

// Configuration RPC
export const RPC_CONFIG = {
  RETRY_COUNT: 3,
  TIMEOUT_MS: 30000
};

// Limites d'initialisation
export const INITIALIZATION_LIMITS = {
  MAX_NFT_FETCH_COUNT: 100,
  MAX_EVENT_FETCH_COUNT: 100,
  INITIAL_LOAD_COUNT: 10
};
