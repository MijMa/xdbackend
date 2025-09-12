import { FastifyInstance } from "fastify";
import { FormBase, FormBaseTypes, FormCreate, FormCreateTypes, FormUpdate, FormUpdateTypes } from "../validation/form.schema.js";
//Note there's a centralized pattern for using Prisma with fastify.
// This pattern makes it so that the prisma instance is only created once
//  and can be accessed from multiple locations that might need it
import { PrismaClient } from '@prisma/client';
import z from "zod";
const prisma = new PrismaClient();


export const formRoutes = async (fastify: FastifyInstance) => {
  
    //Creating a form
  fastify.post('/create', async (req, reply) => {

    const parseResult = FormCreate.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(400).send({ 
        error: "Invalid form creation data", 
        details: parseResult.error 
      });
    }
    const formData: FormCreateTypes = parseResult.data;

    try {
      const saved = await prisma.form.create({
        data: {
          ...formData,
        }
      });
      return saved;

    } catch (err) {
      console.error(err);
      reply.status(500).send({ error: "Failed to create form" });
    }
  });

  //Update path
  fastify.patch('/forms/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const parseResult = FormUpdate.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({ 
        error: "Invalid form update data", 
        details: parseResult.error 
      });
    }
    const formData: FormUpdateTypes = parseResult.data;

    try {
      const updatedForm = await prisma.form.update({
        where: { id },
        data: formData
      });

      return updatedForm;
    } catch (err) {
      console.error(err);
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
      } else {
        request.log.info(form);
        return form;
      }

    } catch (err) {
      console.error(err);
      return reply.status(500).send({ error: 'Failed to retrieve form' });
    }
  });

}