import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { GameConfig } from './config';

const GameComponent: React.FC = () => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Seulement créer le jeu s'il n'existe pas déjà
    if (!gameRef.current && containerRef.current) {
      // Créer l'instance du jeu Phaser
      gameRef.current = new Phaser.Game({
        ...GameConfig,
        parent: containerRef.current,
      });
    }
    
    // Nettoyage lors du démontage du composant
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);
  
  return (
    <div className="rounded overflow-hidden shadow-lg">
      <div ref={containerRef} className="w-full h-[600px]" />
    </div>
  );
};

export default GameComponent;
