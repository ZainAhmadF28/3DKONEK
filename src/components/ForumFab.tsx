'use client';

import { FaComments } from 'react-icons/fa';
import { useForum } from '@/context/ForumContext';

const ForumFab = () => {
  const { isForumOpen, openForum } = useForum();

  if (isForumOpen) return null;

  return (
    <button
      type="button"
      aria-label="Buka Forum"
      onClick={openForum}
      className="fixed bottom-6 right-6 z-[60] h-14 w-14 rounded-full shadow-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center"
    >
      <FaComments size={22} />
    </button>
  );
};

export default ForumFab;


