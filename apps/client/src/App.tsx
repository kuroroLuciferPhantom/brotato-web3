import React, { useEffect, useState } from 'react';
import GameComponent from './game/GameComponent';

const App: React.FC = () => {
  const [isWeb3Ready, setIsWeb3Ready] = useState(false);
  
  // Simuler le chargement des composants Web3
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsWeb3Ready(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="w-full h-screen bg-gray-900 text-white">
      <header className="p-4 bg-gray-800">
        <h1 className="text-2xl font-bold">Brotato Web3</h1>
      </header>
      
      <main className="w-full flex justify-center p-4">
        <div className="w-full max-w-6xl">
          {!isWeb3Ready ? (
            <div className="w-full h-[600px] flex items-center justify-center">
              <p className="text-xl">Chargement du jeu...</p>
            </div>
          ) : (
            <GameComponent />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
