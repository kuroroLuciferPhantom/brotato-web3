import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Character, Item, Weapon } from '@brotato/game-core';
import { Web3State, connectWallet, disconnectWallet, checkConnection, fetchUserCharacters, fetchUserWeapons, fetchUserItems } from '@brotato/web3-core';

// État initial Web3
const initialWeb3State: Web3State = {
  isConnected: false,
  address: null,
  chainId: null,
  characters: [],
  weapons: [],
  items: [],
  error: null
};

// Création du contexte Web3
const Web3Context = createContext<{
  web3State: Web3State;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  refreshNFTs: () => Promise<void>;
}>({  
  web3State: initialWeb3State,
  connect: async () => {},
  disconnect: async () => {},
  refreshNFTs: async () => {}
});

// Hook pour accéder au contexte Web3
export const useWeb3 = () => useContext(Web3Context);

// Provider Web3
export const Web3Provider = ({ children }: { children: ReactNode }) => {
  const [web3State, setWeb3State] = useState<Web3State>(initialWeb3State);
  
  // Vérifier la connexion au chargement
  useEffect(() => {
    const checkConnectionStatus = async () => {
      const connectionStatus = await checkConnection();
      if (connectionStatus.isConnected && connectionStatus.address) {
        setWeb3State(prev => ({ ...prev, ...connectionStatus }));
        await refreshUserNFTs(connectionStatus.address);
      }
    };
    
    checkConnectionStatus();
  }, []);
  
  // Connect le wallet
  const connect = async () => {
    try {
      const result = await connectWallet();
      if (result.isConnected && result.address) {
        setWeb3State(prev => ({ ...prev, ...result }));
        await refreshUserNFTs(result.address);
      } else if (result.error) {
        setWeb3State(prev => ({ ...prev, error: result.error }));
      }
    } catch (error) {
      setWeb3State(prev => ({ 
        ...prev, 
        error: (error as Error).message || 'Erreur lors de la connexion du wallet'
      }));
    }
  };
  
  // Déconnecter le wallet
  const disconnect = async () => {
    try {
      await disconnectWallet();
      setWeb3State(initialWeb3State);
    } catch (error) {
      setWeb3State(prev => ({ 
        ...prev, 
        error: (error as Error).message || 'Erreur lors de la déconnexion du wallet'
      }));
    }
  };
  
  // Rafraîchir les NFTs de l'utilisateur
  const refreshUserNFTs = async (address: string) => {
    try {
      // Récupérer les NFTs en parallèle
      const [characters, weapons, items] = await Promise.all([
        fetchUserCharacters(address),
        fetchUserWeapons(address),
        fetchUserItems(address)
      ]);
      
      setWeb3State(prev => ({ ...prev, characters, weapons, items }));
    } catch (error) {
      setWeb3State(prev => ({ 
        ...prev, 
        error: (error as Error).message || 'Erreur lors de la récupération des NFTs'
      }));
    }
  };
  
  // Fonction publique pour rafraîchir les NFTs
  const refreshNFTs = async () => {
    if (web3State.address) {
      await refreshUserNFTs(web3State.address);
    }
  };
  
  return (
    <Web3Context.Provider value={{ web3State, connect, disconnect, refreshNFTs }}>
      {children}
    </Web3Context.Provider>
  );
};
