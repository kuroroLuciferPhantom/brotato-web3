import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

type Dependencies = {
  prisma: PrismaClient;
};

// Validation schemas
const gameHistorySchema = z.object({
  userId: z.string(),
  score: z.number().int().min(0),
  wave: z.number().int().min(1),
  duration: z.number().int().min(0),
  characterId: z.string(),
  items: z.array(z.string()),
  kills: z.number().int().min(0),
  gold: z.number().int().min(0),
  txHash: z.string().optional(),
});

export function gameRoutes(fastify: FastifyInstance, { prisma }: Dependencies) {
  // Récupérer l'historique des parties d'un utilisateur
  fastify.get('/api/users/:address/history', async (request, reply) => {
    const { address } = request.params as { address: string };
    const { limit = '10', offset = '0' } = request.query as { limit?: string, offset?: string };

    try {
      const user = await prisma.user.findUnique({ where: { address } });
      
      if (!user) {
        return reply.code(404).send({ error: 'Utilisateur non trouvé' });
      }

      const history = await prisma.gameHistory.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset),
        include: {
          gameItems: true
        }
      });

      // Transformer les données pour préserver la structure API originale
      const formattedHistory = history.map(h => ({
        ...h,
        items: h.gameItems.map(item => item.itemId)
      }));

      return formattedHistory;
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Erreur serveur' });
    }
  });

  // Enregistrer une nouvelle partie
  fastify.post('/api/game/history', async (request, reply) => {
    try {
      const data = gameHistorySchema.parse(request.body);

      // Vérifier que l'utilisateur existe
      const user = await prisma.user.findUnique({
        where: { id: data.userId },
      });

      if (!user) {
        return reply.code(404).send({ error: 'Utilisateur non trouvé' });
      }

      // Créer l'entrée d'historique avec des relations pour les items
      const gameHistory = await prisma.gameHistory.create({
        data: {
          userId: data.userId,
          score: data.score,
          wave: data.wave,
          duration: data.duration,
          characterId: data.characterId,
          kills: data.kills,
          gold: data.gold,
          txHash: data.txHash,
          gameItems: {
            create: data.items.map(itemId => ({
              itemId
            }))
          }
        },
        include: {
          gameItems: true
        }
      });

      // Mettre à jour les statistiques du joueur
      await prisma.gameStats.update({
        where: { userId: data.userId },
        data: {
          totalGamesPlayed: { increment: 1 },
          highScore: {
            set: Math.max(data.score, (await prisma.gameStats.findUnique({
              where: { userId: data.userId }
            }))?.highScore || 0)
          },
          highestWave: {
            set: Math.max(data.wave, (await prisma.gameStats.findUnique({
              where: { userId: data.userId }
            }))?.highestWave || 0)
          },
          totalKills: { increment: data.kills },
          totalGold: { increment: data.gold },
          playTime: { increment: data.duration }
        }
      });

      // Transformer la réponse pour maintenir l'API consistante
      const responseData = {
        ...gameHistory,
        items: gameHistory.gameItems.map(item => item.itemId)
      };

      return responseData;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: 'Données invalides', details: error.format() });
      }
      
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Erreur serveur' });
    }
  });

  // Récupérer le classement général
  fastify.get('/api/leaderboard', async (request, reply) => {
    const { limit = '10' } = request.query as { limit?: string };

    try {
      const topScores = await prisma.gameHistory.findMany({
        orderBy: { score: 'desc' },
        take: parseInt(limit),
        include: {
          user: {
            select: {
              username: true,
              address: true
            }
          }
        }
      });

      return topScores.map(score => ({
        id: score.id,
        username: score.user.username,
        address: score.user.address,
        score: score.score,
        wave: score.wave,
        characterId: score.characterId,
        date: score.createdAt
      }));
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Erreur serveur' });
    }
  });
}
