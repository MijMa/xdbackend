import { FastifyInstance } from "fastify";
import { EventBase, EventBaseTypes, EventCreate, EventCreateTypes, EventUpdate, EventUpdateTypes } from "../validation/event.schema.js";
import { FormBase, FormBaseTypes, FormCreate, FormCreateTypes } from "../validation/form.schema.js";
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

const prisma = new PrismaClient();


//Type definition for the body payload of create event(and form) route
interface createTypes {
  Body: {
    event: Prisma.EventCreateInput,
    form: Prisma.FormCreateInput
  }
}

export const eventRoutes = async (fastify: FastifyInstance) => {

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
    console.log("Request received to /update");
    const parseResult = EventUpdate.safeParse(request.body);
    console.log(parseResult);
    if (!parseResult.success) {
      return reply.status(400).send({ errors: parseResult.error.issues });
    }
    const event: EventUpdateTypes = parseResult.data;
    console.log(event);
    const { id, ...rest } = event;
    console.log("ID(id): ", id);

    try {
      console.log("TRY BLOCK?");
      const updatedEvent = await prisma.event.update({
        where: { id },
        data: rest, // only provided fields will be updated
      });
      return reply.status(200).send(updatedEvent);

    } catch (err: any) {
      console.log("ERROR?");
      console.error(err);
      // Handle "record not found" specifically
      if (err.code === "P2025") {
        return reply.status(404).send({ error: "Event not found" });
      }
      return reply.status(500).send({ error: "Failed to update event" });
    }
  });

  //Get user's event lists - to be impl fully
  fastify.get("/events", async (req, reply) => {
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
        },
        include: eventInclude,
        orderBy: { startDate: "asc" },
      });

      const upcomingEvents = await prisma.event.findMany({
        where: {
          startDate: {
            gte: now,
            lte: threeMonthsFromNow,
          },
        },
        include: eventInclude,
        orderBy: { startDate: "asc" },
      });

      const pastEvents = await prisma.event.findMany({
        where: {
          endDate: {
            gte: threeMonthsAgoEnd,
            lte: now,
          },
        },
        include: eventInclude,
        orderBy: { startDate: "asc" },
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
  fastify.get('/users-events', async (request, reply) => {
    //Tässä kohtaa tulisi parsia sisääntulevasta requestista omistaja
    // ja käyttää omistajaa findmany haussa
    // Nyt hakee vaan kaikki tapahtumat tietokannasta

    try {
      //Prisma findMany returns all instances when 'where' is not provided
      const newEvents = await prisma.event.findMany({
        //where owner = "signedinuser"
        //where: { owner: userName },
        include: {
            forms: {
                include: {
                    participants: true
                }
            }
        },
        orderBy: { startDate: "desc" },
      });

    } catch (err) {
      fastify.log.error(err);
      reply.status(500).send({ error: "Failed to fetch user's events" });
    }
  });
}
