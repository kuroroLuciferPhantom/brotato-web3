import Phaser from 'phaser';
import playerData from '../data/PlayerData';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Afficher un écran de chargement basique
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(240, 270, 320, 50);
    
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'Chargement...',
      style: {
        font: '20px monospace',
      }
    });
    loadingText.setOrigin(0.5, 0.5);
    
    // Ajouter un texte de titre
    const titleText = this.make.text({
      x: width / 2,
      y: height / 2 - 120,
      text: 'BROTATO WEB3',
      style: {
        font: '32px monospace',
        fontStyle: 'bold',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 6,
      }
    });
    titleText.setOrigin(0.5, 0.5);
    
    // Événements de chargement
    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(250, 280, 300 * value, 30);
    });
    
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });
    
    // Charger les assets
    this.load.image('player', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
    this.load.image('enemy', 'https://labs.phaser.io/assets/sprites/phaser-enemy.png');
    this.load.image('bullet', 'https://labs.phaser.io/assets/sprites/bullet.png');
    this.load.image('background', 'https://labs.phaser.io/assets/skies/space3.png');
    
    // Charger des assets additionnels pour les armes et items
    this.load.image('pistol', 'https://labs.phaser.io/assets/sprites/bullet.png');
    this.load.image('healthpack', 'https://labs.phaser.io/assets/sprites/firstaid.png');
    this.load.image('coin', 'https://labs.phaser.io/assets/sprites/coin.png');
    
    // Sons (à remplacer par des sons appropriés plus tard)
    this.load.audio('shoot', ['https://labs.phaser.io/assets/audio/SoundEffects/shot.wav']);
    this.load.audio('enemyDeath', ['https://labs.phaser.io/assets/audio/SoundEffects/explosion.wav']);
    this.load.audio('playerHit', ['https://labs.phaser.io/assets/audio/SoundEffects/hurt.wav']);
    this.load.audio('pickup', ['https://labs.phaser.io/assets/audio/SoundEffects/coin.wav']);
  }

  create() {
    // Initialiser/réinitialiser les données du joueur pour une nouvelle partie
    playerData.reset();
    
    // Animation de transition
    this.cameras.main.fadeOut(500);
    
    this.time.delayedCall(700, () => {
      // Afficher un message de bienvenue ou d'instructions
      const welcomeText = this.add.text(400, 300, 'Prêt à jouer ?', {
        fontSize: '32px',
        fontStyle: 'bold',
        color: '#fff',
        stroke: '#000',
        strokeThickness: 5
      }).setOrigin(0.5);
      
      const startText = this.add.text(400, 350, 'Cliquez pour commencer', {
        fontSize: '20px',
        color: '#ccc'
      }).setOrigin(0.5);
      
      // Animation du texte
      this.tweens.add({
        targets: startText,
        alpha: { from: 0.5, to: 1 },
        duration: 500,
        ease: 'Sine.InOut',
        yoyo: true,
        repeat: -1
      });
      
      // Clic pour démarrer
      this.input.once('pointerdown', () => {
        this.cameras.main.fadeOut(500);
        this.time.delayedCall(500, () => {
          this.scene.start('GameScene');
        });
      });
      
      this.cameras.main.fadeIn(500);
    });
  }
}
