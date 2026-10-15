import { prisma } from "../prisma";

// Which booking statuses count as "upcoming". Adjust to match your enum.
const UPCOMING_STATUSES = ["BOOKED", "PENDING"];

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

export async function getClientsDashboard() {
  const clients = await getAllClients();
  const now = new Date();

  let verifiedClients = 0;
  let totalBookings = 0;
  let upcomingBookings = 0;

  for (const client of clients) {
    if (client.emailVerified) verifiedClients++;
    totalBookings += client.bookings.length;

    for (const booking of client.bookings) {
      if (
        booking.startsAt >= now &&
        UPCOMING_STATUSES.includes(booking.status)
      ) {
        upcomingBookings++;
      }
    }
  }

  return {
    clients,
    stats: {
      totalClients: clients.length,
      verifiedClients,
      totalBookings,
      upcomingBookings,
    },
  };
}