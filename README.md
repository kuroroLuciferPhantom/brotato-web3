# Brotato Web3 🎮

Un jeu roguelite/action inspiré de Brotato, jouable sur navigateur web (PC et mobile) avec intégration Web3 pour la gestion des personnages, objets et scores.

## Objectifs principaux 🎯

- Créer une expérience de jeu fluide et addictive accessible sur navigateur
- Intégrer des fonctionnalités Web3 sans perturber le gameplay
- Mettre en place un système de NFT pour les personnages et objets
- Assurer la sécurité et prévenir la triche
- Garantir la compatibilité multi-plateforme (PC/mobile)

## Structure du projet 📂

Ce projet est organisé en monorepo avec pnpm. Voici la structure principale:

```
brotato-web3/
├── apps/
│   ├── client/                 # Application frontend (Vite + React + Phaser)
│   ├── server/                 # Serveur (Fastify + Socket.io)
│   └── contracts/              # Smart contracts Solidity avec Foundry
├── packages/
│   ├── config/                 # Configurations partagées
│   ├── game-core/              # Logique de jeu partagée
│   ├── ui/                     # Composants UI réutilisables
│   └── web3-core/              # Intégration Web3 partagée
```

## Technologies utilisées 🛠️

- **Front-end**: React, Phaser.js, TailwindCSS
- **Back-end**: Node.js, Fastify, Socket.io, PostgreSQL, Redis
- **Web3**: Solidity, Foundry, viem
- **Outils**: TypeScript, ESLint, Prettier, pnpm

## Installation et démarrage 🚀

```bash
# Installer pnpm (si nécessaire)
npm install -g pnpm

# Installer les dépendances
pnpm install

# Démarrer le projet en développement
pnpm dev
```

## Licence 📝

MIT
