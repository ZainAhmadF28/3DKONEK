import { DefaultSession, DefaultUser } from 'next-auth';

// Perluas tipe data bawaan dari NextAuth
declare module 'next-auth' {
  /**
   * Tipe 'Session' yang dikembalikan oleh `useSession` atau `getSession`.
   * Kita menambahkan `id` dan `role` ke objek `user`.
   */
  interface Session {
    user: {
      id: number;
      role: 'ADMIN' | 'UMUM' | 'DESAINER';
    } & DefaultSession['user'];
  }

  /**
   * Tipe 'User' yang digunakan saat proses otentikasi.
   * Kita memastikan tipe 'id' adalah number.
   */
  interface User extends DefaultUser {
    id: number;
    role: 'ADMIN' | 'UMUM' | 'DESAINER';
  }
}

declare module 'next-auth/jwt' {
  /**
   * Tipe 'JWT' (JSON Web Token) yang di-encode.
   * Kita menambahkan `id` dan `role` ke dalam token.
   */
  interface JWT {
    id: number;
    role: 'ADMIN' | 'UMUM' | 'DESAINER';
  }
}