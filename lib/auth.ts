import { betterAuth } from "better-auth";
import { dash } from "@better-auth/infra";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient, UserRole } from "./generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { admin as adminPlugin } from "better-auth/plugins";
import { ac, admin, customer } from "./permissions";


const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  baseURL: {
    allowedHosts: [
      "localhost:3000",
      "lvh.me:3000",
      "*.lvh.me:3000",
      "brett-photo.vercel.app",
      "*.brett-photo.vercel.app",
    ],
    fallback: "http://localhost:3000",
  },
  trustedOrigins: [
    "http://localhost:3000",
    "http://lvh.me:3000",
    "http://admin.lvh.me:3000",
    "https://admin.brett-photo.vercel.app",
    "https://*.brett-photo.vercel.app",
  ],

  advanced: {
    crossSubDomainCookies: {
      enabled: true,
      domain:
        process.env.NODE_ENV === "production"
          ? ".brett-photo.vercel.app"
          : ".lvh.me",
    },
    useSecureCookies: process.env.NODE_ENV === "production",
  },

  emailAndPassword: {
    enabled: true,
  },

  // ADD THIS BLOCK
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  user: {
    fields: {
      image: "avatarUrl", // map Better Auth's "image" to your "avatarUrl" column
    },
    additionalFields: {
      role: {
        type: "string",
        defaultValue: UserRole.CUSTOMER,
        input: false,
      },
      phone: {
        type: "string",
        required: false,
      },
    },
  },
  plugins: [
    dash(),
    adminPlugin({
      defaultRole: UserRole.CUSTOMER,
      ac,
      roles: {
        ADMIN: admin,
        CUSTOMER: customer,
      },
    }),
  ],
});
