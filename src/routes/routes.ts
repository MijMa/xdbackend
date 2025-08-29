import { FastifyInstance } from "fastify";
import { createEventSchema } from "../validation/events.schema.js"

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