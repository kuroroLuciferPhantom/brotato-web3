# Brotato Web3

Un jeu de type roguelite/action inspiré de Brotato, jouable sur navigateur web (PC et mobile) avec intégration Web3 pour la gestion des personnages, objets et scores.

## Fonctionnalités actuelles

### Version 0.1.0

- 🎮 Gameplay de base
  - Tir automatique (le personnage tire périodiquement dans des directions aléatoires)
  - Ennemis qui poursuivent le joueur
  - Système de vagues d'ennemis progressives
  - Barre de vie et système de dégâts

- 🏪 Boutique entre les vagues
  - Achat d'améliorations avec l'argent gagné pendant le jeu
  - Statistiques du joueur affichées et modifiées en temps réel
  - Diverses améliorations disponibles (vitesse, santé, cadence de tir, etc.)

- 📊 Système de progression
  - Score et suivi des kills
  - Difficulté croissante avec les vagues
  - Statistiques de personnage persistantes entre les vagues

## Fonctionnalités à venir

- 🎲 Système de personnages uniques avec capacités spéciales
- 🔫 Armes et équipements déblocables
- 🧩 Intégration Web3 complète
  - NFTs pour les personnages et objets rares
  - Stockage des scores et des réussites sur la blockchain
  - Marché de trading d'items et de personnages

## Structure du projet

Le projet est organisé en monorepo avec pnpm :

```
brotato-web3/
├── apps/
│   ├── client/           # Application frontend (React + Phaser)
│   ├── server/           # Serveur de jeu 
│   └── contracts/        # Smart contracts (à venir)
│
└── packages/
    ├── config/           # Configurations partagées
    ├── game-core/        # Logique de jeu partagée 
    ├── ui/               # Composants UI
    └── web3-core/        # Fonctions Web3 partagées
```

## Aspects techniques

- **Frontend**: React 18 + Phaser 3
- **Backend**: Node.js (à venir)
- **Web3**: Polygon ou Immutable X (à venir)
- **Tooling**: TypeScript, Vite, pnpm monorepo

## Comment jouer

### Contrôles
- Utilisez les flèches directionnelles pour déplacer le personnage
- Évitez les ennemis et laissez votre personnage tirer automatiquement
- Après chaque vague, achetez des améliorations dans la boutique

### Installation et lancement

```bash
# Installer les dépendances
pnpm install

# Lancer le jeu en développement
pnpm dev
```

## Roadmap

- [x] Système de tir automatique
- [x] Système de vagues avec boutique entre les rounds
- [x] Statistiques et améliorations du personnage
- [ ] Systèmes d'armes variées et équipement
- [ ] Personnages avec capacités uniques
- [ ] Mode hardcore et classements
- [ ] Intégration Web3 avec NFTs
- [ ] Événements communautaires et tournois

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir des issues ou des pull requests.

## Licence

[MIT](LICENSE)
