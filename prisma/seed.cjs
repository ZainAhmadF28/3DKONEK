/* Minimal seeder in CommonJS to avoid ts-node loader issues */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding admins...');

  const admin1Pw = await bcrypt.hash('admin123', 12);
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin KitaRekayasa',
      password: admin1Pw,
      role: 'ADMIN',
    },
  });

  const admin2Pw = await bcrypt.hash('admin3Dkonek', 12);
  await prisma.user.upsert({
    where: { email: 'admin3DKonek@gmail.com' },
    update: {},
    create: {
      email: 'admin3DKonek@gmail.com',
      name: 'admin',
      password: admin2Pw,
      role: 'ADMIN',
    },
  });

  console.log('Admins ensured.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });


