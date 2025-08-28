
import Fastify from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const fastify = Fastify({
    logger: true
})

fastify.get('/users', async (request, reply) => {
    const users = await prisma.user.findMany();
    reply.send(users)
});

fastify.listen({ port: 3000 }, (err, address) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    console.log("Server running on http://localhost:3000");
});