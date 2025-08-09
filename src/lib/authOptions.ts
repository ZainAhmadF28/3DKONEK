import type { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'email', type: 'text' },
        password: { label: 'password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Data tidak valid');
        }

        const userFromDb = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!userFromDb || !userFromDb?.password) {
          throw new Error('User tidak ditemukan');
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          userFromDb.password
        );

        if (!isCorrectPassword) {
          throw new Error('Password salah');
        }

        return {
          id: userFromDb.id,
          name: userFromDb.name ?? undefined,
          email: userFromDb.email ?? undefined,
          role: userFromDb.role as 'ADMIN' | 'UMUM' | 'DESAINER',
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as number;
        token.role = user.role as 'ADMIN' | 'UMUM' | 'DESAINER';
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as number;
        session.user.role = token.role as 'ADMIN' | 'UMUM' | 'DESAINER';
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === 'development',
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
};


