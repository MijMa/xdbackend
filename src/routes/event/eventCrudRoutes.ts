import { FastifyInstance } from "fastify";
import { EventBase, EventBaseTypes, EventCreate,
   EventCreateTypes, EventUpdate, EventUpdateTypes,
   EventPublic, EventPublicTypes } from "../../validation/event.schema.js";
import { FormBase, FormBaseTypes, FormCreate, FormCreateTypes } from "../../validation/form.schema.js";
//Note there's a centralized pattern for using Prisma with fastify.
// This pattern makes it so that the prisma instance is only created once
//  and can be accessed from multiple locations that might need it
import { PrismaClient } from '@prisma/client';
//The prisma namespace can be imported to make use of the type generation
// offered by prisma (npx prisma generate)
// HOVEVER, type validation is still needed during runtime,
// which is not provided purely by typescript types and that's why
// these routes are using zod parsers for validation
//   The create input types are nice since they provide base types for models
import { Prisma } from '@prisma/client';
import { getEventByFormId } from "../../util/getEventByFormId.js";
import { verifySession } from "supertokens-node/recipe/session/framework/fastify";
import { SessionRequest } from "supertokens-node/framework/fastify";

const prisma = new PrismaClient();


//Type definition for the body payload of create event(and form) route
interface createTypes {
  Body: {
    event: Prisma.EventCreateInput,
    form: Prisma.FormCreateInput
  }
}

export const eventCrudRoutes = async (fastify: FastifyInstance) => {

  //Creates a event
  fastify.post<createTypes>("/create", async (request, reply) => {

    //Could also just use .strip() in the zod schema, to rid exess fields
    // I'll leave this abomination up for reflection
    const { id: eventId, createdAt, updatedAt, forms,
      ...eventPayload } = request.body.event;
    const { id: formId, participants,
      ...formPayload } = request.body.form;

    const parseResult1 = EventCreate.safeParse(eventPayload);
    const parseResult2 = FormCreate.safeParse(formPayload);
    if (!parseResult1.success || !parseResult2.success) {
      return reply.status(400).send({
         error: !parseResult1.success ? parseResult1.error.issues : parseResult2.error?.issues, 
        });
    }    
    const eventData: EventCreateTypes = parseResult1.data;
    const formData: FormCreateTypes = parseResult2.data;
    const { eventId: eventId2, ...form } = formData;
    const { ...event } = eventData


    try {
      //Note that prisma also offers other commands like createMany
      const newEventnForm = await prisma.event.create({
        data: {
          ...event,
          forms: {
            create: [
              {
                ...form
              }
            ]
          }
        },
        include: {
          forms: true,
        }
      });

      reply.status(201).send(newEventnForm);

    } catch (err) {
      // request.log.error(err); forcing the error trough a string ruins formatting
      console.error(err);
      return reply.status(500).send({ error: "Failed o create event" });
    }
  });

  //Update an existing event
  fastify.put<{ Body: EventBaseTypes }>("/update", async (request, reply) => {
    const parseResult = EventUpdate.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({ errors: parseResult.error.issues });
    }
    const event: EventUpdateTypes = parseResult.data;
    const { id, ...rest } = event;

    try {
      const updatedEvent = await prisma.event.update({
        where: { id },
        data: rest, // only provided fields will be updated
      });
      return reply.status(200).send(updatedEvent);

    } catch (err: any) {
      console.error(err);
      // Handle "record not found" specifically
      if (err.code === "P2025") {
        return reply.status(404).send({ error: "Event not found" });
      }
      return reply.status(500).send({ error: "Failed to update event" });
    }
  });

  //Get an event by formid, strip it to just base data and give to user
  //Used in ilmoittautuminen page for using descriptions and such
  fastify.get("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const event = await getEventByFormId(id);
      if (event !== null) {
        //forms does not need to be deconstructed, since related tables are seen as undefined by default
        const {owner, createdAt, updatedAt, ...eventRest} = event;
        const strippedEvent: EventPublicTypes = eventRest;
        return strippedEvent; 
      }
    } catch (error) {
      console.error(error);
      reply.status(500).send({ error: error });
    }
  });

  //Get user's event lists - to be impl fully, does not currently pick by user
  fastify.get("/events", { preHandler: verifySession() }, async (req, reply) => {
    const session = (req as SessionRequest).session;
    if (!session) { //If falsy, than no event lists given
      reply.status(404).send({ error: "Access denied" });
      return;
    }
    const userId = session.getUserId();
    
    try {
      const now = new Date();

      // 1️. Created within the last 3 months
      const threeMonthsAgo = new Date(now);
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      // 2️. Starts within the next 3 months
      const threeMonthsFromNow = new Date(now);
      threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

      // 3️. Ended within the last 3 months
      const threeMonthsAgoEnd = new Date(now);
      threeMonthsAgoEnd.setMonth(threeMonthsAgoEnd.getMonth() - 3);

      // Common include block so we don't repeat ourselves
      const eventInclude = {
        forms: {
          include: {
            participants: true,
          },
        },
      };

      // Query each category separately
      const newEvents = await prisma.event.findMany({
        where: {
          createdAt: {
            gte: threeMonthsAgo,
          },
          owner: userId,
        },
        include: eventInclude,
        orderBy: { createdAt: "desc" },
        take: 5,
      });

      const upcomingEvents = await prisma.event.findMany({
        where: {
          startDate: {
            gte: now,
            lte: threeMonthsFromNow,
          },
          owner: userId,
        },
        include: eventInclude,
        orderBy: { startDate: "asc" },
        take: 5,
      });

      const pastEvents = await prisma.event.findMany({
        where: {
          endDate: {
            gte: threeMonthsAgoEnd,
            lte: now,
          },
          owner: userId,
        },
        include: eventInclude,
        orderBy: { startDate: "desc" },
        take: 5,
      });

      // Return in your desired shape
      const result = {
        newEvents: newEvents,
        upcomingEvents: upcomingEvents,
        pastEvents: pastEvents,
      };

      reply.send(result);
    } catch (err) {
      console.error(err);
      reply.status(500).send({ error: err });
    }
  });

  //Get all events by user - to be impl fully
  fastify.get('/users-events', { preHandler: verifySession() }, async (request, reply) => {
    const session = (request as SessionRequest).session;
    if (!session) {
      reply.status(404).send({ error: "Access denied" });
      return;
    }
    const userId = session.getUserId();

    try {
      //Prisma findMany returns all instances when 'where' is not provided
      const allEvents = await prisma.event.findMany({
        where: {
          owner: userId,
        },
        include: {
            forms: {
                include: {
                    participants: true
                }
            }
        },
        orderBy: { startDate: "desc" },
      });
      reply.send(allEvents);
    } catch (err) {
      fastify.log.error(err);
      reply.status(500).send({ error: "Failed to fetch user's events" });
    }
  });
}
