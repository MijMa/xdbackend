import { z } from "zod";
import { ParticipantBase } from "./participant.schema.js";
import { FormBase } from "./form.schema.js";

export const EventBase = z.object({
  id: z.string(), //uuid?
  name: z.string().min(1),
  owner: z.string().min(1),
  description: z.string().optional(),
  place: z.string().optional(),
  startDate: z.coerce.date(), // parse strings into Date objects upon receiving
  endDate: z.coerce.date(),
  // startDate: z.string().refine(val => !isNaN(Date.parse(val)), {
  //   message: "Invalid start date format",
  // }),
  // endDate: z.string().refine(val => !isNaN(Date.parse(val)), {
  //   message: "Invalid end date format",
  // }),
  minParticipants: z.number().int().nonnegative().optional(),
  maxParticipants: z.number().int().nonnegative().optional(),
  signupStarts: z.coerce.date().optional(),
  signupEnds: z.coerce.date().optional(),
  price: z.number().nonnegative().optional(),
  metaData: z.record(z.string(), z.any()),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  forms: z.array(z.lazy(() => FormBase)),
}).strict();
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
  metaData: true,
});
export type EventCreateTypes = z.infer<typeof EventCreate>;

//partial - only the provided fields will be updated, all is optional
export const EventUpdate = EventBase.omit({
  createdAt: true,
  updatedAt: true,
  forms: true,
}).strip();
export type EventUpdateTypes = z.infer<typeof EventUpdate>;

export const EventResponse = EventBase.extend({ id: z.string().uuid(), createdAt: z.date() });
