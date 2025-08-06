import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';

// Perluas tipe data bawaan dari NextAuth
declare module 'next-auth' {
  /**
   * Tipe 'Session' yang dikembalikan oleh `useSession` atau `getSession`.
   * Kita menambahkan `id` dan `role` ke objek `user`.
   */
  interface Session {
    user: {
      id: number;
      role: string; // Menambahkan peran (role) ke sesi
    } & DefaultSession['user']; // Menggabungkan dengan properti default (name, email, image)
  }

  /**
   * Tipe 'User' yang digunakan saat proses otentikasi.
   * Kita memastikan tipe 'id' adalah number.
   */
  interface User extends DefaultUser {
    id: number;
    role: string; // Menambahkan peran (role) ke objek user
  }
}

declare module 'next-auth/jwt' {
  /**
   * Tipe 'JWT' (JSON Web Token) yang di-encode.
   * Kita menambahkan `id` dan `role` ke dalam token.
   */
  interface JWT {
    id: number;
    role: string;
  }
}