import { FastifyInstance } from "fastify";
import { ParticipantBase, ParticipantTypes, ParticipantCreate, 
  ParticipantCreateTypes, ParticipantUpdate, ParticipantUpdateTypes, 
  ParticipantUpdateMany, ParticipantUpdateManyTypes } from "../../validation/participant.schema.js";
//Note that there's a centralized pattern for using Prisma with fastify.
// This pattern makes it so that the prisma instance is only created once
//  and can be accessed from multiple locations that might need it
import { PrismaClient } from '@prisma/client';
import { paramsSchema } from "../../validation/params.schema.js";
import { getParticipantCount } from "../../util/getParticipantCount.js";
import { getFormsMaxParticipants } from "../../util/getFormsMaxParticipants.js";
import { broadcastParticipantCount } from "../../util/broadCastParticipantCount.js";
import { IncomingMessage, ServerResponse } from "http";

const prisma = new PrismaClient();


export const participantCrudRoutes = async (fastify: FastifyInstance) => {

  /* ↓ Participant count stream code begins */
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

  /* ↑ Participant count stream code ends */

  //Creating a new participant and linking them to a form, eg. signup
  fastify.post('/form/signup/:id', async (request, reply) => {
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


  //By form Id, Get full participant data of all associated participants
  fastify.get('/form/:id/participants/data', async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      const participants = await prisma.participant.findMany({
        where: { formId: id },
      });

      //Checking for empty array return, findmany always returns a list
      if (!participants || participants.length === 0) {
        return reply.status(404).send({ error: 'Participant data not found' });
      } else {
        return participants;
      }
 
    } catch (err) {
      console.error(err);
      return reply.status(500).send({ error: "Failed to fetch participant data" });
    }
  })

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