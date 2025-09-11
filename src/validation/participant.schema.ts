import { z } from "zod";

export const ParticipantBase = z.object({
  formId: z.string(), //uuid?
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
export type ParticipantTypes = z.infer<typeof ParticipantBase>;

export const ParticipantCreate = ParticipantBase.pick({
    formId: true,
    name: true,
    userEmail: true,
    answers: true
});
export type ParticipantCreateTypes = z.infer<typeof ParticipantCreate>;

export const ParticipantUpdate = ParticipantCreate.partial();
export type ParticipantUpdateTypes = z.infer<typeof ParticipantUpdate>;

export const ParticipantResponse = ParticipantBase.extend({ id: z.string().uuid(), createdAt: z.date() });
