/*
  Dev-only: fix legacy role values after enum change Role.USER -> UserRole.UMUM
*/
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const result = await prisma.$executeRawUnsafe("UPDATE User SET role = 'UMUM' WHERE role = 'USER'");
    console.log('Rows updated:', result);
  } catch (e) {
    console.error('Failed updating roles:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();


