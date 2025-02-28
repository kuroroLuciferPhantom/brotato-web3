// Constantes du jeu

// Paramètres du joueur
export const PLAYER_BASE_SPEED = 200;
export const PLAYER_BASE_HEALTH = 100;

// Paramètres des armes
export const WEAPON_COOLDOWN_BASE = 1000; // en ms
export const WEAPON_BASE_DAMAGE = 10;

// Paramètres des ennemis
export const ENEMY_BASE_SPEED = 80;
export const ENEMY_BASE_HEALTH = 20;
export const ENEMY_SPAWN_DELAY = 1000; // en ms
export const ENEMIES_PER_WAVE_BASE = 5;
export const ENEMIES_PER_WAVE_INCREMENT = 3;

// Paramètres des vagues
export const WAVE_DURATION = 60000; // en ms (1 minute)
export const BETWEEN_WAVES_DURATION = 10000; // en ms (10 secondes)

// Gameplay
export const GOLD_PER_KILL_BASE = 5;
export const XP_PER_KILL_BASE = 10;
export const SCORE_PER_KILL_BASE = 10;

// Web3
export const CHARACTER_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"; // à remplacer
export const WEAPON_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"; // à remplacer
export const ITEM_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"; // à remplacer

// Difficulté
export const DIFFICULTY_MULTIPLIERS = {
  EASY: 0.8,
  NORMAL: 1.0,
  HARD: 1.2,
  NIGHTMARE: 1.5
};

// Paramètres visuels
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;
