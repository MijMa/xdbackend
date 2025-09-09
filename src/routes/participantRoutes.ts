import { FastifyInstance } from "fastify";
import { ParticipantBase, ParticipantTypes, ParticipantCreate, ParticipantCreateTypes } from "../validation/participant.schema.ts";
//Note there's a centralized pattern for using Prisma with fastify.
// This pattern makes it so that the prisma instance is only created once
//  and can be accessed from multiple locations that might need it
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


export const participantRoutes = async (fastify: FastifyInstance) => {

  //Adding a participant to a form, eg. signup
  fastify.post('/:id/signup', async (request, reply) => {
    
    const parseResult = ParticipantCreate.safeParse(request.body);
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
        },
      });

      return reply.status(201).send(newParticipant);
    } catch (err) {
      request.log.error(err);
      return reply.status(500).send({ error: "Failed to add a participant" });
    }
  });

  //By form Id, Get full participant data of all associated participants
  fastify.get('/:id/participants', async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      const participants = await prisma.participant.findMany({
        where: { formId: id },
      });

      //Checking for empty array return, findmany always returns a list
      if (!participants || participants.length === 0) {
        return reply.status(404).send({ error: 'Participants not found' });
      } else {
        request.log.info(participants);
        return participants;
      }
 
    } catch (err) {
      request.log.error(err);
      return reply.status(500).send({ error: "Failed to fetch participants data" });
    }
  })

  //Get participant names that have signed up to a specific form
  fastify.get('/:id/participants/names', async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      const participants = await prisma.participant.findMany({
        where: { formId: id },
        select: { name: true }, //only fetch the 'name' field
      });

      if (!participants || participants.length === 0) {
        return reply.status(404).send({ error: 'No participants found for this form' });
      }

      request.log.info(participants);
      return participants;

    } catch (err) {
      request.log.error(err);
      return reply.status(500).send({ error: 'Failed to fetch participant names' });
    }
  });

}