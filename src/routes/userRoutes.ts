import { verifySession } from "supertokens-node/recipe/session/framework/fastify";
import { deleteUser, getUsersNewestFirst } from "supertokens-node";
import supertokens from "supertokens-node";

import { FastifyInstance } from "fastify";
import { SessionRequest } from "supertokens-node/framework/fastify";

//supertokens needs this to show logged in user
export const userRoutes = async (fastify: FastifyInstance) => {
  
    fastify.get("/user-info", { preHandler: verifySession() }, async (req, reply) => {
        const session = (req as SessionRequest).session;
        if (!session) {
            reply.status(404).send({ error: "Session not found" });
            return;
        }
        const userId = session.getUserId();
        const user = await supertokens.getUser(userId);
        if (!user) {
            reply.status(404).send({ error: "User not found" });
            return;
        }
        reply.send({ email: user.emails[0] });
    });

    //Get all users, or at least the parts of the data we wish to show
    fastify.get("/admins", async (req, res) => {
        try {
            const usersResponse = await getUsersNewestFirst({
                limit: 200,
                tenantId: "public"
            });
            const destructuredUsers = usersResponse.users.map(({id, tenantIds, emails}) => {
                return {id, tenantIds, emails}
            })
            return(destructuredUsers);
        } catch (err) {
            console.error(err);
            return res.status(500).send({error: "Failed to retrieve admins"});
        }
    });
    fastify.delete("/delete-admin/:id", async (request, reply) => {
        const { id } = request.params as { id: string };
        try {
            const usersResponse = await deleteUser(id);
            return(usersResponse);
        } catch (err) {
            console.error(err);
            return reply.status(500).send({error: "Failed to remove user"});
        }
    });

}
