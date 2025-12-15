import { FastifyInstance } from "fastify";
import { PrismaClient } from '@prisma/client';
import { getParticipantCount } from "../../util/getParticipantCount.js";
import { IncomingMessage, ServerResponse } from "http";

const prisma = new PrismaClient();


export const participantStreamRoutes = async (fastify: FastifyInstance) => {

  const clients: Set<ServerResponse<IncomingMessage>> = new Set();

  //Subscribe a user to a participant count stream
  fastify.get('/participantcountstream/:id', async (request, reply) => {
    const MAX_CONNECTIONS = process.env.VITE_MAX_STREAM_CONNECTIONS;
    if (clients.size >= +!MAX_CONNECTIONS) {
      reply.code(429).send('Too many connections');
      return;
    }
    const { id } = request.params as { id: string };

    reply.raw.setHeader('Access-Control-Allow-Origin', process.env.ENVIRONMENT === "development"
      ? "http://localhost:5173"
      : "productionURL");
    reply.raw.setHeader('Access-Control-Allow-Credentials', 'true');
    reply.raw.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cache-Control, Connection');
    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache');
    reply.raw.setHeader('Connection', 'keep-alive');
    //reply.raw.flushHeaders();

    clients.add(reply.raw);

    const count = await getParticipantCount(id);
    reply.raw.write(JSON.stringify(count))

    request.raw.on("close", () => {
      clients.delete(reply.raw);
      reply.raw.end();
    })
  })

  fastify.options('/participantcountstream/:id', (request, reply) => {
    reply.header('Access-Control-Allow-Origin', process.env.ENVIRONMENT === "development"
      ? "http://localhost:5173" //TODO Portscheck - env vars and all that
      : "productionURL");
    reply.header('Access-Control-Allow-Credentials', 'true');
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Cache-Control, Connection');
    reply.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    reply.send();
  });

}