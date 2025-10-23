import { getParticipantCount } from "./getParticipantCount.js";

export function broadcastParticipantCount(formId: string, clients: Set<any>) {
  console.log("BROADCAST TRIGGERED");
  console.log("BROADCAST TRIGGERED, CLIENTS", clients);
  const count = getParticipantCount(formId); // fetch latest count

  for (const client of clients) {
    console.log("WRITE TRIGGERED");
    client.write(`data: ${JSON.stringify({ count })}\n\n`);
  }
}
