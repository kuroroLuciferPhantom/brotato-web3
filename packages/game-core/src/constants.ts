/**
 * Constantes partagées entre client et serveur
 */

// Configuration du jeu
export const GAME_CONFIG = {
  // Dimensions de la zone de jeu
  WIDTH: 800,
  HEIGHT: 600,
  
  // Configuration des vagues
  WAVE_DURATION_SEC: 60,
  ENEMIES_PER_WAVE_BASE: 5,
  ENEMIES_PER_WAVE_SCALING: 2, // Ennemis supplémentaires par vague
  
  // Configuration du joueur
  PLAYER_BASE_SPEED: 200,
  PLAYER_BASE_HEALTH: 100,
  
  // Configuration des armes
  WEAPON_COOLDOWN_BASE: 500, // ms
  WEAPON_DAMAGE_BASE: 10,
  
  // Économie
  GOLD_PER_ENEMY_BASE: 5,
  GOLD_PER_WAVE_BASE: 10,
  
  // Probabilités de drop
  ITEM_DROP_CHANCE: 0.05, // 5% par ennemi
  ITEM_RARITY_CHANCES: [
    0.70, // Commun (70%)
    0.20, // Rare (20%)
    0.09, // Épique (9%)
    0.01  // Légendaire (1%)
  ],
  
  // Limites
  MAX_ITEMS_EQUIPPED: 6,
  MAX_HEALTH_MULTIPLIER: 5,
  MAX_SPEED_MULTIPLIER: 3,
  MAX_DAMAGE_MULTIPLIER: 10,
  
  // Configuration anti-triche
  MAX_ACTION_AGE_MS: 2000, // Actions plus anciennes sont rejetées
  MAX_PLAYER_SPEED: 500, // Vitesse maximale autorisée (pixels/seconde)
  MIN_SHOOT_INTERVAL: 100, // Intervalle minimum entre les tirs (ms)
};

// Noms des types de personnages
export const CHARACTER_TYPE_NAMES = [
  'Warrior',
  'Archer',
  'Mage',
  'Rogue',
  'Tank',
  'Support'
];

// Noms des raretés
export const RARITY_NAMES = [
  'Common',
  'Rare',
  'Epic',
  'Legendary'
];

// Couleurs selon la rareté (codes HEX)
export const RARITY_COLORS = [
  '#6E7271', // Commun (gris)
  '#32CD32', // Rare (vert)
  '#9370DB', // Épique (violet)
  '#FFD700'  // Légendaire (or)
];

// Types d'ennemis
export const ENEMY_TYPES = {
  BASIC: 0,
  FAST: 1,
  TANK: 2,
  RANGED: 3,
  BOSS: 4
};

// Configuration des ennemis par type
export const ENEMY_CONFIG = [
  { // BASIC
    healthMultiplier: 1.0,
    damageMultiplier: 1.0,
    speedMultiplier: 1.0,
    goldMultiplier: 1.0,
    xpMultiplier: 1.0,
    scale: 1.0
  },
  { // FAST
    healthMultiplier: 0.7,
    damageMultiplier: 0.8,
    speedMultiplier: 1.8,
    goldMultiplier: 1.2,
    xpMultiplier: 1.1,
    scale: 0.8
  },
  { // TANK
    healthMultiplier: 2.5,
    damageMultiplier: 1.2,
    speedMultiplier: 0.6,
    goldMultiplier: 1.5,
    xpMultiplier: 1.3,
    scale: 1.4
  },
  { // RANGED
    healthMultiplier: 0.8,
    damageMultiplier: 1.5,
    speedMultiplier: 0.9,
    goldMultiplier: 1.3,
    xpMultiplier: 1.2,
    scale: 0.9
  },
  { // BOSS
    healthMultiplier: 5.0,
    damageMultiplier: 2.0,
    speedMultiplier: 0.7,
    goldMultiplier: 5.0,
    xpMultiplier: 5.0,
    scale: 2.0
  }
];

// Échelle de difficulté par vague
export const WAVE_SCALING = {
  HEALTH: 0.1, // +10% de santé par vague
  DAMAGE: 0.08, // +8% de dégâts par vague
  SPEED: 0.05, // +5% de vitesse par vague
  GOLD: 0.12, // +12% d'or par vague
  XP: 0.1 // +10% d'XP par vague
};
