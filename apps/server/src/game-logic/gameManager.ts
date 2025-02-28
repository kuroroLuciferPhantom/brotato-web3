import { Server, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { RedisClientType } from 'redis';
import { z } from 'zod';
import { validateGameAction } from './validator';
import { generateSeed } from './utils';

type Dependencies = {
  prisma: PrismaClient;
  redis: RedisClientType;
};

// Types d'événements Socket.IO
type ServerEvents = {
  gameState: (state: GameState) => void;
  actionResult: (result: ActionResult) => void;
  gameError: (error: GameError) => void;
};

type ClientEvents = {
  startGame: (data: StartGameData) => void;
  gameAction: (action: GameAction) => void;
  endGame: (data: EndGameData) => void;
};

// Types des données
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

type ActionResult = {
  success: boolean;
  action: GameAction;
  stateUpdate?: Partial<GameState>;
};

type GameError = {
  code: string;
  message: string;
  action?: GameAction;
};

type StartGameData = {
  userId: string;
  characterId: string;
};

type EndGameData = {
  sessionId: string;
  score: number;
  wave: number;
  duration: number;
  kills: number;
  gold: number;
  items: string[];
};

// Stockage en mémoire des sessions actives (à remplacer par Redis en production)
const activeSessions: Map<string, GameState> = new Map();

// Validation des données
const startGameSchema = z.object({
  userId: z.string(),
  characterId: z.string()
});

const endGameSchema = z.object({
  sessionId: z.string(),
  score: z.number().int().min(0),
  wave: z.number().int().min(1),
  duration: z.number().int().min(0),
  kills: z.number().int().min(0),
  gold: z.number().int().min(0),
  items: z.array(z.string())
});

export function setupGameLogic(io: Server<ClientEvents, ServerEvents>, deps: Dependencies) {
  io.on('connection', (socket: Socket) => {
    console.log(`Nouvelle connexion: ${socket.id}`);

    // Démarrer une nouvelle partie
    socket.on('startGame', async (data: StartGameData) => {
      try {
        // Valider les données
        const validData = startGameSchema.parse(data);
        
        // Vérifier que l'utilisateur existe
        const user = await deps.prisma.user.findUnique({
          where: { id: validData.userId }
        });

        if (!user) {
          return socket.emit('gameError', {
            code: 'USER_NOT_FOUND',
            message: 'Utilisateur non trouvé'
          });
        }

        // Générer un ID de session unique
        const sessionId = `game_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        
        // Générer un seed pour la génération aléatoire
        const seed = generateSeed();
        
        // Créer l'état initial de la partie
        const initialState: GameState = {
          sessionId,
          playerPosition: { x: 400, y: 300 },
          enemies: [],
          score: 0,
          wave: 1,
          timestamp: Date.now()
        };
        
        // Stocker la session
        activeSessions.set(sessionId, initialState);
        
        // Stocker des informations supplémentaires dans Redis (si disponible)
        try {
          if (deps.redis.isOpen) {
            await deps.redis.set(`game:session:${sessionId}`, JSON.stringify({
              userId: validData.userId,
              characterId: validData.characterId,
              seed,
              startTime: Date.now()
            }));
            await deps.redis.expire(`game:session:${sessionId}`, 3600); // Expire après 1h
          }
        } catch (redisError) {
          console.error('Erreur Redis:', redisError);
        }
        
        // Rejoindre une room pour cette session
        socket.join(sessionId);
        
        // Envoyer l'état initial
        socket.emit('gameState', initialState);
        
        console.log(`Nouvelle partie démarrée: ${sessionId}`);
      } catch (error) {
        console.error('Erreur lors du démarrage de la partie:', error);
        socket.emit('gameError', {
          code: 'INVALID_START_DATA',
          message: 'Données de démarrage invalides'
        });
      }
    });

    // Recevoir et valider une action de jeu
    socket.on('gameAction', (action: GameAction) => {
      try {
        // Récupérer l'état actuel de la partie
        const currentState = activeSessions.get(action.sessionId);
        
        if (!currentState) {
          return socket.emit('gameError', {
            code: 'SESSION_NOT_FOUND',
            message: 'Session de jeu non trouvée',
            action
          });
        }
        
        // Valider l'action
        const validationResult = validateGameAction(action, currentState);
        
        if (!validationResult.valid) {
          return socket.emit('gameError', {
            code: 'INVALID_ACTION',
            message: validationResult.error || 'Action invalide',
            action
          });
        }
        
        // Appliquer l'action (dans un environnement réel, la logique serait plus complexe)
        // Ici on simule simplement une mise à jour de l'état
        const stateUpdate: Partial<GameState> = {};
        
        if (action.type === 'move') {
          stateUpdate.playerPosition = action.data.position;
        }
        
        // Mettre à jour l'état
        Object.assign(currentState, stateUpdate, { timestamp: Date.now() });
        activeSessions.set(action.sessionId, currentState);
        
        // Envoyer le résultat
        socket.emit('actionResult', {
          success: true,
          action,
          stateUpdate
        });
        
        // Envoyer la mise à jour à tous les clients dans la room (multijoueur potentiel)
        io.to(action.sessionId).emit('gameState', currentState);
      } catch (error) {
        console.error('Erreur lors du traitement de l\'action:', error);
        socket.emit('gameError', {
          code: 'ACTION_PROCESSING_ERROR',
          message: 'Erreur lors du traitement de l\'action',
          action
        });
      }
    });

    // Terminer une partie
    socket.on('endGame', async (data: EndGameData) => {
      try {
        // Valider les données
        const validData = endGameSchema.parse(data);
        
        // Vérifier que la session existe
        const sessionData = activeSessions.get(validData.sessionId);
        if (!sessionData) {
          return socket.emit('gameError', {
            code: 'SESSION_NOT_FOUND',
            message: 'Session de jeu non trouvée'
          });
        }
        
        // Récupérer les informations de session depuis Redis
        let userId: string | null = null;
        let characterId: string | null = null;
        
        try {
          if (deps.redis.isOpen) {
            const sessionInfo = await deps.redis.get(`game:session:${validData.sessionId}`);
            if (sessionInfo) {
              const parsedInfo = JSON.parse(sessionInfo);
              userId = parsedInfo.userId;
              characterId = parsedInfo.characterId;
            }
          }
        } catch (redisError) {
          console.error('Erreur Redis:', redisError);
        }
        
        if (!userId || !characterId) {
          return socket.emit('gameError', {
            code: 'SESSION_DATA_MISSING',
            message: 'Données de session manquantes'
          });
        }
        
        // Enregistrer l'historique de la partie
        await deps.prisma.gameHistory.create({
          data: {
            userId,
            score: validData.score,
            wave: validData.wave,
            duration: validData.duration,
            characterId,
            items: validData.items,
            kills: validData.kills,
            gold: validData.gold
          }
        });
        
        // Mettre à jour les statistiques du joueur
        await deps.prisma.gameStats.update({
          where: { userId },
          data: {
            totalGamesPlayed: { increment: 1 },
            highScore: {
              set: deps.prisma.raw(`GREATEST(high_score, ${validData.score})`)
            },
            highestWave: {
              set: deps.prisma.raw(`GREATEST(highest_wave, ${validData.wave})`)
            },
            totalKills: { increment: validData.kills },
            totalGold: { increment: validData.gold },
            playTime: { increment: validData.duration }
          }
        });
        
        // Nettoyer la session
        activeSessions.delete(validData.sessionId);
        if (deps.redis.isOpen) {
          await deps.redis.del(`game:session:${validData.sessionId}`);
        }
        
        // Quitter la room
        socket.leave(validData.sessionId);
        
        console.log(`Partie terminée: ${validData.sessionId}`);
        
        // Confirmer la fin de partie
        socket.emit('actionResult', {
          success: true,
          action: {
            type: 'endGame',
            sessionId: validData.sessionId,
            data: { score: validData.score },
            timestamp: Date.now()
          }
        });
      } catch (error) {
        console.error('Erreur lors de la fin de partie:', error);
        socket.emit('gameError', {
          code: 'END_GAME_ERROR',
          message: 'Erreur lors de la fin de partie'
        });
      }
    });

    // Déconnexion
    socket.on('disconnect', () => {
      console.log(`Déconnexion: ${socket.id}`);
      // Nettoyer les sessions si nécessaire
    });
  });
}
