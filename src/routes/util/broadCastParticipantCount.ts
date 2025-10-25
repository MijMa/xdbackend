import { IncomingMessage, ServerResponse } from "http";
import { getParticipantCount } from "./getParticipantCount.js";

type FastifyReply = {
  reply: ServerResponse<IncomingMessage>
}

export async function broadcastParticipantCount (formId: string, clients: Set<FastifyReply["reply"]>) {
  const count = await getParticipantCount(formId); // fetch latest count

  for (const client of clients) {
    client.write(`data: ${count}\n\n`);
    client.write(`data: ${count}\n\n`);
  }
}
