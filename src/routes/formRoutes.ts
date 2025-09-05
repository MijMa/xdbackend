import { FastifyInstance } from "fastify";
import { FormBase, FormBaseTypes, FormCreate, FormCreateTypes } from "../validation/form.schema.ts";
//Note there's a centralized pattern for using Prisma with fastify.
// This pattern makes it so that the prisma instance is only created once
//  and can be accessed from multiple locations that might need it
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();




export const formRoutes = async (fastify: FastifyInstance) => {
  //Creating a form
  fastify.post('/create', async (req, reply) => {

    const parseResult = FormCreate.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(400).send({ 
        error: "Invalid participant data", 
        details: parseResult.error 
      });
    }
    const formData: FormCreateTypes = parseResult.data;
    console.log(formData);

    try {
      const saved = await prisma.form.create({
        data: {
          ...formData,
        }
      });

    // try {
    //   const saved = await prisma.form.create({
    //     data: {
    //       ...formData,
    //       participants: {
    //         create: []
    //       }
    //     }
    //   });


      return saved;
    } catch (err) {
      fastify.log.error(err);
      reply.status(500).send({ error: "Failed to create form" });
    }
  });

  //Update path
  fastify.patch('/forms/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const formUpdates = request.body as any; // Replace `Form` with your actual type

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