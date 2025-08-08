'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';

// Tipe untuk nilai yang akan disediakan oleh context
interface ForumContextType {
  isForumOpen: boolean;
  openForum: () => void;
  closeForum: () => void;
}

// Buat context dengan nilai default
const ForumContext = createContext<ForumContextType | undefined>(undefined);

// Buat Provider yang akan membungkus aplikasi Anda
export const ForumProvider = ({ children }: { children: ReactNode }) => {
  // =======================================================
  // == PERBAIKAN UTAMA ADA DI SINI: '_' diubah menjadi '=' ==
  // =======================================================
  const [isForumOpen, setIsForumOpen] = useState(false);

  const openForum = () => setIsForumOpen(true);
  const closeForum = () => setIsForumOpen(false);

  return (
    <ForumContext.Provider value={{ isForumOpen, openForum, closeForum }}>
      {children}
    </ForumContext.Provider>
  );
};

// Buat custom hook untuk mempermudah penggunaan context
export const useForum = () => {
  const context = useContext(ForumContext);
  if (context === undefined) {
    throw new Error('useForum must be used within a ForumProvider');
  }
  return context;
};
