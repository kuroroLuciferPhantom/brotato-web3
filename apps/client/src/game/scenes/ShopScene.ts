import Phaser from 'phaser';
import playerData from '../data/PlayerData';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  effect: () => void;
}

export default class ShopScene extends Phaser.Scene {
  private availableItems: ShopItem[] = [];
  private itemContainers: Phaser.GameObjects.Container[] = [];
  private moneyText!: Phaser.GameObjects.Text;
  private nextRoundBtn!: Phaser.GameObjects.Text;
  private statsText!: Phaser.GameObjects.Text;

  constructor() {
    super('ShopScene');
  }

  create() {
    // Fond d'écran
    this.add.rectangle(0, 0, 800, 600, 0x111111)
      .setOrigin(0)
      .setAlpha(0.8);
    
    // Titre de la boutique
    this.add.text(400, 50, 'SHOP', {
      fontSize: '36px',
      fontStyle: 'bold',
      color: '#fff',
      stroke: '#000',
      strokeThickness: 6
    }).setOrigin(0.5);
    
    // Information sur la vague et le score
    this.add.text(400, 90, `Wave ${playerData.currentWave} | Score: ${playerData.score}`, {
      fontSize: '18px',
      color: '#ccc'
    }).setOrigin(0.5);
    
    // Texte pour l'argent disponible
    this.moneyText = this.add.text(400, 120, `Money: ${playerData.money}`, {
      fontSize: '24px',
      color: '#fc0',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    // Définir les items disponibles à l'achat
    this.defineShopItems();
    
    // Afficher les items disponibles
    this.displayShopItems();
    
    // Afficher les statistiques actuelles du joueur
    this.displayPlayerStats();
    
    // Bouton pour passer au prochain round
    this.nextRoundBtn = this.add.text(400, 530, 'CONTINUE TO NEXT WAVE', {
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#fff',
      backgroundColor: '#446',
      padding: { x: 20, y: 10 },
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5);
    this.nextRoundBtn.setInteractive({ useHandCursor: true });
    this.nextRoundBtn.on('pointerdown', () => {
      // Retourner à la scène de jeu
      this.scene.start('GameScene');
    });
    
    // Ajouter un effet de survol pour le bouton
    this.nextRoundBtn.on('pointerover', () => {
      this.nextRoundBtn.setBackgroundColor('#558');
    });
    this.nextRoundBtn.on('pointerout', () => {
      this.nextRoundBtn.setBackgroundColor('#446');
    });
  }
  
  private defineShopItems() {
    // Définir les items disponibles dans le shop
    this.availableItems = [
      {
        id: 'speedBoost',
        name: 'Speed Boost',
        description: 'Increases movement speed by 10%',
        price: 50,
        image: 'player',
        effect: () => {
          playerData.stats.moveSpeed *= 1.1;
          this.updatePlayerStats();
        }
      },
      {
        id: 'rapidFire',
        name: 'Rapid Fire',
        description: 'Reduces firing cooldown by 15%',
        price: 75,
        image: 'bullet',
        effect: () => {
          playerData.stats.fireRate *= 0.85;
          this.updatePlayerStats();
        }
      },
      {
        id: 'tripleShot',
        name: 'Triple Shot',
        description: 'Fire 3 bullets at once',
        price: 100,
        image: 'bullet',
        effect: () => {
          playerData.stats.projectileCount = 3;
          this.updatePlayerStats();
        }
      },
      {
        id: 'healthBoost',
        name: 'Health Boost',
        description: 'Increases max health by 20%',
        price: 80,
        image: 'player',
        effect: () => {
          playerData.stats.maxHealth *= 1.2;
          this.updatePlayerStats();
        }
      },
      {
        id: 'damageBoost',
        name: 'Damage Boost',
        description: 'Increases bullet damage by 25%',
        price: 85,
        image: 'bullet',
        effect: () => {
          playerData.stats.damage *= 1.25;
          this.updatePlayerStats();
        }
      },
      {
        id: 'projectileSpeed',
        name: 'Bullet Velocity',
        description: 'Increases bullet speed by 15%',
        price: 60,
        image: 'bullet',
        effect: () => {
          playerData.stats.projectileSpeed *= 1.15;
          this.updatePlayerStats();
        }
      }
    ];
  }
  
  private displayShopItems() {
    // Nettoyer les anciens conteneurs d'items s'il y en a
    this.itemContainers.forEach(container => container.destroy());
    this.itemContainers = [];
    
    // Calculer la disposition des items
    const itemsPerRow = 3;
    const itemWidth = 220;
    const itemHeight = 150;
    const startX = 400 - ((itemWidth * itemsPerRow) / 2) + (itemWidth / 2);
    const startY = 220;
    const padding = 20;
    
    // Afficher chaque item disponible
    this.availableItems.forEach((item, index) => {
      const row = Math.floor(index / itemsPerRow);
      const col = index % itemsPerRow;
      const x = startX + (col * (itemWidth + padding));
      const y = startY + (row * (itemHeight + padding));
      
      // Créer un conteneur pour chaque item
      const itemContainer = this.add.container(x, y);
      
      // Fond de l'item
      const bg = this.add.rectangle(0, 0, itemWidth, itemHeight, 0x333333)
        .setStrokeStyle(2, 0x666666);
      
      // Image de l'item
      const image = this.add.image(-80, 0, item.image)
        .setScale(0.5);
      
      // Nom de l'item
      const nameText = this.add.text(0, -50, item.name, {
        fontSize: '16px',
        fontStyle: 'bold',
        color: '#fff'
      }).setOrigin(0.5, 0.5);
      
      // Description de l'item
      const descText = this.add.text(0, -20, item.description, {
        fontSize: '12px',
        color: '#ccc',
        wordWrap: { width: itemWidth - 40 }
      }).setOrigin(0.5, 0.5);
      
      // Prix de l'item
      const priceText = this.add.text(0, 30, `${item.price} coins`, {
        fontSize: '14px',
        color: '#fc0'
      }).setOrigin(0.5, 0.5);
      
      // Bouton d'achat
      const buyButton = this.add.text(0, 60, 'BUY', {
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#fff',
        backgroundColor: item.price <= playerData.money ? '#080' : '#800',
        padding: { x: 10, y: 5 }
      }).setOrigin(0.5, 0.5);
      
      // Activer le bouton si le joueur a assez d'argent
      if (item.price <= playerData.money) {
        buyButton.setInteractive({ useHandCursor: true });
        
        // Effet de survol
        buyButton.on('pointerover', () => {
          buyButton.setBackgroundColor('#0a0');
        });
        buyButton.on('pointerout', () => {
          buyButton.setBackgroundColor('#080');
        });
        
        // Logique d'achat
        buyButton.on('pointerdown', () => {
          playerData.money -= item.price;
          this.moneyText.setText(`Money: ${playerData.money}`);
          
          // Appliquer l'effet de l'item
          item.effect();
          
          // Désactiver le bouton après l'achat
          buyButton.disableInteractive();
          buyButton.setBackgroundColor('#555');
          buyButton.setText('PURCHASED');
          
          // Mettre à jour tous les boutons en fonction de l'argent restant
          this.updateBuyButtons();
        });
      }
      
      // Ajouter tous les éléments au conteneur
      itemContainer.add([bg, image, nameText, descText, priceText, buyButton]);
      
      // Stocker le conteneur pour pouvoir le manipuler plus tard
      this.itemContainers.push(itemContainer);
    });
  }
  
  private updateBuyButtons() {
    // Mettre à jour l'état des boutons d'achat en fonction de l'argent disponible
    this.itemContainers.forEach((container, index) => {
      const item = this.availableItems[index];
      const buyButton = container.list[5] as Phaser.GameObjects.Text;
      
      // Si le bouton n'est pas déjà acheté et qu'on n'a pas assez d'argent
      if (buyButton.text === 'BUY' && item.price > playerData.money) {
        buyButton.disableInteractive();
        buyButton.setBackgroundColor('#800');
      }
    });
  }
  
  private displayPlayerStats() {
    // Créer un panneau pour les statistiques du joueur
    const statsPanel = this.add.rectangle(650, 450, 280, 200, 0x222222)
      .setStrokeStyle(2, 0x444444);
    
    // Titre du panneau
    this.add.text(650, 370, 'PLAYER STATS', {
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#fff'
    }).setOrigin(0.5);
    
    // Texte des statistiques
    this.statsText = this.add.text(520, 400, this.getStatsText(), {
      fontSize: '14px',
      color: '#ccc',
      lineSpacing: 8
    });
  }
  
  private getStatsText(): string {
    // Formater les statistiques du joueur pour l'affichage
    return [
      `Movement Speed: ${playerData.stats.moveSpeed.toFixed(1)}`,
      `Max Health: ${playerData.stats.maxHealth.toFixed(0)}`,
      `Fire Rate: ${(1000 / playerData.stats.fireRate).toFixed(1)} shots/s`,
      `Damage: ${playerData.stats.damage.toFixed(1)}`,
      `Projectiles: ${playerData.stats.projectileCount}`,
      `Projectile Speed: ${playerData.stats.projectileSpeed.toFixed(0)}`
    ].join('\n');
  }
  
  private updatePlayerStats() {
    // Mettre à jour l'affichage des statistiques
    if (this.statsText) {
      this.statsText.setText(this.getStatsText());
    }
  }
}
