// Validation des actions de jeu pour prévenir la triche

type GameState = {
  sessionId: string;
  playerPosition: { x: number; y: number };
  enemies: Array<{
    id: string;
    position: { x: number; y: number };
    health: number;
  }>;
  score: number;
  wave: number;
  timestamp: number;
};

type GameAction = {
  type: 'move' | 'shoot' | 'useItem';
  sessionId: string;
  data: Record<string, any>;
  timestamp: number;
};

type ValidationResult = {
  valid: boolean;
  error?: string;
};

export function validateGameAction(action: GameAction, currentState: GameState): ValidationResult {
  // Vérifier que l'action n'est pas trop ancienne
  const MAX_ACTION_AGE_MS = 2000; // 2 secondes
  if (Date.now() - action.timestamp > MAX_ACTION_AGE_MS) {
    return {
      valid: false,
      error: 'Action trop ancienne'
    };
  }

  // Vérifier que l'action n'est pas dans le futur (potentielle triche)
  if (action.timestamp > Date.now() + 1000) { // Marge de 1 seconde pour les décalages d'horloge
    return {
      valid: false,
      error: 'Action datée dans le futur'
    };
  }

  // Validation spécifique selon le type d'action
  switch (action.type) {
    case 'move':
      return validateMoveAction(action, currentState);
    case 'shoot':
      return validateShootAction(action, currentState);
    case 'useItem':
      return validateUseItemAction(action, currentState);
    default:
      return {
        valid: false,
        error: 'Type d\'action non reconnu'
      };
  }
}

function validateMoveAction(action: GameAction, currentState: GameState): ValidationResult {
  const { position } = action.data;
  
  // Vérifier que la position est définie
  if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
    return {
      valid: false,
      error: 'Position invalide'
    };
  }
  
  // Vérifier que la position est dans les limites du jeu
  if (position.x < 0 || position.x > 800 || position.y < 0 || position.y > 600) {
    return {
      valid: false,
      error: 'Position hors limites'
    };
  }
  
  // Vérifier que le déplacement n'est pas trop rapide (anti-speedhack)
  const currentPos = currentState.playerPosition;
  const distance = Math.sqrt(
    Math.pow(position.x - currentPos.x, 2) + Math.pow(position.y - currentPos.y, 2)
  );
  
  // Vitesse maximale du joueur (en pixels par milliseconde)
  const MAX_SPEED = 0.5; // Ajuster selon la vitesse réelle du jeu
  const timeDiff = action.timestamp - currentState.timestamp;
  const maxDistance = MAX_SPEED * timeDiff;
  
  if (distance > maxDistance) {
    return {
      valid: false,
      error: 'Déplacement trop rapide'
    };
  }
  
  return { valid: true };
}

function validateShootAction(action: GameAction, currentState: GameState): ValidationResult {
  const { direction } = action.data;
  
  // Vérifier que la direction est définie
  if (!direction || typeof direction !== 'number') {
    return {
      valid: false,
      error: 'Direction de tir invalide'
    };
  }
  
  // Vérifier le cooldown de tir
  // Dans un jeu réel, on stockerait le timestamp du dernier tir
  // Pour l'exemple, on suppose un cooldown de 200ms
  const MIN_SHOOT_INTERVAL = 200;
  
  // Ici on simulerait la vérification du dernier tir
  // Si ce système était pleinement implémenté
  
  return { valid: true };
}

function validateUseItemAction(action: GameAction, currentState: GameState): ValidationResult {
  const { itemId } = action.data;
  
  // Vérifier que l'ID de l'item est défini
  if (!itemId || typeof itemId !== 'string') {
    return {
      valid: false,
      error: 'ID d\'item invalide'
    };
  }
  
  // Vérifier que le joueur possède cet item
  // Cette logique serait plus complexe dans un jeu réel
  
  return { valid: true };
}
