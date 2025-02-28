import Phaser from 'phaser';

interface ShopItem {
  name: string;
  description: string;
  price: number;
  image: string;
  effect: (scene: ShopScene) => void;
}

interface ShopSceneData {
  currentWave: number;
  score: number;
}

export default class ShopScene extends Phaser.Scene {
  private currentWave: number = 1;
  private score: number = 0;
  private availableItems: ShopItem[] = [];
  private money: number = 100;
  private moneyText!: Phaser.GameObjects.Text;
  private nextRoundBtn!: Phaser.GameObjects.Text;
  private itemContainers: Phaser.GameObjects.Container[] = [];

  constructor() {
    super('ShopScene');
  }

  init(data: ShopSceneData) {
    this.currentWave = data.currentWave;
    this.score = data.score;
    
    // Donner de l'argent au joueur pour acheter des items
    this.money = 50 + (this.currentWave * 25);
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
    this.add.text(400, 90, `Wave ${this.currentWave} | Score: ${this.score}`, {
      fontSize: '18px',
      color: '#ccc'
    }).setOrigin(0.5);
    
    // Texte pour l'argent disponible
    this.moneyText = this.add.text(400, 120, `Money: ${this.money}`, {
      fontSize: '24px',
      color: '#fc0',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    // Définir les items disponibles à l'achat
    this.defineShopItems();
    
    // Afficher les items disponibles
    this.displayShopItems();
    
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
    // Pour l'instant, ce sont des exemples, à l'avenir ils pourraient être liés à des NFTs
    this.availableItems = [
      {
        name: 'Speed Boost',
        description: 'Increases movement speed by 10%',
        price: 50,
        image: 'player', // Utilisation temporaire de l'image du joueur
        effect: (scene) => {
          // Cette fonction serait utilisée dans une version future pour appliquer l'effet
          console.log('Speed boost purchased');
        }
      },
      {
        name: 'Rapid Fire',
        description: 'Reduces firing cooldown by 15%',
        price: 75,
        image: 'bullet', // Utilisation temporaire de l'image du bullet
        effect: (scene) => {
          console.log('Rapid fire purchased');
        }
      },
      {
        name: 'Triple Shot',
        description: 'Fire 3 bullets at once',
        price: 100,
        image: 'bullet', // Utilisation temporaire de l'image du bullet
        effect: (scene) => {
          console.log('Triple shot purchased');
        }
      },
      {
        name: 'Health Boost',
        description: 'Increases max health by 20%',
        price: 80,
        image: 'player', // Utilisation temporaire de l'image du joueur
        effect: (scene) => {
          console.log('Health boost purchased');
        }
      }
    ];
  }
  
  private displayShopItems() {
    // Nettoyer les anciens conteneurs d'items s'il y en a
    this.itemContainers.forEach(container => container.destroy());
    this.itemContainers = [];
    
    // Calculer la disposition des items
    const itemsPerRow = 2;
    const itemWidth = 300;
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
      const image = this.add.image(-100, 0, item.image)
        .setScale(0.5);
      
      // Nom de l'item
      const nameText = this.add.text(0, -50, item.name, {
        fontSize: '18px',
        fontStyle: 'bold',
        color: '#fff'
      }).setOrigin(0.5, 0.5);
      
      // Description de l'item
      const descText = this.add.text(0, -20, item.description, {
        fontSize: '14px',
        color: '#ccc',
        wordWrap: { width: itemWidth - 120 }
      }).setOrigin(0.5, 0.5);
      
      // Prix de l'item
      const priceText = this.add.text(0, 30, `${item.price} coins`, {
        fontSize: '16px',
        color: '#fc0'
      }).setOrigin(0.5, 0.5);
      
      // Bouton d'achat
      const buyButton = this.add.text(0, 60, 'BUY', {
        fontSize: '16px',
        fontStyle: 'bold',
        color: '#fff',
        backgroundColor: item.price <= this.money ? '#080' : '#800',
        padding: { x: 10, y: 5 }
      }).setOrigin(0.5, 0.5);
      
      // Activer le bouton si le joueur a assez d'argent
      if (item.price <= this.money) {
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
          this.money -= item.price;
          this.moneyText.setText(`Money: ${this.money}`);
          
          // Appliquer l'effet de l'item
          item.effect(this);
          
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
      
      // Si le bouton n'est pas déjà acheté et qu'on a assez d'argent
      if (buyButton.text === 'BUY' && item.price > this.money) {
        buyButton.disableInteractive();
        buyButton.setBackgroundColor('#800');
      }
    });
  }
}
