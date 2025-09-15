import { z } from "zod";
import { ParticipantBase } from "./participant.schema.js";

export const FormBase = z.object({
  id: z.string(), //uuid?
  eventId: z.string(), //uuid?
  fields: z.array(
    z.object({
      order: z.number(),
      label: z.string(),
      type: z.string(),
      value: z.union([
        z.string(),
        z.array(z.string()),
      ])
    })
  ),
  participants: z.array(z.lazy(() => ParticipantBase)),
}).strict();
export type FormBaseTypes = z.infer<typeof FormBase>;


export const FormCreate = FormBase.pick({
  //eventId: true,
  fields: true,
  eventId: true,
});
export type FormCreateTypes = z.infer<typeof FormCreate>;

export const FormUpdate = FormBase.omit({
  participants: true,
  eventId: true,
}).strip();
export type FormUpdateTypes = z.infer<typeof FormUpdate>;

export const FormResponse = FormBase.extend({ id: z.string().uuid(), createdAt: z.date() });
