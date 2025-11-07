import { verifySession } from "supertokens-node/recipe/session/framework/fastify";
import { deleteUser, getUsersNewestFirst, getUsersOldestFirst } from "supertokens-node";
import supertokens from "supertokens-node";

import { FastifyInstance } from "fastify";
import { SessionRequest } from "supertokens-node/framework/fastify";
import EmailPassword from "supertokens-node/recipe/emailpassword";


type signupRequestBody = {tenantId: string, email: string, password: string}

export const userRoutes = async (fastify: FastifyInstance) => {

    //custom route instead of recipe so we avoid breaking typescript and api and rules 
    //The purpose of this endpoint is to enable user creation without immediately signing in
    // the user that has been created.
    //Note that there's also an override written into supertokens recipe api.signupPOST
    fastify.post("/admin/signup", { preHandler: verifySession() }, async (request, response) => {
        const session = (request as SessionRequest).session;
        if (!session) {
            response.status(404).send({ error: "session not found" });
            return;
        }

        const signupBody: signupRequestBody = request.body as signupRequestBody;
        try {
            const response = await EmailPassword.signUp(signupBody.tenantId, signupBody.email, signupBody.password);
            if (response.status === "OK") {
                return {
                    status: "OK",
                    user: response.user,
                    session: undefined, //palauttaa undefined joka estää automaattikirjautumisen
                };
            }
            if (response.status === "EMAIL_ALREADY_EXISTS_ERROR") {
                return {
                    status: "EMAIL_ALREADY_EXISTS_ERROR",
                };
            }
            return response; //fallback for other errrors
        } catch (error) {
            return error;
        }
    })
  
    // Returns the whole email to user
    fastify.get("/user-info", { preHandler: verifySession() }, async (request, reply) => {
        const session = (request as SessionRequest).session;
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
            const usersResponse = await getUsersOldestFirst({
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
    //Delete a admin
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
