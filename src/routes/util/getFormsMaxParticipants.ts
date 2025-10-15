import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/** 
 * for events table, works with formid
**/
export const getFormsMaxParticipants = async (id: string): Promise<number | null> => {
  try {
    const event = await prisma.event.findFirst({
      where: { id },
    });

    return event?.maxParticipants ?? null;
  } catch (error) {
    console.error('Error fetching maxParticipants:', error);
    return null; // or throw error if you want upstream handling
  }
};