import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { ForumProvider } from "@/context/ForumContext";
import { ThemeProvider } from "@/context/ThemeContext";
import ForumSidebar from "@/components/ForumSidebar";
import ForumFab from "@/components/ForumFab";
import CaptureMode from "@/components/CaptureMode";

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
    <html lang="id">
      <head>
        <script
          type="module"
          src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js"
          async
        ></script>
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <ForumProvider>
              <CaptureMode />
              {children}
              <ForumSidebar />
              <ForumFab />
            </ForumProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}