import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/** 
 * for participants table, works with formId
**/
export const getParticipantCount = async (id: string) => {
  try {
    const participantcount = await prisma.participant.count({
        where: {
          formId: id
        }
    })
    return participantcount
  } catch (error) {
    console.error('Error fetching participant count from participants table: ', error);
    return null; // or throw error if you want upstream handling
  }
}