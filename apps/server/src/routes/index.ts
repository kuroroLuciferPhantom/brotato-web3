import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { userRoutes } from './userRoutes';
import { gameRoutes } from './gameRoutes';

type Dependencies = {
  prisma: PrismaClient;
};

export function registerRoutes(fastify: FastifyInstance, deps: Dependencies) {
  // Ping pour healthcheck
  fastify.get('/api/ping', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Enregistrer les routes spécifiques
  userRoutes(fastify, deps);
  gameRoutes(fastify, deps);
}
