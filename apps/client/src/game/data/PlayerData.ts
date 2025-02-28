// PlayerData.ts - Stocke les données du joueur partagées entre scènes

export interface PlayerStats {
  moveSpeed: number;
  maxHealth: number;
  fireRate: number;
  damage: number;
  projectileCount: number;
  projectileSpeed: number;
}

export interface WeaponData {
  id: string;
  name: string;
  damage: number;
  fireRate: number;
  projectileCount: number;
  projectileSpeed: number;
  spriteKey: string;
}

export interface InventoryItem {
  id: string;
  type: 'weapon' | 'item';
  name: string;
  count: number;
  data: WeaponData | any; // 'any' temporaire, à typer correctement plus tard
}

export class PlayerData {
  private static instance: PlayerData;
  
  // Statistiques du joueur
  public stats: PlayerStats = {
    moveSpeed: 200,
    maxHealth: 100,
    fireRate: 500, // ms entre les tirs
    damage: 1,
    projectileCount: 1,
    projectileSpeed: 400,
  };
  
  // Inventaire de l'équipement actuel
  public inventory: InventoryItem[] = [];
  
  // Monnaie du jeu
  public money: number = 0;
  
  // Score et progression
  public score: number = 0;
  public currentWave: number = 1;
  public waveKills: number = 0;
  public totalKills: number = 0;
  
  // Armes disponibles (seront débloquées progressivement)
  public availableWeapons: WeaponData[] = [
    {
      id: 'pistol',
      name: 'Pistol',
      damage: 1,
      fireRate: 500,
      projectileCount: 1,
      projectileSpeed: 400,
      spriteKey: 'bullet'
    }
  ];
  
  private constructor() { }
  
  public static getInstance(): PlayerData {
    if (!PlayerData.instance) {
      PlayerData.instance = new PlayerData();
    }
    return PlayerData.instance;
  }
  
  // Réinitialiser les données pour une nouvelle partie
  public reset(): void {
    this.stats = {
      moveSpeed: 200,
      maxHealth: 100,
      fireRate: 500,
      damage: 1,
      projectileCount: 1,
      projectileSpeed: 400,
    };
    this.inventory = [];
    this.money = 0;
    this.score = 0;
    this.currentWave = 1;
    this.waveKills = 0;
    this.totalKills = 0;
  }
  
  // Ajouter un item à l'inventaire
  public addItem(item: InventoryItem): void {
    const existingItem = this.inventory.find(i => i.id === item.id);
    if (existingItem) {
      existingItem.count += 1;
    } else {
      this.inventory.push({ ...item, count: 1 });
    }
  }
  
  // Acheter un upgrade dans le magasin
  public buyUpgrade(upgradeId: string, cost: number): boolean {
    if (this.money < cost) return false;
    
    this.money -= cost;
    
    // Appliquer l'effet du upgrade
    switch (upgradeId) {
      case 'speedBoost':
        this.stats.moveSpeed *= 1.1; // +10% de vitesse
        break;
      case 'rapidFire':
        this.stats.fireRate *= 0.85; // -15% de délai entre les tirs
        break;
      case 'tripleShot':
        this.stats.projectileCount = 3;
        break;
      case 'healthBoost':
        this.stats.maxHealth *= 1.2; // +20% de santé
        break;
      default:
        console.warn(`Unknown upgrade: ${upgradeId}`);
        return false;
    }
    
    return true;
  }
  
  // Ajouter des kills et mettre à jour le score
  public addKill(points: number): void {
    this.waveKills += 1;
    this.totalKills += 1;
    this.score += points;
  }
  
  // Augmenter la vague
  public nextWave(): void {
    this.currentWave += 1;
    this.waveKills = 0;
    this.money += 50 + (this.currentWave * 25); // Récompense pour compléter la vague
  }
}

// Exporter une instance singleton
export default PlayerData.getInstance();
