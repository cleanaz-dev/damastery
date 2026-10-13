// lib/actions/get-client-data.ts
import { prisma } from "../prisma";

export async function getClientData(userId: string) {
  const client = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      profile: {
        include: {
          submissions: true, // We can use this to check what forms they've completed
        }
      },
      bookings: {
        where: {
          endsAt: { gte: new Date() } // Only show upcoming sessions
        },
        orderBy: { startsAt: 'asc' },
      },
    },
  });

  return client;
}

export type ClientData = NonNullable<Awaited<ReturnType<typeof getClientData>>>;