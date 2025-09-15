import { FastifyInstance } from "fastify";
import { PrismaClient } from '@prisma/client';
import { id } from "zod/locales";

const prisma = new PrismaClient();


export const metaRoutes = async (fastify: FastifyInstance) => {
    fastify.post("/wipe-db", async (request, reply) => {
        
        try {
            await prisma.participant.deleteMany();
            await prisma.form.deleteMany();
            await prisma.event.deleteMany();
            // await prisma.user.deleteMany();
            return reply.status(200).send({ message: "Database wiped successfully" });

        } catch (error) {
            console.error(error);
            return reply.status(500).send({ error: "Failed to wipe database" });
        }
  });
}