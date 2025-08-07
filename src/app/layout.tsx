import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider"; // Import provider

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KitaRekayasa",
  description: "Kolaborasi Kita, Rekayasa Bangsa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider> {/* Bungkus children dengan AuthProvider */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}