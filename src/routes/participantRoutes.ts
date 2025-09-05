import { FastifyInstance } from "fastify";
import { ParticipantBase, ParticipantTypes } from "../validation/participant.schema.ts";
//Note there's a centralized pattern for using Prisma with fastify.
// This pattern makes it so that the prisma instance is only created once
//  and can be accessed from multiple locations that might need it
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


export const participantRoutes = async (fastify: FastifyInstance) => {
  // fastify.post('/:id/signup', async (request, reply) => {
  //   const { id } = request.params as { id: number };

  //   try {

  //   }
  // });

  fastify.post('/:id/signup', async (request, reply) => {
    const { id } = request.params as { id: string };

    const parseResult = ParticipantBase.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({ 
        error: "Invalid participant data", 
        details: parseResult.error 
      });
    }

    const participantData: ParticipantTypes = parseResult.data;

    try {
      const newParticipant = await prisma.participant.create({
        data: {
          ...participantData,
          formId: id, // assuming `formId` is the foreign key in your DB
        },
      });

      return reply.status(201).send(newParticipant);
    } catch (err) {
      request.log.error(err);
      return reply.status(500).send({ error: "Failed to create participant" });
    }
  });
}