import { prisma } from "../prisma";

// Which booking statuses count as "upcoming". Adjust to match your enum.
const UPCOMING_STATUSES = ["BOOKED", "PENDING"];

const formSummary = { select: { id: true, key: true, title: true } } as const;

export async function getAllClients() {
  const clients = await prisma.user.findMany({
    where: {
      role: "CLIENT",
    },
    include: {
      bookings: {
        orderBy: { startsAt: "desc" },
      },
      profile: {
        include: {
          // Forms assigned to this client (pending / completed / expired)
          assignments: {
            orderBy: { createdAt: "desc" },
            include: {
              form: formSummary,
              submission: { select: { id: true, createdAt: true } },
            },
          },
          // Forms they've actually submitted
          submissions: {
            orderBy: { createdAt: "desc" },
            include: { form: formSummary },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Invites sent by email BEFORE the client registered have profileId = null,
  // so they won't show up under profile.assignments. Match them by email.
  const unlinked = await prisma.formAssignment.findMany({
    where: {
      profileId: null,
      email: { in: clients.map((c) => c.email) },
    },
    orderBy: { createdAt: "desc" },
    include: { form: formSummary },
  });

  const unlinkedByEmail = new Map<string, typeof unlinked>();
  for (const a of unlinked) {
    const key = a.email.toLowerCase();
    unlinkedByEmail.set(key, [...(unlinkedByEmail.get(key) ?? []), a]);
  }

  return clients.map((client) => ({
    ...client,
    unlinkedAssignments: unlinkedByEmail.get(client.email.toLowerCase()) ?? [],
  }));
}

// Forms that can be assigned (feed this to your "Assign form" dropdown)
export async function getAssignableForms() {
  return prisma.form.findMany({
    where: { active: true },
    orderBy: { title: "asc" },
    select: { id: true, key: true, title: true },
  });
}

// Array type returned by the function
export type ClientsWithRelations = Awaited<ReturnType<typeof getAllClients>>;

// Single item type required for TanStack Table's ColumnDef
export type ClientWithRelations = ClientsWithRelations[number];

export type AssignableForm = Awaited<
  ReturnType<typeof getAssignableForms>
>[number];

export async function getClientsDashboard() {
  const [clients, forms] = await Promise.all([
    getAllClients(),
    getAssignableForms(),
  ]);
  const now = new Date();

  let verifiedClients = 0;
  let totalBookings = 0;
  let upcomingBookings = 0;
  let pendingForms = 0;

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

    const allAssignments = [
      ...(client.profile?.assignments ?? []),
      ...client.unlinkedAssignments,
    ];
    for (const a of allAssignments) {
      // PENDING past its expiresAt is effectively expired
      if (a.status === "PENDING" && a.expiresAt > now) pendingForms++;
    }
  }

  return {
    clients,
    forms,
    stats: {
      totalClients: clients.length,
      verifiedClients,
      totalBookings,
      upcomingBookings,
      pendingForms,
    },
  };
}