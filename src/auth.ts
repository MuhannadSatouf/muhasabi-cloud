import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "./lib/prisma";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.string().email()),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },

  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },

      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;

        const user = await prisma.user.findFirst({
          where: {
            email,
          },
          include: {
            workspaceMemberships: {
              orderBy: {
                createdAt: "asc",
              },
              take: 1,
            },
          },
        });

        if (!user) {
          return null;
        }

        const passwordIsValid = await bcrypt.compare(
          password,
          user.hashedPassword
        );

        if (!passwordIsValid) {
          return null;
        }

        const membership = user.workspaceMemberships[0];

        if (!membership) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          workspaceId: membership.workspaceId,
          role: membership.role,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.workspaceId = user.workspaceId;
        token.role = user.role;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.workspaceId = token.workspaceId as string;
        session.user.role = token.role as string;
      }

      return session;
    },
  },

  pages: {
    signIn: "/auth/login",
  },
});
