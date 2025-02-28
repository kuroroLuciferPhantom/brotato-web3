import Fastify from 'fastify';
import cors from '@fastify/cors';
import { Server } from 'socket.io';
import { createClient } from 'redis';
import { PrismaClient } from '@prisma/client';
import { setupGameLogic } from './game-logic/gameManager';
import { registerRoutes } from './routes';

// Initialiser les clients
const prisma = new PrismaClient();
const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Configurer Fastify
const fastify = Fastify({
  logger: true
});

// Middleware CORS
fastify.register(cors, {
  origin: '*' // En production, restreindre aux domaines spécifiques
});

// Enregistrer les routes API
registerRoutes(fastify, { prisma });

// Démarrer le serveur
const start = async () => {
  try {
    // Connecter Redis
    await redis.connect().catch(err => {
      fastify.log.warn('Redis connection failed, continuing without cache:', err);
    });

    // Démarrer le serveur HTTP
    const address = await fastify.listen({
      port: parseInt(process.env.PORT || '3001'),
      host: '0.0.0.0'
    });
    
    // Configurer Socket.IO
    const io = new Server(fastify.server, {
      cors: {
        origin: '*', // Même restriction que pour l'API
        methods: ['GET', 'POST']
      }
    });
    
    // Initialiser la logique de jeu
    setupGameLogic(io, { prisma, redis });
    
    fastify.log.info(`Server is running on ${address}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Gestion de l'arrêt propre
const shutdown = async () => {
  fastify.log.info('Shutting down server...');
  await fastify.close();
  await prisma.$disconnect();
  if (redis.isOpen) {
    await redis.quit();
  }
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Démarrer le serveur
start();
