
import { z } from "zod";

export const EventSchema = z.object({
  name: z.string().min(1),
  owner: z.string().min(1),
  description: z.string().optional,
  place: z.string().optional,
  startDate: z.string(), // Consider using z.coerce.date() if you want to parse strings into Date objects
  endDate: z.string(),
  // startDate: z.string().refine(val => !isNaN(Date.parse(val)), {
  //   message: "Invalid start date format",
  // }),
  // endDate: z.string().refine(val => !isNaN(Date.parse(val)), {
  //   message: "Invalid end date format",
  // }),
  minParticipants: z.number().int().nonnegative().optional,
  maxParticipants: z.number().int().nonnegative().optional,
  signupStarts: z.string().optional,
  signupEnds: z.string().optional,
  price: z.number().int().nonnegative().optional,
  metadata: z.string().optional,
}).strict();

export const FormSchema = z.object({
  eventId: z.string().uuid(),
  fields: z.json(),
  participants: z.json(),
}).strict();

export const ParticipantSchema = z.object({
  formId: z.string().uuid(),
  name: z.string().min(1),
  userEmail: z.string().email(),
  answers: z.array(
    z.object({
      order: z.number(),
      label: z.string(),
      value: z.union([
        z.string(),
        z.array(z.string())
      ])
    })
  )
}).strict();

// Infer the TypeScript type from the schema
export type EventTypes = z.infer<typeof EventSchema>;
export type FormTypes = z.infer<typeof FormSchema>;
export type ParticipantTypes = z.infer<typeof ParticipantSchema>;
