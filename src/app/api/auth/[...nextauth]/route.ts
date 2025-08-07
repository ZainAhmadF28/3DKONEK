import NextAuth, { AuthOptions } from 'next-auth';
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
      // Fungsi authorize ini adalah titik krusial yang kita perbaiki
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Data tidak valid');
        }

        const userFromDb = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
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

        // =======================================================
        // == INI ADALAH PERBAIKAN KUNCI ==
        // =======================================================
        // Kita tidak mengembalikan `userFromDb` secara langsung.
        // Sebaliknya, kita membuat objek baru yang bersih dan secara eksplisit
        // cocok dengan tipe `User` yang diharapkan oleh NextAuth.
        return {
          id: userFromDb.id,
          name: userFromDb.name,
          email: userFromDb.email,
          role: userFromDb.role, // Secara eksplisit menyertakan 'role'
          // Properti 'image' bersifat opsional, jadi tidak perlu disertakan jika tidak ada.
        };
      },
    }),
  ],
  callbacks: {
    // Callback `jwt` sekarang menerima `user` yang tipenya sudah benar
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as number; // Pastikan 'id' adalah number
        token.role = user.role;
      }
      return token;
    },
    // Callback `session` mengambil data dari token yang sudah benar
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === 'development',
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };