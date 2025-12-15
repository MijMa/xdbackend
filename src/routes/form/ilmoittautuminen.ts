import { FastifyInstance } from "fastify";
import { FormBase, FormBaseTypes, FormCreate, FormCreateTypes, FormUpdate, FormUpdateTypes } from "../../validation/form.schema.js";
//Note there's a centralized pattern for using Prisma with fastify.
// This pattern makes it so that the prisma instance is only created once
//  and can be accessed from multiple locations that might need it
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


export const ilmoittautuminenRoutes = async (fastify: FastifyInstance) => {


}