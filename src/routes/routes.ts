import { FastifyInstance } from "fastify";
import { EventSchema, FormSchema, ParticipantSchema } from "../validation/events.schema.ts"
import { EventTypes, FormTypes, ParticipantTypes } from "../validation/events.schema.ts"
//Note there's a centralized pattern for using Prisma with fastify.
// This pattern makes it so that the prisma instance is only created once
//  and can be accessed from multiple locations that might need it
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface formParams {
  formId: string;
  fields: object;
}


export const eventRoutes = async (fastify: FastifyInstance) => {
  //testing
  fastify.post('/', async (req, reply) => {
    const { event, form } = req.body as { event: any; form: any };

    try {
      //const saved = await fastify.prisma.event.create({
      const saved = await prisma.event.create({
        data: {
          ...event,
          forms: { create: form }
        }
      });

      return saved;
    } catch (err) {
      fastify.log.error(err);
      reply.status(500).send({ error: "Failed to create event" });
    }
  });

  fastify.post("/event", async (request, reply) => {
    const parseResult = EventSchema.safeParse(request.body);

    if (!parseResult.success) {
      return reply.status(400).send({ error: parseResult.error.format() });
    }

    const eventData: EventTypes = parseResult.data;

    const newEvent = await prisma.event.create({
      data: eventData,
    });

    reply.status(201).send(newEvent);
  });


  fastify.post('/create', async (req, reply) => {
    const { event } = req.body as { event: any };

    try {
      const saved = await prisma.event.create({
        data: {
          ...event,
        }
      });

      return saved;
    } catch (err) {
      fastify.log.error(err);
      reply.status(500).send({ error: "Failed to create event" });
    }
  });

  //Get event lists
  fastify.get('/events', async (req, reply) => {

    try {

    } catch (err) {
      fastify.log.error(err);
      reply.status(500).send({ error: "Failed to fetch user's event lists" });
    }
  });

  fastify.get('/users-events', async (req, reply) => {

    try {

    } catch (err) {
      fastify.log.error(err);
      reply.status(500).send({ error: "Failed to fetch user's events" });
    }
  });

  //Update an existing event
  fastify.get('/update', async (req, reply) => {

    try {

    } catch (err) {
      fastify.log.error(err);
      reply.status(500).send({ error: "Failed to fetch user's event lists" });
    }
  });

}

export const formRoutes = async (fastify: FastifyInstance) => {
  fastify.post('/create', async (req, reply) => {
    const { form } = req.body as { form: any };

    try {
      const saved = await prisma.form.create({
        data: {
          ...form,
        }
      });

      return saved;
    } catch (err) {
      fastify.log.error(err);
      reply.status(500).send({ error: "Failed to create form" });
    }
  });

  //Update path
  fastify.patch('/forms/:id', async (request, reply) => {
    const { id } = request.params as { id: number };
    const formUpdates = request.body as formParams; // Replace `Form` with your actual type

    try {
      const updatedForm = await prisma.form.update({
        where: { id },
        data: formUpdates
      });

      return updatedForm;
    } catch (err) {
      fastify.log.error(err);
      reply.status(500).send({ error: 'Failed to update form' });
    }
  });

  //Get a singular form
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: number };

    try {
      const form = await prisma.form.findUnique({
        where: { id },
      });

      if (!form) {
        return reply.status(404).send({ error: 'Form not found' });
      }

      return form;
    } catch (err) {
      request.log.error(err);
      return reply.status(500).send({ error: 'Failed to retrieve form' });
    }
  });

}

export const participantRoutes = async (fastify: FastifyInstance) => {
  // fastify.post('/:id/signup', async (request, reply) => {
  //   const { id } = request.params as { id: number };

  //   try {

  //   }
  // });

  fastify.post('/:id/signup', async (request, reply) => {
    const { id } = request.params as { id: number };

    const parseResult = ParticipantSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({ error: "Invalid participant data", details: parseResult.error.errors });
    }

    const participantData = parseResult.data;

    try {
      const newParticipant = await prisma.participant.create({
        data: {
          ...participantData,
          formId: id, // assuming `formId` is the foreign key in your DB
          answers: participantData.answers, // Typescript says gtfo w this zod shit
        },
      });

      return reply.status(201).send(newParticipant);
    } catch (err) {
      request.log.error(err);
      return reply.status(500).send({ error: "Failed to create participant" });
    }
  });
}