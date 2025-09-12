
import Fastify, { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { eventRoutes, formRoutes, metaRoutes, participantRoutes } from "./routes/routes.js"
import fastifyCors from '@fastify/cors';

const prisma = new PrismaClient({
  errorFormat: "minimal"
});

const fastify: FastifyInstance = Fastify({
  logger: true
})
const environment = process.env.ENVIRONMENT;

// Register Prisma if you're using it as a plugin
fastify.decorate('prisma', prisma); //or use fastify-plugin

// Registering routes
fastify.register(eventRoutes, { prefix: '/event' });
fastify.register(formRoutes, { prefix: '/form' });
fastify.register(participantRoutes, { prefix: '/participant' });
fastify.register(metaRoutes, { prefix: '/meta' });
(environment === "development") && await fastify.register(fastifyCors, {
  origin: true, // allowed origin(s)
  methods: ['GET', 'POST', 'PUT', 'HEAD', 'PATCH', 'DELETE', 'OPTIONS']
});

fastify.get('/users', async (request, reply) => {
  const users = await prisma.user.findMany();
  reply.send(users)
});

await fastify.listen({ port: 3000 }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  // console.log(fastify.printRoutes()); 
  console.log("Server running on" + process.env.HOSTURL);
});