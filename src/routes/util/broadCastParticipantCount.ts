import { getParticipantCount } from "./getParticipantCount.js";

export function broadcastParticipantCount(formId: string, clients: Set<any>) {
  const count = getParticipantCount(formId); // fetch latest count

  for (const client of clients) {
    client.write(`data: ${JSON.stringify({ count })}\n\n`);
  }
}
