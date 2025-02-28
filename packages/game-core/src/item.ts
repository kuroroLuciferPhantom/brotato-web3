import { CharacterStats, Item, ItemEffect, ItemEffectTrigger, ItemEffectType, ItemType, Rarity } from './types';

// Statistiques de base par type d'objet
const BASE_ITEM_STATS: Record<ItemType, Partial<CharacterStats>> = {
  [ItemType.HELMET]: {
    health: 15,
    defense: 5
  },
  [ItemType.ARMOR]: {
    health: 25,
    defense: 10
  },
  [ItemType.BOOTS]: {
    speed: 15,
    defense: 3
  },
  [ItemType.GLOVES]: {
    attackSpeed: 10,
    damage: 5
  },
  [ItemType.AMULET]: {
    range: 10,
    damage: 8
  },
  [ItemType.RING]: {
    damage: 5,
    attackSpeed: 5
  }
};

// Multiplicateurs de statistiques par rareté
const ITEM_RARITY_MULTIPLIERS: Record<Rarity, number> = {
  [Rarity.COMMON]: 1.0,
  [Rarity.UNCOMMON]: 1.2,
  [Rarity.RARE]: 1.4,
  [Rarity.EPIC]: 1.7,
  [Rarity.LEGENDARY]: 2.5
};

// Noms par type d'objet
const ITEM_NAMES: Record<ItemType, string[]> = {
  [ItemType.HELMET]: ['Visage de Brotection', 'Heaume de Lumière', 'Casque du Voyageur'],
  [ItemType.ARMOR]: ['Armure des Anciens', 'Cuirasse du Protecteur', 'Vêtement du Chasseur'],
  [ItemType.BOOTS]: ['Bottes de Célérité', 'Sandales du Vent', 'Chaussures du Nomade'],
  [ItemType.GLOVES]: ['Gantelets du Pouvoir', 'Gants du Briseur', 'Mitaines de Précision'],
  [ItemType.AMULET]: ['Amulette du Destin', 'Pendentif des Arcanes', 'Médaillon de l\'Âme'],
  [ItemType.RING]: ['Anneau de l\'Oracle', 'Bague du Crépuscule', 'Cercle de Vitalité']
};

// Effets possibles par rareté
const POSSIBLE_EFFECTS: Record<Rarity, ItemEffectType[]> = {
  [Rarity.COMMON]: [ItemEffectType.HEALTH_REGEN],
  [Rarity.UNCOMMON]: [ItemEffectType.HEALTH_REGEN, ItemEffectType.GOLD_BOOST],
  [Rarity.RARE]: [ItemEffectType.HEALTH_REGEN, ItemEffectType.GOLD_BOOST, ItemEffectType.XP_BOOST],
  [Rarity.EPIC]: [ItemEffectType.HEALTH_REGEN, ItemEffectType.GOLD_BOOST, ItemEffectType.XP_BOOST, ItemEffectType.CHANCE_TO_DODGE],
  [Rarity.LEGENDARY]: [ItemEffectType.HEALTH_REGEN, ItemEffectType.GOLD_BOOST, ItemEffectType.XP_BOOST, ItemEffectType.CHANCE_TO_DODGE, ItemEffectType.CHANCE_TO_CRIT, ItemEffectType.DAMAGE_REFLECT]
};

// Valeurs de base des effets
const BASE_EFFECT_VALUES: Record<ItemEffectType, number> = {
  [ItemEffectType.HEALTH_REGEN]: 1,
  [ItemEffectType.GOLD_BOOST]: 10,
  [ItemEffectType.XP_BOOST]: 5,
  [ItemEffectType.DAMAGE_REFLECT]: 15,
  [ItemEffectType.CHANCE_TO_DODGE]: 5,
  [ItemEffectType.CHANCE_TO_CRIT]: 10
};

/**
 * Crée un nouvel objet avec les attributs spécifiés
 */
export function createItem(params: {
  id: string;
  type: ItemType;
  rarity: Rarity;
  tokenId?: string;
  contractAddress?: string;
}): Item {
  const { id, type, rarity, tokenId, contractAddress } = params;
  
  // Récupérer les stats de base du type
  const baseStats = { ...BASE_ITEM_STATS[type] };
  
  // Appliquer le multiplicateur de rareté
  const multiplier = ITEM_RARITY_MULTIPLIERS[rarity];
  const statBoosts: Partial<CharacterStats> = {};
  
  // Calculer les nouvelles valeurs avec le multiplicateur
  Object.entries(baseStats).forEach(([key, value]) => {
    const statKey = key as keyof CharacterStats;
    if (value !== undefined) {
      statBoosts[statKey] = Math.round(value * multiplier);
    }
  });
  
  // Générer des effets en fonction de la rareté
  const effects: ItemEffect[] = [];
  const possibleEffects = POSSIBLE_EFFECTS[rarity];
  
  // Pour chaque rareté, on ajoute un nombre d'effets différent
  const numEffects = {
    [Rarity.COMMON]: 0,
    [Rarity.UNCOMMON]: 1,
    [Rarity.RARE]: 1,
    [Rarity.EPIC]: 2,
    [Rarity.LEGENDARY]: 3
  }[rarity];
  
  // Mélanger les effets possibles et en prendre les premiers
  const shuffledEffects = [...possibleEffects].sort(() => Math.random() - 0.5).slice(0, numEffects);
  
  shuffledEffects.forEach(effectType => {
    const baseValue = BASE_EFFECT_VALUES[effectType];
    const value = Math.round(baseValue * multiplier);
    
    // Définir le déclencheur de l'effet
    let trigger: ItemEffectTrigger;
    switch (effectType) {
      case ItemEffectType.HEALTH_REGEN:
      case ItemEffectType.GOLD_BOOST:
      case ItemEffectType.XP_BOOST:
        trigger = ItemEffectTrigger.PASSIVE;
        break;
      case ItemEffectType.DAMAGE_REFLECT:
        trigger = ItemEffectTrigger.ON_DAMAGE_TAKEN;
        break;
      case ItemEffectType.CHANCE_TO_DODGE:
        trigger = ItemEffectTrigger.ON_DAMAGE_TAKEN;
        break;
      case ItemEffectType.CHANCE_TO_CRIT:
        trigger = ItemEffectTrigger.ON_HIT;
        break;
      default:
        trigger = ItemEffectTrigger.PASSIVE;
    }
    
    effects.push({
      type: effectType,
      value,
      trigger
    });
  });
  
  // Choisir un nom aléatoire en fonction du type
  const names = ITEM_NAMES[type];
  const name = names[Math.floor(Math.random() * names.length)];
  
  return {
    id,
    name,
    type,
    rarity,
    statBoosts,
    effects,
    tokenId,
    contractAddress
  };
}

/**
 * Les objets de départ disponibles sans NFT
 */
export const STARTER_ITEMS: Item[] = [
  createItem({ id: 'starter-helmet', type: ItemType.HELMET, rarity: Rarity.COMMON }),
  createItem({ id: 'starter-armor', type: ItemType.ARMOR, rarity: Rarity.COMMON }),
  createItem({ id: 'starter-boots', type: ItemType.BOOTS, rarity: Rarity.COMMON })
];
