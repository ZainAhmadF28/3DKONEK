import NextAuth from 'next-auth';
import { authOptions as baseAuthOptions } from '@/lib/authOptions';

const handler = NextAuth({
  ...baseAuthOptions,
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };