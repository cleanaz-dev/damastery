import { FormStatus } from "../generated/prisma/enums";
import { prisma } from "../prisma";


export async function getClientData(userId: string) {
  const client = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      profile: {
        select: {
          id: true,
          // 1. Pending forms assigned to this client
          assignments: {
            where: {
              status: FormStatus.PENDING,
              expiresAt: { gt: new Date() },
            },
            select: {
              id: true,
              token: true,
              expiresAt: true,
              form: {
                select: {
                  id: true,
                  title: true,
                  key: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },
          // 2. Forms they have completed
          submissions: {
            select: {
              id: true,
              formSlug: true,
              createdAt: true,
              data: true,
              form: {
                select: {
                  title: true,
                  key: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      },
      bookings: {
        where: {
          endsAt: { gte: new Date() },
        },
        orderBy: { startsAt: "asc" },
      },
    },
  });

  return client;
}

export type ClientData = NonNullable<Awaited<ReturnType<typeof getClientData>>>;