import { useState } from 'react';
import GameComponent from './game/GameComponent';
import { Web3Provider } from './web3';
import WalletConnect from './components/WalletConnect';
import NFTInventory from './components/NFTInventory';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<'game' | 'inventory'>('game');

  return (
    <Web3Provider>
      <div className="app-container">
        <header className="app-header">
          <h1>Brotato Web3</h1>
          <WalletConnect />
        </header>
        
        <div className="tab-navigation">
          <button 
            className={activeTab === 'game' ? 'active' : ''}
            onClick={() => setActiveTab('game')}
          >
            Jouer
          </button>
          <button 
            className={activeTab === 'inventory' ? 'active' : ''}
            onClick={() => setActiveTab('inventory')}
          >
            Inventaire NFT
          </button>
        </div>
        
        <main className="app-content">
          {activeTab === 'game' ? (
            <div className="game-container">
              <GameComponent />
            </div>
          ) : (
            <div className="inventory-container">
              <NFTInventory />
            </div>
          )}
        </main>
        
        <footer className="app-footer">
          <p>Brotato Web3 - Un jeu roguelite avec intégration blockchain</p>
        </footer>
      </div>
    </Web3Provider>
  );
}

export default App;
