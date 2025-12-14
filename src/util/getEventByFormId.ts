import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

//For fetching a event associated with a formid and stripping 
export const getEventByFormId = async (id: string) => {
  try {
    const form = await prisma.form.findUnique({
      where: { id: id },
    });

    if (!form || !form.eventId) {
      throw new Error("Form not found or missing eventId");
    }

    const event = await prisma.event.findUnique({
      where: { id: form.eventId },
    });
    return event;

  } catch (error) {
    console.error('Error fetching event with formId:', error);
    return null; // or throw error if you want upstream handling
  }
}