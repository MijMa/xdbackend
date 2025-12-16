import { FastifyInstance } from "fastify";
import { FormBase, FormBaseTypes, FormCreate, FormCreateTypes, FormUpdate, FormUpdateTypes } from "../../validation/form.schema.js";
//Note there's a centralized pattern for using Prisma with fastify.
// This pattern makes it so that the prisma instance is only created once
//  and can be accessed from multiple locations that might need it
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


export const formCrudRoutes = async (fastify: FastifyInstance) => {
  
  //Creating a form
  //Huom, olettaa että eventId tulee mukana
  fastify.post('/forms/create', async (req, reply) => {

    const parseResult = FormCreate.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(400).send({ 
        error: "Invalid form creation data", 
        details: parseResult.error.issues 
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

  //Update a singular form
  fastify.put('/form/update', async (request, reply) => {

    const parseResult = FormUpdate.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({ 
        errors: parseResult.error.issues
      });
    }
    const formData: FormUpdateTypes = parseResult.data;
    const { id, ...form } = formData;

    try {
      const updatedForm = await prisma.form.update({
        where: { id },
        data: form
      });

      return updatedForm;
    } catch (err) {
      console.error(err);
      reply.status(500).send({ error: 'Failed to update form' });
    }
  });

  //Get a singular form, used by user event signup
  fastify.get('/ilmoittautuminen/form/:id', async (request, reply) => {
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


}