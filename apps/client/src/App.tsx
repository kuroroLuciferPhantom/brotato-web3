import { useState } from 'react';
import GameComponent from './game/GameComponent';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Brotato Web3</h1>
      </header>
      
      <main className="app-content">
        <div className="game-container">
          <GameComponent />
        </div>
      </main>
      
      <footer className="app-footer">
        <p>Brotato Web3 - Un jeu roguelite avec intégration blockchain (En développement)</p>
      </footer>
    </div>
  );
}

export default App;
