import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { ForumProvider } from "@/context/ForumContext";
import ForumSidebar from "@/components/ForumSidebar";
import ForumFab from "@/components/ForumFab";
import CaptureMode from "@/components/CaptureMode";
import { ThemeProvider } from "@/context/ThemeContext"; // PERUBAHAN: Impor ThemeProvider

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
    <html lang="id" className="dark"> {/* PERUBAHAN: Menambahkan 'dark' sebagai default untuk menghindari FOUC */}
      <head>
        <script
          type="module"
          src="[https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js](https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js)"
          async
        ></script>
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <ForumProvider>
            {/* PERUBAHAN: Membungkus semua konten dengan ThemeProvider */}
            <ThemeProvider>
              <CaptureMode />
              {children}
              <ForumSidebar />
              <ForumFab />
            </ThemeProvider>
          </ForumProvider>
        </AuthProvider>
      </body>
    </html>
  );
}