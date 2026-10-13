import { prisma } from "../prisma";

export async function getClientData(userId: string) {
  const client = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      profile: true,
      bookings: true,
    },
  });

  return client;
}

export type ClientData = Awaited<ReturnType<typeof getClientData>>;
