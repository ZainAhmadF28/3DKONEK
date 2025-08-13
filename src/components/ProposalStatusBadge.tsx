import React from 'react';
import { useTheme } from '@/context/ThemeContext';

interface Props {
  status: string;
}

const ProposalStatusBadge: React.FC<Props> = ({ status }) => {
  const { theme } = useTheme();
  
  const styles: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: theme === 'light' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
  };
  
  const text: Record<string, string> = {
    PENDING: 'Menunggu',
    APPROVED: 'Disetujui',
    REJECTED: 'Ditolak',
  };

  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      Proposal Anda: {text[status] || 'Tidak Diketahui'}
    </span>
  );
};

export default ProposalStatusBadge;