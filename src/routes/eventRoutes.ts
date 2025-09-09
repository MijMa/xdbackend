import { FastifyInstance } from "fastify";
import { EventBase, EventBaseTypes, EventCreate, EventCreateTypes, EventUpdate, EventUpdateTypes } from "../validation/event.schema.js";
//Note there's a centralized pattern for using Prisma with fastify.
// This pattern makes it so that the prisma instance is only created once
//  and can be accessed from multiple locations that might need it
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


export const eventRoutes = async (fastify: FastifyInstance) => {

  //Creates a event
  fastify.post("/create", async (request, reply) => {
    console.log("Request received");
    //Validation
    const parseResult = EventCreate.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({ error: parseResult.error.format() });
    }
    const event: EventCreateTypes = parseResult.data;

    try {
      //Note that prisma also offers other commands like createmany
      const newEvent = await prisma.event.create({
        data: {
          ...event,
        },
        include: {
          forms: true,
        }
      });

      reply.status(201).send(newEvent);

    } catch (err) {
      request.log.error(err);
      return reply.status(500).send({ error: "Failed o create event" });
    }
  });

  //Update an existing event
  fastify.put<{ Params: { id: string }; Body: EventUpdateTypes }>(
    "/update/:id",
    async (request, reply) => {
      const { id } = request.params;

      // Validate body against partial schema
      const parseResult = EventUpdate.safeParse(request.body);
      if (!parseResult.success) {
        return reply.status(400).send({ error: parseResult.error.format() });
      }

      try {
        const updatedEvent = await prisma.event.update({
          where: { id },
          data: parseResult.data, // only provided fields will be updated
        });

        return reply.status(200).send(updatedEvent);
      } catch (err: any) {
        request.log.error(err);

        // Handle "record not found" specifically
        if (err.code === "P2025") {
          return reply.status(404).send({ error: "Event not found" });
        }

        return reply.status(500).send({ error: "Failed to update event" });
      }
    }
  );

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
        newEvents: upcomingEvents,
        upcomingEvents: upcomingEvents,
        pastEvents: pastEvents,
      };

      reply.send(result);
    } catch (err) {
      reply.status(500).send({ error: err });
    }
  });

  //Get all events by user - to be impl fully
  fastify.get('/users-events', async (req, reply) => {

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
