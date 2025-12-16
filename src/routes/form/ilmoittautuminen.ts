import { FastifyInstance } from "fastify";
import { ParticipantCreate, ParticipantCreateTypes } from "../../validation/participant.schema.js";
import { paramsSchema } from "../../validation/params.schema.js";
import { getParticipantCount } from "../../util/getParticipantCount.js";
import { getFormsMaxParticipants } from "../../util/getFormsMaxParticipants.js";
import { broadcastParticipantCount } from "../../util/broadCastParticipantCount.js";

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


export const ilmoittautuminenRoutes = async (fastify: FastifyInstance) => {

  //Creating a new participant and linking them to a form, eg. signup
  fastify.post('/form/:id/signup', async (request, reply) => {
    const parseResult = ParticipantCreate.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({ 
        error: "Invalid participant data", 
        details: parseResult.error.issues
      });
    }
    const participantData: ParticipantCreateTypes = parseResult.data;
    const { id } = paramsSchema.parse(request.params);
    const participantcount = await getParticipantCount(id);
    const maxParticipants = await getFormsMaxParticipants(id);

    //Tarvitaan toinen check, onko tapahtuma vielä auki? TODO
    if (maxParticipants != null && participantcount != null &&
       participantcount >= maxParticipants) {
      return reply.status(400).send({ error: "Tapahtuma on täynnä" });
    }

    try {
      const newParticipant = await prisma.participant.create({
        data: {
          ...participantData,
        },
      });

      broadcastParticipantCount(id, clients);
      return reply.status(201).send(newParticipant);

    } catch (err) {
      console.error(err);
      return reply.status(500).send({ error: "Failed to add a participant" });
    }
  });

  //Get participant names that have signed up to a specific form
  fastify.get('/form/:id/participants/names', async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      const participants = await prisma.participant.findMany({
        where: { formId: id },
        select: { name: true }, //only fetch the 'name' field
      });

      if (!participants || participants.length === 0) {
        return reply.status(204).send({ error: 'No participants found for this form' });
      }
      return participants;

    } catch (err) {
      console.error(err);
      return reply.status(500).send({ error: 'Failed to fetch participant names' });
    }
  });

  //Get the amount of users signed up on a form, used for closing a form
  // and displaying participant count for public users
  fastify.get('/form/:id/participants/count', async (request, reply): Promise<(number | null)[]> => {
    const { id } = request.params as { id: string };

    try {
      const maxparticipants = await getFormsMaxParticipants(id);
      const currparticipantCount = await getParticipantCount(id);
      return [currparticipantCount, maxparticipants];
    }
    catch (err) {
      console.error(err);
      return reply.status(500).send({ error: 'Failed to fetch participant count' });    
    }
  })


}