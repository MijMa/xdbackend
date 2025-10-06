
import Fastify, { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { eventRoutes, formRoutes, metaRoutes, participantRoutes } from "./routes/routes.js"
import fastifyCors from '@fastify/cors';

import { plugin as supertokensPlugin } from "supertokens-node/framework/fastify";
import { InitSupertokens } from './auth/InitSupertokens.js';
import SuperTokens from 'supertokens-node';
import { userRoutes } from './routes/userRoutes.js';

InitSupertokens();

const prisma = new PrismaClient({
  errorFormat: "minimal"
});

const fastify: FastifyInstance = Fastify({
  logger: true
})
const environment = process.env.ENVIRONMENT;

// Register Prisma if you're using it as a plugin
fastify.decorate('prisma', prisma); //or use fastify-plugin

// Registering supertokens
fastify.register(supertokensPlugin);

// Registering routes
fastify.register(eventRoutes, { prefix: '/event' });
fastify.register(formRoutes);
fastify.register(participantRoutes);
fastify.register(userRoutes);
fastify.register(metaRoutes, { prefix: '/meta' });

await fastify.register(fastifyCors, {
  origin: process.env.ENVIRONMENT === "development"
    ? "http://localhost:5173" // allowed origin(s)
    : "productionURL",
  methods: ['GET', 'POST', 'PUT', 'HEAD', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ["content-type", ...SuperTokens.getAllCORSHeaders()],
  credentials: true, // Allow all cookies
});

// fastify.get('/users', async (request, reply) => {
//   const users = await prisma.user.findMany();
//   reply.send(users)
// });


await fastify.listen({ port: 3000 }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  // console.log(fastify.printRoutes()); 
  console.log("Server running on " + process.env.HOSTURL);
});