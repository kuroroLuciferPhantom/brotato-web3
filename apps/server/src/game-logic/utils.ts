/**
 * Utilitaires pour la logique de jeu
 */

/**
 * Génère une seed pour la génération aléatoire déterministe
 * @returns {number} La seed générée
 */
export function generateSeed(): number {
  return Math.floor(Math.random() * 1000000000);
}

/**
 * Générateur de nombres aléatoires déterministe basé sur une seed
 * @param {number} seed - La seed initiale
 * @returns {function} Fonction qui génère un nombre aléatoire entre 0 et 1
 */
export function createRandomGenerator(seed: number) {
  // Implémentation simple du générateur congruentiel linéaire
  return function() {
    // Paramètres du générateur (valeurs standards)
    const a = 1664525;
    const c = 1013904223;
    const m = Math.pow(2, 32);
    
    // Calculer la prochaine seed
    seed = (a * seed + c) % m;
    
    // Retourner une valeur entre 0 et 1
    return seed / m;
  };
}

/**
 * Calcule la distance entre deux points
 */
export function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/**
 * Vérifie si un point est dans un rectangle
 */
export function pointInRect(
  x: number, 
  y: number, 
  rectX: number, 
  rectY: number, 
  rectWidth: number, 
  rectHeight: number
): boolean {
  return x >= rectX && x <= rectX + rectWidth && y >= rectY && y <= rectY + rectHeight;
}

/**
 * Calcule l'angle en radians entre deux points
 */
export function angleBetweenPoints(x1: number, y1: number, x2: number, y2: number): number {
  return Math.atan2(y2 - y1, x2 - x1);
}

/**
 * Convertit un angle en radians en degrés
 */
export function radToDeg(rad: number): number {
  return rad * 180 / Math.PI;
}

/**
 * Convertit un angle en degrés en radians
 */
export function degToRad(deg: number): number {
  return deg * Math.PI / 180;
}

/**
 * Déplace un point dans une direction donnée
 */
export function movePoint(
  x: number, 
  y: number, 
  angle: number, 
  distance: number
): { x: number; y: number } {
  return {
    x: x + Math.cos(angle) * distance,
    y: y + Math.sin(angle) * distance
  };
}
