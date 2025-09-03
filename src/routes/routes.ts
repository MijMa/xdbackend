import { FastifyInstance } from "fastify";
import { EventSchema, FormSchema, ParticipantSchema } from "../validation/validators.schema.ts"
import { EventTypes, FormTypes, ParticipantTypes } from "../validation/validators.schema.ts"
//Note there's a centralized pattern for using Prisma with fastify.
// This pattern makes it so that the prisma instance is only created once
//  and can be accessed from multiple locations that might need it
import { PrismaClient } from '@prisma/client';
import { z } from "zod";
import { create } from "node:domain";

const prisma = new PrismaClient();

interface formParams {
  formId: string;
  fields: object;
}

//Apufunktio, ei käytössä
export const omitUndefined = <T extends Record<string, any>>(obj: T): Partial<T> => {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined)
  ) as Partial<T>;
};




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


  //Creates a event
  fastify.post("/create", async (request, reply) => {

    const CreateBodySchema = z.object({
      event: EventSchema,
    });

    //Validation
    const parseResult = CreateBodySchema.safeParse(request.body);

    if (!parseResult.success) {
      return reply.status(400).send({ error: parseResult.error.format() });
    }

    const event: EventTypes = parseResult.data.event;
    //prisma nonsense
    //const reducedForms = event.forms.map(({ participants, ...rest }) => rest);



    const cd = event.forms;
    const cf = cd[0].participants;

    //Note that prisma also offers other commands like createmany
    const newEvent = await prisma.event.create({
      data: {
        ...event,
        forms: {
          //Prisma complexity circumventer
          //strips out the participants field
          // create: reducedForms,
          create: event.forms.map(({ participants, ...form }) => form)
        },
      },
      include: {
        forms: true,
      }
    });

    reply.status(201).send(newEvent);
  });


  //Get event lists
  fastify.get('/events', async (req, reply) => {

    try {

    } catch (err) {
      fastify.log.error(err);
      reply.status(500).send({ error: "Failed to fetch user's event lists" });
    }
  });

  //Get all events by user
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

    const parseResult = FormSchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(400).send({ 
        error: "Invalid participant data", 
        details: parseResult.error 
      });
    }
    const formData: FormTypes = parseResult.data;
    console.log(formData);

    try {
      const saved = await prisma.form.create({
        data: {
          ...formData,
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
    const { id } = request.params as { id: string };
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
    const { id } = request.params as { id: string };

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
    const { id } = request.params as { id: string };

    const parseResult = ParticipantSchema.safeParse(request.body);
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