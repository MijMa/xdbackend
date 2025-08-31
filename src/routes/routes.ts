import { FastifyInstance } from "fastify";
import { createEventSchema } from "../validation/events.schema.js"

import { PrismaClient } from '@prisma/client';


export const eventsRoutes = async (fastify: FastifyInstance) => {
    fastify.post('/', { schema: createEventSchema }, async (request, reply) => {

        const { event, form } = request.body as { event: any; form: any };

        const saved = await fastify.prisma.event.create({
            data: {
                ...event,
                form: { create: form }
            }
        });
        
        return saved;
    });
}


const prisma = new PrismaClient();

export default async function eventRoutes(fastify: FastifyInstance) {
  fastify.post('/', async (req, reply) => {
    const { event, form } = req.body as { event: any; form: any };

    try {
      const saved = await prisma.event.create({
        data: {
          ...event,
          forms: { create: form }
        }
      });

      return saved;
    } catch (err) {
      fastify.log.error(err);
      reply.status(500).send({ error: 'Failed to create event' });
    }
  });
}
