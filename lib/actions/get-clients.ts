// lib/actions/get-clients.ts
import { prisma } from "../prisma";

export async function getAllClients() {
  const clients = await prisma.user.findMany({
    where: {
      role: "CLIENT",
    },
    include: {
      bookings: {
        orderBy: {
          startsAt: "desc",
        },
      },
      profile: {
        include: {
          submissions: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return clients;
}

// Array type returned by the function
export type ClientsWithRelations = Awaited<ReturnType<typeof getAllClients>>;

// Single item type required for TanStack Table's ColumnDef
export type ClientWithRelations = ClientsWithRelations[number];