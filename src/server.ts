
import Fastify, { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { eventRoutes } from "./routes/routes.js"

const prisma = new PrismaClient();

const fastify: FastifyInstance = Fastify({
  logger: true
})

// Register Prisma if you're using it as a plugin
fastify.decorate('prisma', prisma); // or use fastify-plugin

// Register your routes
fastify.register(eventRoutes, { prefix: '/events' });


fastify.get('/users', async (request, reply) => {
  const users = await prisma.user.findMany();
  reply.send(users)
});

await fastify.listen({ port: 3000 }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log("Server running on http://localhost:3000");
});