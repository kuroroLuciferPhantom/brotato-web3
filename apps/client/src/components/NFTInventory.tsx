import { useEffect, useState } from 'react';
import { useWeb3 } from '../web3';
import { Character, Weapon, Item, Rarity } from '@brotato/game-core';

// Types de vue pour l'inventaire
type InventoryView = 'characters' | 'weapons' | 'items';

const NFTInventory = () => {
  const { web3State, refreshNFTs } = useWeb3();
  const [activeView, setActiveView] = useState<InventoryView>('characters');
  const [selectedNFT, setSelectedNFT] = useState<Character | Weapon | Item | null>(null);
  
  // Rafraîchir les NFTs au chargement et quand l'utilisateur se connecte
  useEffect(() => {
    if (web3State.isConnected) {
      refreshNFTs();
    }
  }, [web3State.isConnected, refreshNFTs]);
  
  // Fonction pour obtenir la couleur en fonction de la rareté
  const getRarityColor = (rarity: Rarity): string => {
    switch (rarity) {
      case 'legendary':
        return '#FFD700'; // Or
      case 'epic':
        return '#A335EE'; // Violet
      case 'rare':
        return '#0070DD'; // Bleu
      case 'uncommon':
        return '#1EFF00'; // Vert
      default:
        return '#FFFFFF'; // Blanc
    }
  };
  
  // Rendu des personnages
  const renderCharacters = () => {
    if (web3State.characters.length === 0) {
      return <p>Aucun personnage NFT trouvé. Connectez-vous pour voir vos NFTs.</p>;
    }
    
    return (
      <div className="nft-grid">
        {web3State.characters.map((character) => (
          <div 
            key={character.id}
            className={`nft-card ${selectedNFT?.id === character.id ? 'selected' : ''}`}
            onClick={() => setSelectedNFT(character)}
            style={{ borderColor: getRarityColor(character.rarity) }}
          >
            <div className="nft-card-header" style={{ backgroundColor: getRarityColor(character.rarity) }}>
              {character.name}
            </div>
            <div className="nft-card-content">
              <p>Type: {character.type}</p>
              <p>Rareté: {character.rarity}</p>
              <div className="stats-grid">
                <div className="stat">❤️ {character.stats.health}</div>
                <div className="stat">⚔️ {character.stats.damage}</div>
                <div className="stat">🛡️ {character.stats.defense}</div>
                <div className="stat">🏃 {character.stats.speed}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // Rendu des armes
  const renderWeapons = () => {
    if (web3State.weapons.length === 0) {
      return <p>Aucune arme NFT trouvée. Connectez-vous pour voir vos NFTs.</p>;
    }
    
    return (
      <div className="nft-grid">
        {web3State.weapons.map((weapon) => (
          <div 
            key={weapon.id}
            className={`nft-card ${selectedNFT?.id === weapon.id ? 'selected' : ''}`}
            onClick={() => setSelectedNFT(weapon)}
            style={{ borderColor: getRarityColor(weapon.rarity) }}
          >
            <div className="nft-card-header" style={{ backgroundColor: getRarityColor(weapon.rarity) }}>
              {weapon.name}
            </div>
            <div className="nft-card-content">
              <p>Type: {weapon.type}</p>
              <p>Rareté: {weapon.rarity}</p>
              <div className="stats-grid">
                <div className="stat">⚔️ {weapon.damage}</div>
                <div className="stat">⚡ {weapon.attackSpeed}</div>
                <div className="stat">📏 {weapon.range}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // Rendu des objets
  const renderItems = () => {
    if (web3State.items.length === 0) {
      return <p>Aucun objet NFT trouvé. Connectez-vous pour voir vos NFTs.</p>;
    }
    
    return (
      <div className="nft-grid">
        {web3State.items.map((item) => (
          <div 
            key={item.id}
            className={`nft-card ${selectedNFT?.id === item.id ? 'selected' : ''}`}
            onClick={() => setSelectedNFT(item)}
            style={{ borderColor: getRarityColor(item.rarity) }}
          >
            <div className="nft-card-header" style={{ backgroundColor: getRarityColor(item.rarity) }}>
              {item.name}
            </div>
            <div className="nft-card-content">
              <p>Type: {item.type}</p>
              <p>Rareté: {item.rarity}</p>
              <div className="stats-grid">
                {Object.entries(item.statBoosts).map(([key, value]) => (
                  <div key={key} className="stat">
                    {key === 'health' && '❤️'}
                    {key === 'damage' && '⚔️'}
                    {key === 'defense' && '🛡️'}
                    {key === 'speed' && '🏃'}
                    {key === 'attackSpeed' && '⚡'}
                    {key === 'range' && '📏'}
                    {' '}{value}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // Détail du NFT sélectionné
  const renderNFTDetail = () => {
    if (!selectedNFT) return null;
    
    return (
      <div className="nft-detail" style={{ borderColor: getRarityColor(selectedNFT.rarity) }}>
        <h3>{selectedNFT.name}</h3>
        <p>ID: {selectedNFT.id}</p>
        <p>Type: {selectedNFT.type}</p>
        <p>Rareté: {selectedNFT.rarity}</p>
        
        {'stats' in selectedNFT && (
          <div className="detail-stats">
            <h4>Statistiques</h4>
            <p>Santé: {selectedNFT.stats.health}</p>
            <p>Dégâts: {selectedNFT.stats.damage}</p>
            <p>Défense: {selectedNFT.stats.defense}</p>
            <p>Vitesse: {selectedNFT.stats.speed}</p>
            <p>Vitesse d'attaque: {selectedNFT.stats.attackSpeed}</p>
            <p>Portée: {selectedNFT.stats.range}</p>
          </div>
        )}
        
        {'damage' in selectedNFT && (
          <div className="detail-stats">
            <h4>Statistiques</h4>
            <p>Dégâts: {selectedNFT.damage}</p>
            <p>Vitesse d'attaque: {selectedNFT.attackSpeed}</p>
            <p>Portée: {selectedNFT.range}</p>
            <p>Projectiles: {selectedNFT.projectileCount}</p>
          </div>
        )}
        
        {'statBoosts' in selectedNFT && (
          <div className="detail-stats">
            <h4>Bonus de statistiques</h4>
            {Object.entries(selectedNFT.statBoosts).map(([key, value]) => (
              <p key={key}>{key}: +{value}</p>
            ))}
          </div>
        )}
        
        {'effects' in selectedNFT && selectedNFT.effects.length > 0 && (
          <div className="detail-effects">
            <h4>Effets</h4>
            {selectedNFT.effects.map((effect, index) => (
              <p key={index}>{effect.type}: {effect.value}{effect.trigger ? ` (${effect.trigger})` : ''}</p>
            ))}
          </div>
        )}
        
        {selectedNFT.tokenId && (
          <div className="nft-metadata">
            <h4>Métadonnées NFT</h4>
            <p>Token ID: {selectedNFT.tokenId}</p>
            <p>Contrat: {selectedNFT.contractAddress?.substring(0, 8)}...</p>
          </div>
        )}
        
        <button className="close-button" onClick={() => setSelectedNFT(null)}>Fermer</button>
      </div>
    );
  };
  
  return (
    <div className="nft-inventory">
      <h2>Inventaire NFT</h2>
      
      <div className="inventory-tabs">
        <button 
          className={activeView === 'characters' ? 'active' : ''}
          onClick={() => setActiveView('characters')}
        >
          Personnages ({web3State.characters.length})
        </button>
        <button 
          className={activeView === 'weapons' ? 'active' : ''}
          onClick={() => setActiveView('weapons')}
        >
          Armes ({web3State.weapons.length})
        </button>
        <button 
          className={activeView === 'items' ? 'active' : ''}
          onClick={() => setActiveView('items')}
        >
          Objets ({web3State.items.length})
        </button>
      </div>
      
      <div className="inventory-content">
        {activeView === 'characters' && renderCharacters()}
        {activeView === 'weapons' && renderWeapons()}
        {activeView === 'items' && renderItems()}
      </div>
      
      {selectedNFT && renderNFTDetail()}
      
      <button 
        className="refresh-button" 
        onClick={() => refreshNFTs()}
        disabled={!web3State.isConnected}
      >
        Rafraîchir les NFTs
      </button>
    </div>
  );
};

export default NFTInventory;
