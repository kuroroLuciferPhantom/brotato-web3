import Phaser from 'phaser';
import playerData from '../data/PlayerData';

export default class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private enemies!: Phaser.Physics.Arcade.Group;
  private bullets!: Phaser.Physics.Arcade.Group;
  private lastFired: number = 0;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private scoreText!: Phaser.GameObjects.Text;
  private waveText!: Phaser.GameObjects.Text;
  private moneyText!: Phaser.GameObjects.Text;
  private enemiesKilled: number = 0;
  private enemiesPerWave: number = 5;
  private enemySpawnTimer: number = 0;
  private waveCompleted: boolean = false;
  private nextRoundBtn!: Phaser.GameObjects.Text;
  private waveCompletedText!: Phaser.GameObjects.Text;
  private healthBar!: Phaser.GameObjects.Graphics;
  private currentHealth: number = 100;
  private waveStarted: boolean = true;

  constructor() {
    super('GameScene');
  }

  create() {
    // Réinitialiser l'état du jeu si on revient de la scène shop
    this.waveCompleted = false;
    this.waveStarted = true;
    this.enemiesKilled = 0;
    this.currentHealth = playerData.stats.maxHealth;
    
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
      maxSize: 50,
      runChildUpdate: true
    });

    // Collision entre projectiles et ennemis
    this.physics.add.collider(this.bullets, this.enemies, this.bulletHitEnemy, undefined, this);

    // Collision entre joueur et ennemis
    this.physics.add.collider(this.player, this.enemies, this.playerHitEnemy, undefined, this);

    // Configurer les contrôles
    this.cursors = this.input.keyboard!.createCursorKeys();
    
    // Créer l'interface utilisateur
    this.createUI();
    
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
      // Mettre à jour les données du joueur
      playerData.nextWave();
      
      // Passer à la scène de shop
      this.scene.start('ShopScene');
    });
    this.nextRoundBtn.setVisible(false);
    
    // Afficher l'indicateur de début de vague
    this.showWaveStart();
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
    if (this.waveStarted) {
      this.enemySpawnTimer += delta;
      if (this.enemySpawnTimer > 1000 && this.enemies.countActive() < playerData.currentWave * this.enemiesPerWave) {
        this.spawnEnemy();
        this.enemySpawnTimer = 0;
      }
    }
    
    // Nettoyage des balles hors de l'écran
    this.bullets.getChildren().forEach((bullet: Phaser.GameObjects.GameObject) => {
      const b = bullet as Phaser.Physics.Arcade.Sprite;
      if (b.active && !this.physics.world.bounds.contains(b.x, b.y)) {
        b.setActive(false);
        b.setVisible(false);
      }
    });
    
    // Mettre à jour l'interface utilisateur
    this.updateUI();
  }
  
  private createUI() {
    // Ajouter le texte du score
    this.scoreText = this.add.text(16, 16, `Score: ${playerData.score}`, { 
      fontSize: '18px', 
      color: '#fff',
      stroke: '#000',
      strokeThickness: 3
    });
    this.scoreText.setScrollFactor(0);

    // Ajouter le texte de la vague
    this.waveText = this.add.text(16, 40, `Wave: ${playerData.currentWave}`, { 
      fontSize: '18px', 
      color: '#fff',
      stroke: '#000',
      strokeThickness: 3
    });
    this.waveText.setScrollFactor(0);
    
    // Ajouter le texte de la monnaie
    this.moneyText = this.add.text(16, 64, `Money: ${playerData.money}`, { 
      fontSize: '18px', 
      color: '#fc0',
      stroke: '#000',
      strokeThickness: 3
    });
    this.moneyText.setScrollFactor(0);
    
    // Créer la barre de vie
    this.healthBar = this.add.graphics();
    this.updateHealthBar();
  }
  
  private updateUI() {
    // Mettre à jour le texte du score
    this.scoreText.setText(`Score: ${playerData.score}`);
    
    // Mettre à jour le texte de la vague
    this.waveText.setText(`Wave: ${playerData.currentWave}`);
    
    // Mettre à jour le texte de la monnaie
    this.moneyText.setText(`Money: ${playerData.money}`);
  }
  
  private updateHealthBar() {
    // Dessiner la barre de vie
    this.healthBar.clear();
    
    // Fond de la barre (rouge)
    this.healthBar.fillStyle(0xff0000);
    this.healthBar.fillRect(580, 16, 200, 20);
    
    // Barre de vie actuelle (vert)
    const healthPercentage = this.currentHealth / playerData.stats.maxHealth;
    this.healthBar.fillStyle(0x00ff00);
    this.healthBar.fillRect(580, 16, 200 * healthPercentage, 20);
    
    // Bordure
    this.healthBar.lineStyle(2, 0xffffff);
    this.healthBar.strokeRect(580, 16, 200, 20);
  }

  private handlePlayerMovement() {
    // Réinitialiser la vélocité
    this.player.setVelocity(0);

    // Mouvement horizontal
    if (this.cursors.left!.isDown) {
      this.player.setVelocityX(-playerData.stats.moveSpeed);
    } else if (this.cursors.right!.isDown) {
      this.player.setVelocityX(playerData.stats.moveSpeed);
    }

    // Mouvement vertical
    if (this.cursors.up!.isDown) {
      this.player.setVelocityY(-playerData.stats.moveSpeed);
    } else if (this.cursors.down!.isDown) {
      this.player.setVelocityY(playerData.stats.moveSpeed);
    }
  }
  
  private fireWeapon(time: number) {
    // Tirer selon le nombre de projectiles configuré
    for (let i = 0; i < playerData.stats.projectileCount; i++) {
      const bullet = this.bullets.get() as Phaser.Physics.Arcade.Sprite;
      
      if (bullet) {
        bullet.setActive(true);
        bullet.setVisible(true);
        bullet.setPosition(this.player.x, this.player.y);
        
        // Ajuster l'angle pour multiple projectiles
        let angle;
        if (playerData.stats.projectileCount === 1) {
          angle = Phaser.Math.Between(0, 360);
        } else {
          // Répartir les projectiles en éventail
          const spreadAngle = 45; // angle total de répartition en degrés
          const baseAngle = Phaser.Math.Between(0, 360);
          const offset = spreadAngle / (playerData.stats.projectileCount - 1);
          angle = baseAngle - (spreadAngle / 2) + (i * offset);
        }
        
        // Configurer la vélocité du projectile
        this.physics.velocityFromAngle(angle, playerData.stats.projectileSpeed, bullet.body.velocity);
        bullet.setRotation(angle * Math.PI / 180);
        
        // Stocker les dégâts du projectile
        bullet.setData('damage', playerData.stats.damage);
      }
    }
    
    // Mettre à jour le temps du prochain tir selon le fire rate
    this.lastFired = time + playerData.stats.fireRate;
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
      enemy.setScale(0.6 + (playerData.currentWave * 0.1)); // Augmente avec les vagues
      enemy.setDepth(1);
      
      // La santé augmente avec les vagues
      const health = 2 + Math.floor(playerData.currentWave / 2);
      enemy.setData('health', health);
      enemy.setData('maxHealth', health);
      enemy.setData('value', 10 * playerData.currentWave); // Valeur en points

      // Mouvement vers le joueur (vitesse augmente avec les vagues)
      this.physics.moveToObject(enemy, this.player, 80 + (playerData.currentWave * 5));
    }
  }

  private bulletHitEnemy(bullet: Phaser.Types.Physics.Arcade.GameObjectWithBody, enemy: Phaser.Types.Physics.Arcade.GameObjectWithBody) {
    const bulletSprite = bullet as Phaser.Physics.Arcade.Sprite;
    const enemySprite = enemy as Phaser.Physics.Arcade.Sprite;
    
    // Désactiver la balle
    bulletSprite.setActive(false);
    bulletSprite.setVisible(false);
    
    // Obtenir les dégâts du projectile
    const damage = bulletSprite.getData('damage') || playerData.stats.damage;
    
    // Réduire la santé de l'ennemi
    const health = enemySprite.getData('health') - damage;
    enemySprite.setData('health', health);
    
    if (health <= 0) {
      // Désactiver l'ennemi
      enemySprite.setActive(false);
      enemySprite.setVisible(false);
      
      // Augmenter le score et l'argent
      const value = enemySprite.getData('value') || 10;
      playerData.score += value;
      playerData.money += Math.ceil(value / 2);
      
      // Animation de gain de points
      this.showPointsGained(enemySprite.x, enemySprite.y, value);
      
      // Compter les ennemis tués
      this.enemiesKilled++;
      playerData.addKill(value);
      
      // Vérifier si la vague est terminée
      if (this.enemiesKilled >= playerData.currentWave * this.enemiesPerWave) {
        this.completeWave();
      }
    } else {
      // Animation de dégâts (flash rouge)
      this.tweens.add({
        targets: enemySprite,
        alpha: 0.5,
        duration: 50,
        yoyo: true,
      });
    }
  }
  
  private playerHitEnemy(player: Phaser.Types.Physics.Arcade.GameObjectWithBody, enemy: Phaser.Types.Physics.Arcade.GameObjectWithBody) {
    const enemySprite = enemy as Phaser.Physics.Arcade.Sprite;
    
    // Prendre des dégâts
    this.currentHealth -= 10;
    this.updateHealthBar();
    
    // Animation de dégâts pour le joueur (flash rouge)
    this.tweens.add({
      targets: this.player,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
    });
    
    // Repousser l'ennemi
    const angle = Phaser.Math.Angle.Between(
      this.player.x, this.player.y,
      enemySprite.x, enemySprite.y
    );
    this.physics.velocityFromRotation(angle, 200, enemySprite.body.velocity);
    
    // Game over si la santé atteint 0
    if (this.currentHealth <= 0) {
      this.gameOver();
    }
  }
  
  private gameOver() {
    // Réinitialiser les données du joueur
    playerData.reset();
    
    // Afficher un message de game over
    const gameOverText = this.add.text(400, 250, 'GAME OVER', {
      fontSize: '48px',
      fontStyle: 'bold',
      color: '#ff0000',
      stroke: '#000',
      strokeThickness: 6
    }).setOrigin(0.5);
    
    // Animation pour le message
    this.tweens.add({
      targets: gameOverText,
      scale: { from: 0.5, to: 1 },
      alpha: { from: 0, to: 1 },
      duration: 1000,
      ease: 'Bounce',
      onComplete: () => {
        // Attendre quelques secondes puis redémarrer le jeu
        this.time.delayedCall(3000, () => {
          this.scene.start('BootScene');
        });
      }
    });
    
    // Désactiver les mises à jour du jeu
    this.waveCompleted = true;
    
    // Arrêter tous les ennemis
    this.enemies.getChildren().forEach((enemy: Phaser.GameObjects.GameObject) => {
      const e = enemy as Phaser.Physics.Arcade.Sprite;
      e.body.velocity.x = 0;
      e.body.velocity.y = 0;
    });
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
  }
  
  private showPointsGained(x: number, y: number, points: number) {
    // Afficher une animation de points gagnés
    const pointsText = this.add.text(x, y, `+${points}`, {
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#fc0',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5);
    
    // Animation de déplacement vers le haut et disparition
    this.tweens.add({
      targets: pointsText,
      y: y - 50,
      alpha: 0,
      duration: 1000,
      ease: 'Cubic.Out',
      onComplete: () => {
        pointsText.destroy();
      }
    });
  }
  
  private showWaveStart() {
    // Afficher un message de début de vague
    const waveText = this.add.text(400, 250, `WAVE ${playerData.currentWave}`, {
      fontSize: '48px',
      fontStyle: 'bold',
      color: '#fff',
      stroke: '#000',
      strokeThickness: 6
    }).setOrigin(0.5).setAlpha(0);
    
    // Animation d'apparition puis disparition
    this.tweens.add({
      targets: waveText,
      alpha: { start: 0, from: 0, to: 1 },
      scale: { start: 0.5, from: 0.5, to: 1 },
      duration: 1000,
      ease: 'Cubic.Out',
      yoyo: true,
      hold: 1000,
      onComplete: () => {
        waveText.destroy();
        // Commencer à faire apparaître les ennemis
        this.waveStarted = true;
      }
    });
    
    // Empêcher l'apparition d'ennemis pendant l'animation
    this.waveStarted = false;
  }
}
