import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/** 
 * for events table, works with formid
**/
export const getFormsMaxParticipants = async (id: string): Promise<number | null> => {
  try {
    const form = await prisma.form.findUnique({
      where: { id: id },
    });

    if (!form || !form.eventId) {
      throw new Error("Form not found or missing eventId");
    }

    const event = await prisma.event.findUnique({
      where: { 
        id: form.eventId
      },
    });

    return event?.maxParticipants ?? null;
  } catch (error) {
    console.error('Error fetching maxParticipants:', error);
    return null; // or throw error if you want upstream handling
  }
};