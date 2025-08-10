import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { ForumProvider } from "@/context/ForumContext";
import ForumSidebar from "@/components/ForumSidebar";
import ForumFab from "@/components/ForumFab";
import CaptureMode from "@/components/CaptureMode";
// HAPUS: Impor ThemeProvider tidak lagi dibutuhkan
// import { ThemeProvider } from "@/context/ThemeContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "3DKONEK",
  description: "Kolaborasi Kita, Rekayasa Bangsa",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Kelas "dark" di sini akan membuat mode gelap menjadi default permanen
    <html lang="id" className="dark">
      <head>
        <script
          type="module"
          src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js"
          async
        ></script>
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <ForumProvider>
            {/* HAPUS: Komponen <ThemeProvider> telah dihapus */}
            <CaptureMode />
            {children}
            <ForumSidebar />
            <ForumFab />
          </ForumProvider>
        </AuthProvider>
      </body>
    </html>
  );
}