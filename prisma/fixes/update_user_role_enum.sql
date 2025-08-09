-- Map nilai role lama 'USER' ke enum baru 'UMUM'
UPDATE User SET role = 'UMUM' WHERE role = 'USER';

