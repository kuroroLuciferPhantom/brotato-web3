import { useState } from 'react';
import { useWeb3 } from '../web3';

const WalletConnect = () => {
  const { web3State, connect, disconnect } = useWeb3();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleConnect = async () => {
    setIsLoading(true);
    try {
      await connect();
    } catch (error) {
      console.error('Erreur de connexion:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      await disconnect();
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Formatter l'adresse pour l'affichage
  const formatAddress = (address: string): string => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  return (
    <div className="wallet-connect">
      {web3State.isConnected && web3State.address ? (
        <div className="wallet-info">
          <span className="wallet-address">
            {formatAddress(web3State.address)}
          </span>
          <button 
            onClick={handleDisconnect} 
            disabled={isLoading}
            className="disconnect-button"
          >
            {isLoading ? 'Déconnexion...' : 'Déconnecter'}
          </button>
        </div>
      ) : (
        <button 
          onClick={handleConnect} 
          disabled={isLoading}
          className="connect-button"
        >
          {isLoading ? 'Connexion...' : 'Connecter Wallet'}
        </button>
      )}
      
      {web3State.error && (
        <div className="error-message">
          {web3State.error}
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
