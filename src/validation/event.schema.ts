import { z } from "zod";
import { ParticipantBase } from "./participant.schema.ts";
import { FormBase } from "./form.schema.ts";

export const EventBase = z.object({
  name: z.string().min(1),
  owner: z.string().min(1),
  description: z.string().optional(),
  place: z.string().optional(),
  startDate: z.string(), // Consider using z.coerce.date() if you want to parse strings into Date objects
  endDate: z.string(),
  // startDate: z.string().refine(val => !isNaN(Date.parse(val)), {
  //   message: "Invalid start date format",
  // }),
  // endDate: z.string().refine(val => !isNaN(Date.parse(val)), {
  //   message: "Invalid end date format",
  // }),
  minParticipants: z.number().int().nonnegative().optional(),
  maxParticipants: z.number().int().nonnegative().optional(),
  signupStarts: z.string().optional(),
  signupEnds: z.string().optional(),
  price: z.number().int().nonnegative().optional(),
  metadata: z.string().optional(),
  forms: z.array(z.lazy(() => FormBase)),
}).strict();
//Inferring the typescript type from the schema for live error checking
export type EventBaseTypes = z.infer<typeof EventBase>;

//Optionals and other traits are inherited, no need to redeclare
//Just leave out the properties that are not a part of event creation
export const EventCreate = EventBase.pick({
  name: true,
  owner: true,
  description: true,
  place: true,
  startDate: true,
  endDate: true,
  minParticipants: true,
  maxParticipants: true,
  signupStarts: true,
  signupEnds: true,
  price: true,
  metadata: true,
});
export type EventCreateTypes = z.infer<typeof EventCreate>;

//We limit the update schema to just affect the event object itself
export const EventUpdate = EventCreate.partial();
export type EventUpdateTypes = z.infer<typeof EventUpdate>;

export const EventResponse = EventBase.extend({ id: z.string().uuid(), createdAt: z.date() });
