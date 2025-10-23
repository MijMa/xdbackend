import { IncomingMessage, ServerResponse } from "http";
import { getParticipantCount } from "./getParticipantCount.js";

type FastifyReply = {
  reply: ServerResponse<IncomingMessage>
}

export async function broadcastParticipantCount (formId: string, clients: Set<FastifyReply["reply"]>) {
  console.log("BROADCAST TRIGGERED");
  console.log("BROADCAST TRIGGERED, CLIENTS", clients.size);
  const count = await getParticipantCount(formId); // fetch latest count
  console.log("Count received from call: ", count);

  for (const client of clients) {
    console.log("WRITE TRIGGERED ", `data: ${JSON.stringify({ count })}\n\n`);
    client.write(`data: ${count}\n\n`);
    client.write(`data: ${count}\n\n`);
  }
}
