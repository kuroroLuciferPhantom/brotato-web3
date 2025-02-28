import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

type Dependencies = {
  prisma: PrismaClient;
};

// Validation schemas
const createUserSchema = z.object({
  address: z.string().min(42).max(42), // Adresse ETH
  username: z.string().min(3).max(20).optional(),
});

export function userRoutes(fastify: FastifyInstance, { prisma }: Dependencies) {
  // Récupérer un utilisateur par adresse
  fastify.get('/api/users/:address', async (request, reply) => {
    const { address } = request.params as { address: string };

    try {
      const user = await prisma.user.findUnique({
        where: { address },
        include: { gameStats: true }
      });

      if (!user) {
        return reply.code(404).send({ error: 'Utilisateur non trouvé' });
      }

      return user;
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Erreur serveur' });
    }
  });

  // Créer ou mettre à jour un utilisateur
  fastify.post('/api/users', async (request, reply) => {
    try {
      const data = createUserSchema.parse(request.body);

      const user = await prisma.user.upsert({
        where: { address: data.address },
        update: { username: data.username },
        create: {
          address: data.address,
          username: data.username,
          gameStats: {
            create: {} // Initialiser des stats vides
          }
        },
        include: { gameStats: true }
      });

      return user;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: 'Données invalides', details: error.format() });
      }
      
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Erreur serveur' });
    }
  });

  // Récupérer les stats d'un utilisateur
  fastify.get('/api/users/:address/stats', async (request, reply) => {
    const { address } = request.params as { address: string };

    try {
      const stats = await prisma.gameStats.findFirst({
        where: { user: { address } }
      });

      if (!stats) {
        return reply.code(404).send({ error: 'Statistiques non trouvées' });
      }

      return stats;
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Erreur serveur' });
    }
  });
}
