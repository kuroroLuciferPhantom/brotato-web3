import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { GameConfig } from './config';

const GameComponent: React.FC = () => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  
  // Calculer les dimensions du conteneur (80% de la fenêtre)
  useEffect(() => {
    const updateSize = () => {
      const width = Math.floor(window.innerWidth * 0.8);
      const height = Math.floor(window.innerHeight * 0.8);
      setContainerSize({ width, height });
    };
    
    // Initialiser les dimensions
    updateSize();
    
    // Mettre à jour les dimensions lors du redimensionnement de la fenêtre
    window.addEventListener('resize', updateSize);
    
    return () => {
      window.removeEventListener('resize', updateSize);
    };
  }, []);
  
  useEffect(() => {
    // Seulement créer le jeu s'il n'existe pas déjà et si les dimensions sont définies
    if (!gameRef.current && containerRef.current && containerSize.width > 0 && containerSize.height > 0) {
      // Créer l'instance du jeu Phaser
      gameRef.current = new Phaser.Game({
        ...GameConfig,
        parent: containerRef.current,
        width: containerSize.width,
        height: containerSize.height,
      });
    }
    
    // Nettoyage lors du démontage du composant
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [containerSize]);
  
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="rounded overflow-hidden shadow-lg" style={{ width: '80%', height: '80%' }}>
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  );
};

export default GameComponent;
