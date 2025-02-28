import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private enemies!: Phaser.Physics.Arcade.Group;
  private bullets!: Phaser.Physics.Arcade.Group;
  private lastFired: number = 0;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private scoreText!: Phaser.GameObjects.Text;
  private score: number = 0;
  private waveText!: Phaser.GameObjects.Text;
  private currentWave: number = 1;
  private enemiesKilled: number = 0;
  private enemiesPerWave: number = 5;
  private enemySpawnTimer: number = 0;
  private fireRate: number = 500; // Temps en ms entre chaque tir automatique
  private waveCompleted: boolean = false;
  private nextRoundBtn!: Phaser.GameObjects.Text;
  private waveCompletedText!: Phaser.GameObjects.Text;

  constructor() {
    super('GameScene');
  }

  create() {
    // Réinitialiser l'état du jeu si on revient de la scène shop
    this.waveCompleted = false;
    
    // Ajouter un fond d'écran
    this.add.tileSprite(0, 0, 800, 600, 'background')
      .setOrigin(0)
      .setScrollFactor(0, 0);

    // Créer le joueur
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(1);

    // Créer le groupe d'ennemis
    this.enemies = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Sprite,
      maxSize: 100,
    });

    // Créer le groupe de projectiles
    this.bullets = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Sprite,
      maxSize: 30,
      runChildUpdate: true
    });

    // Collision entre projectiles et ennemis
    this.physics.add.collider(this.bullets, this.enemies, this.bulletHitEnemy, undefined, this);

    // Collision entre joueur et ennemis
    this.physics.add.collider(this.player, this.enemies, this.playerHitEnemy, undefined, this);

    // Configurer les contrôles
    this.cursors = this.input.keyboard!.createCursorKeys();
    
    // Ajouter le texte du score
    this.scoreText = this.add.text(16, 16, 'Score: 0', { 
      fontSize: '18px', 
      color: '#fff',
      stroke: '#000',
      strokeThickness: 3
    });
    this.scoreText.setScrollFactor(0);

    // Ajouter le texte de la vague
    this.waveText = this.add.text(16, 40, 'Wave: 1', { 
      fontSize: '18px', 
      color: '#fff',
      stroke: '#000',
      strokeThickness: 3
    });
    this.waveText.setScrollFactor(0);
    
    // Créer le texte de vague complétée (caché par défaut)
    this.waveCompletedText = this.add.text(400, 250, 'WAVE COMPLETED!', {
      fontSize: '32px',
      fontStyle: 'bold',
      color: '#fff',
      stroke: '#000',
      strokeThickness: 5
    }).setOrigin(0.5);
    this.waveCompletedText.setVisible(false);
    
    // Créer le bouton pour passer au prochain round (caché par défaut)
    this.nextRoundBtn = this.add.text(400, 350, 'NEXT ROUND', {
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#ff0',
      backgroundColor: '#333',
      padding: { x: 20, y: 10 },
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5);
    this.nextRoundBtn.setInteractive({ useHandCursor: true });
    this.nextRoundBtn.on('pointerdown', () => {
      // Passer à la scène de shop
      this.scene.start('ShopScene', { 
        currentWave: this.currentWave,
        score: this.score
      });
    });
    this.nextRoundBtn.setVisible(false);
  }

  update(time: number, delta: number) {
    // Ne pas mettre à jour le jeu si la vague est terminée
    if (this.waveCompleted) return;
    
    // Mouvement du joueur
    this.handlePlayerMovement();
    
    // Tir automatique périodique
    if (time > this.lastFired) {
      this.fireWeapon(time);
    }
    
    // Mise à jour des ennemis pour qu'ils suivent le joueur
    this.enemies.getChildren().forEach((enemy: Phaser.GameObjects.GameObject) => {
      const e = enemy as Phaser.Physics.Arcade.Sprite;
      this.physics.moveToObject(e, this.player, 100);
    });
    
    // Génération d'ennemis périodique
    this.enemySpawnTimer += delta;
    if (this.enemySpawnTimer > 1000 && this.enemies.countActive() < this.currentWave * this.enemiesPerWave) {
      this.spawnEnemy();
      this.enemySpawnTimer = 0;
    }
    
    // Nettoyage des balles hors de l'écran
    this.bullets.getChildren().forEach((bullet: Phaser.GameObjects.GameObject) => {
      const b = bullet as Phaser.Physics.Arcade.Sprite;
      if (b.active && !this.physics.world.bounds.contains(b.x, b.y)) {
        b.setActive(false);
        b.setVisible(false);
      }
    });
  }

  private handlePlayerMovement() {
    // Réinitialiser la vélocité
    this.player.setVelocity(0);

    // Mouvement horizontal
    if (this.cursors.left!.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right!.isDown) {
      this.player.setVelocityX(200);
    }

    // Mouvement vertical
    if (this.cursors.up!.isDown) {
      this.player.setVelocityY(-200);
    } else if (this.cursors.down!.isDown) {
      this.player.setVelocityY(200);
    }
  }
  
  private fireWeapon(time: number) {
    const bullet = this.bullets.get() as Phaser.Physics.Arcade.Sprite;
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setPosition(this.player.x, this.player.y);
      
      // Direction aléatoire pour simplifier (à la Brotato)
      const angle = Phaser.Math.Between(0, 360);
      this.physics.velocityFromAngle(angle, 400, bullet.body.velocity);
      
      bullet.setRotation(angle * Math.PI / 180);
      
      this.lastFired = time + this.fireRate; // Délai entre les tirs automatiques
    }
  }

  private spawnEnemy() {
    // Générer l'ennemi à une position aléatoire au bord de l'écran
    let x, y;
    if (Phaser.Math.Between(0, 1) === 0) {
      // Spawn sur les côtés gauche ou droit
      x = Phaser.Math.Between(0, 1) === 0 ? 0 : 800;
      y = Phaser.Math.Between(0, 600);
    } else {
      // Spawn sur les côtés haut ou bas
      x = Phaser.Math.Between(0, 800);
      y = Phaser.Math.Between(0, 1) === 0 ? 0 : 600;
    }

    const enemy = this.enemies.get() as Phaser.Physics.Arcade.Sprite;
    if (enemy) {
      enemy.setTexture('enemy'); // Assurez-vous d'utiliser la bonne texture
      enemy.setActive(true);
      enemy.setVisible(true);
      enemy.setPosition(x, y);
      enemy.setScale(0.6 + (this.currentWave * 0.1)); // Augmente avec les vagues
      enemy.setDepth(1);
      enemy.setData('health', 2 + Math.floor(this.currentWave / 2));

      // Mouvement vers le joueur
      this.physics.moveToObject(enemy, this.player, 80 + (this.currentWave * 5));
    }
  }

  private bulletHitEnemy(bullet: Phaser.Types.Physics.Arcade.GameObjectWithBody, enemy: Phaser.Types.Physics.Arcade.GameObjectWithBody) {
    const bulletSprite = bullet as Phaser.Physics.Arcade.Sprite;
    const enemySprite = enemy as Phaser.Physics.Arcade.Sprite;
    
    // Désactiver la balle
    bulletSprite.setActive(false);
    bulletSprite.setVisible(false);
    
    // Réduire la santé de l'ennemi
    const health = enemySprite.getData('health') - 1;
    enemySprite.setData('health', health);
    
    if (health <= 0) {
      // Désactiver l'ennemi
      enemySprite.setActive(false);
      enemySprite.setVisible(false);
      
      // Augmenter le score
      this.score += 10 * this.currentWave;
      this.scoreText.setText(`Score: ${this.score}`);
      
      // Compter les ennemis tués
      this.enemiesKilled++;
      
      // Vérifier si la vague est terminée
      if (this.enemiesKilled >= this.currentWave * this.enemiesPerWave) {
        this.completeWave();
      }
    }
  }
  
  private playerHitEnemy(player: Phaser.Types.Physics.Arcade.GameObjectWithBody, enemy: Phaser.Types.Physics.Arcade.GameObjectWithBody) {
    // Pour l'instant, juste un prototype simple - réinitialiser la partie si le joueur est touché
    this.scene.restart();
    this.score = 0;
    this.currentWave = 1;
    this.enemiesKilled = 0;
  }
  
  private completeWave() {
    // Marquer la vague comme terminée
    this.waveCompleted = true;
    
    // Désactiver tous les ennemis restants
    this.enemies.clear(true, true);
    
    // Afficher le message de fin de vague
    this.waveCompletedText.setVisible(true);
    
    // Afficher le bouton pour passer au prochain round
    this.nextRoundBtn.setVisible(true);
    
    // Animation pour le message de fin de vague
    this.tweens.add({
      targets: this.waveCompletedText,
      scale: { from: 0.5, to: 1 },
      alpha: { from: 0, to: 1 },
      duration: 1000,
      ease: 'Bounce'
    });
    
    // Animation pour le bouton
    this.tweens.add({
      targets: this.nextRoundBtn,
      scale: { from: 0.5, to: 1 },
      alpha: { from: 0, to: 1 },
      duration: 1000,
      delay: 500,
      ease: 'Back'
    });
    
    // Incrémenter la vague pour le prochain round
    this.currentWave++;
  }
}
