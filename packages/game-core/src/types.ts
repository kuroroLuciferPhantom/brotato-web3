/**
 * Types partagés entre client et serveur
 */

// Structure d'un personnage
export interface Character {
  id: string;
  name: string;
  characterType: number;
  rarity: number;
  baseStats: StatValues;
  createdAt: number;
}

// Statistiques d'un personnage
export interface StatValues {
  speed: number;
  damage: number;
  health: number;
  harvesting: number;
  luck: number;
  armor: number;
}

// Structure d'un item/arme
export interface Item {
  id: string;
  name: string;
  type: ItemType;
  rarity: number;
  stats: Partial<StatValues>;
  description?: string;
  effects?: ItemEffect[];
}

// Types d'items
export enum ItemType {
  WEAPON = 'weapon',
  ARMOR = 'armor',
  ACCESSORY = 'accessory',
  CONSUMABLE = 'consumable'
}

// Effets spéciaux des items
export interface ItemEffect {
  type: EffectType;
  value: number;
  condition?: EffectCondition;
}

// Types d'effets
export enum EffectType {
  HEAL = 'heal',
  DAMAGE = 'damage',
  STUN = 'stun',
  SLOW = 'slow',
  BURN = 'burn',
  POISON = 'poison',
  GOLD_BOOST = 'goldBoost',
  XP_BOOST = 'xpBoost'
}

// Conditions pour les effets
export enum EffectCondition {
  ON_HIT = 'onHit',
  ON_KILL = 'onKill',
  ON_DAMAGE_TAKEN = 'onDamageTaken',
  ON_WAVE_START = 'onWaveStart',
  ON_WAVE_END = 'onWaveEnd'
}

// Structure d'un ennemi
export interface Enemy {
  id: string;
  type: number;
  health: number;
  maxHealth: number;
  damage: number;
  speed: number;
  position: { x: number; y: number };
  goldValue: number;
  xpValue: number;
}

// Structure d'une partie
export interface GameSession {
  sessionId: string;
  userId: string;
  characterId: string;
  seed: number;
  currentWave: number;
  score: number;
  kills: number;
  gold: number;
  items: string[];
  startTime: number;
  lastUpdateTime: number;
}

// État du jeu pour le client
export interface GameState {
  sessionId: string;
  playerPosition: { x: number; y: number };
  enemies: Enemy[];
  score: number;
  wave: number;
  timestamp: number;
  health: number;
  maxHealth: number;
  gold: number;
  items: Item[];
}

// Action du jeu envoyée au serveur
export interface GameAction {
  type: 'move' | 'shoot' | 'useItem' | 'buyItem' | 'endWave';
  sessionId: string;
  data: Record<string, any>;
  timestamp: number;
}

// Résultat d'une action
export interface ActionResult {
  success: boolean;
  action: GameAction;
  stateUpdate?: Partial<GameState>;
}

// Erreur de jeu
export interface GameError {
  code: string;
  message: string;
  action?: GameAction;
}
