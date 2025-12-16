import { FastifyInstance } from "fastify";
import { ParticipantBase, ParticipantTypes, ParticipantCreate, 
  ParticipantCreateTypes, ParticipantUpdate, ParticipantUpdateTypes, 
  ParticipantUpdateMany, ParticipantUpdateManyTypes } from "../../validation/participant.schema.js";

  import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


export const participantCrudRoutes = async (fastify: FastifyInstance) => {


  // Updating many participants at once, per provided list 
  fastify.put('/participants/updatemany', async (request, reply) => {

    const parseResult = ParticipantUpdateMany.safeParse(request.body);
    // const { id } = paramsSchema.parse(request.params);
    
    if (!parseResult.success) {
      return reply.status(400).send({ 
        error: "Invalid participant update data", 
        details: parseResult.error.issues 
      });
    }

    const participantData: ParticipantUpdateManyTypes = parseResult.data;
    const participants = participantData;

    try {
      const updates = await Promise.all(
        participants.map((participant) => {
          return prisma.participant.update({
            where: { id: participant.id },
            data: participant
          })
        })
      );
      reply.send(updates);
    } catch (err) {
      console.error(err);
      reply.status(500).send({ 
        error: 'Failed to update participants',
        err
      });
    }
  });

  //updates a participant as per provided data
  //unused
  // fastify.put('/participants/:id/update', async (request, reply) => {

  //   const parseResult = ParticipantUpdate.safeParse(request.body);
  //   const { id } = paramsSchema.parse(request.params);
  //   if (!parseResult.success) {
  //     return reply.status(400).send({ 
  //       errors: parseResult.error.issues
  //     });
  //   }
  //   const participantData: ParticipantUpdateTypes = parseResult.data;
    
  //   const participant = participantData;

  //   try {
  //     const updatedForm = await prisma.participant.update({
  //       where: { id },
  //       data: participant
  //     });

  //     return updatedForm;
  //   } catch (err) {
  //     console.error(err);
  //     reply.status(500).send({ error: 'Failed to update form' });
  //   }
  // });

}