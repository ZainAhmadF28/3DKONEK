import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { ForumProvider } from "@/context/ForumContext"; // 1. Import Provider
import ForumSidebar from "@/components/ForumSidebar"; // 2. Import Sidebar

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
    <html lang="id">
      <head>
        {/* Script untuk Google <model-viewer> */}
        <script
          type="module"
          src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js"
          async
        ></script>
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {/* 3. Bungkus semua dengan ForumProvider */}
          <ForumProvider>
            {children}
            {/* 4. Render Sidebar */}
            <ForumSidebar />
          </ForumProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
