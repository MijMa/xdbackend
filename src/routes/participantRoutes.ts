import { FastifyInstance } from "fastify";
import { ParticipantBase, ParticipantTypes, ParticipantCreate, 
  ParticipantCreateTypes, ParticipantUpdate, ParticipantUpdateTypes, 
  ParticipantUpdateMany, ParticipantUpdateManyTypes } from "../validation/participant.schema.js";
//Note there's a centralized pattern for using Prisma with fastify.
// This pattern makes it so that the prisma instance is only created once
//  and can be accessed from multiple locations that might need it
import { PrismaClient } from '@prisma/client';
import { paramsSchema } from "../validation/params.schema.js";

const prisma = new PrismaClient();


export const participantRoutes = async (fastify: FastifyInstance) => {

  //Adding a participant to a form, eg. signup
  fastify.post('/:id/signup', async (request, reply) => {
    const parseResult = ParticipantCreate.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({ 
        error: "Invalid participant data", 
        details: parseResult.error.issues
      });
    }
    const participantData: ParticipantCreateTypes = parseResult.data;

    try {
      const newParticipant = await prisma.participant.create({
        data: {
          ...participantData,
        },
      });

      return reply.status(201).send(newParticipant);
    } catch (err) {
      console.error(err);
      return reply.status(500).send({ error: "Failed to add a participant" });
    }
  });

// Updating many participants at once, per provided list 
fastify.put('/participant/updatemany', async (request, reply) => {

  const parseResult = ParticipantUpdateMany.safeParse(request.body);
  // const { id } = paramsSchema.parse(request.params);
  console.log("RECEIVED: ", request.body); //Odd array structure
  if (!parseResult.success) {
    return reply.status(400).send({ 
      error: "Invalid participant update data", 
      details: parseResult.error.issues 
    });
  }

  const participantData: ParticipantUpdateManyTypes = parseResult.data;
  const participants = participantData;
  console.log("participantdata;", participantData);

  try {
    const updates = await Promise.all(
      participants.map((participant) => {
        prisma.participant.update({
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
fastify.put('/participant/update', async (request, reply) => {

  const parseResult = ParticipantUpdate.safeParse(request.body);
  const { id } = paramsSchema.parse(request.params);
  if (!parseResult.success) {
    return reply.status(400).send({ 
      errors: parseResult.error.issues
    });
  }
  const participantData: ParticipantUpdateTypes = parseResult.data;
  
  const participant = participantData;

  try {
    const updatedForm = await prisma.participant.update({
      where: { id },
      data: participant
    });

    return updatedForm;
  } catch (err) {
    console.error(err);
    reply.status(500).send({ error: 'Failed to update form' });
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
        return reply.status(404).send({ error: 'Participant data not found' });
      } else {
        request.log.info(participants);
        return participants;
      }
 
    } catch (err) {
      console.error(err);
      return reply.status(500).send({ error: "Failed to fetch participant data" });
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
      console.error(err);
      return reply.status(500).send({ error: 'Failed to fetch participant names' });
    }
  });

}