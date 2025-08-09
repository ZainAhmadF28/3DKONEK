import { PrismaClient, UserRole, ChallengeStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // 1. Buat atau perbarui user ADMIN
  const adminPassword = await bcrypt.hash('admin123', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {}, // Tidak melakukan apa-apa jika sudah ada
    create: {
      email: 'admin@example.com',
      name: 'Admin KitaRekayasa',
      password: adminPassword,
      role: UserRole.ADMIN,
    },
  });
  console.log(`Upserted admin user with id: ${adminUser.id}`);

  // Tambah admin 3DKONEK (permintaan user)
  const admin2Password = await bcrypt.hash('admin3Dkonek', 12);
  const admin2 = await prisma.user.upsert({
    where: { email: 'admin3DKonek@gmail.com' },
    update: {},
    create: {
      email: 'admin3DKonek@gmail.com',
      name: 'admin',
      password: admin2Password,
      role: UserRole.ADMIN,
    },
  });
  console.log(`Upserted admin 3DKONEK with id: ${admin2.id}`);

  // 2. Buat atau perbarui user BIASA
  const userPassword = await bcrypt.hash('password123', 12);
  const regularUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'User Contoh',
      password: userPassword,
      role: UserRole.UMUM,
    },
  });
  console.log(`Upserted regular user with id: ${regularUser.id}`);

  // 3. Hapus tantangan lama untuk menghindari duplikat
  await prisma.challengeImage.deleteMany();
  await prisma.challenge.deleteMany();
  console.log('Deleted old challenges and images.');

  // 4. Buat data tantangan baru yang terhubung dengan user admin
  const challenge = await prisma.challenge.create({
    data: {
      title: "Desain Ulang Roda Gigi Reducer",
      category: "Gear & Transmisi",
      description: "Mesin penggiling tebu produksi lama membutuhkan desain roda gigi pengganti karena komponen asli sudah tidak diproduksi dan sering aus.",
      reward: 2000000,
      deadline: new Date("2025-12-31T00:00:00Z"),
      challengerId: adminUser.id,
      status: ChallengeStatus.OPEN, // <-- PERBAIKAN: Gunakan Enum bukan string "Open"
      images: {
        create: [
          { url: '/images/challenges/gear-reducer.jpg' },
        ]
      }
    }
  });
  console.log(`Created challenge with id: ${challenge.id}`);
  
  const challenge2 = await prisma.challenge.create({
    data: {
      title: "Modul Kontrol Mesin CNC Jadul",
      category: "Komponen Mesin",
      description: "Mencari solusi untuk modul kontrol mesin CNC yang rusak dengan alternatif lokal yang lebih terjangkau.",
      reward: 3500000,
      deadline: new Date("2026-01-15T00:00:00Z"),
      challengerId: adminUser.id,
      status: ChallengeStatus.OPEN, // <-- PERBAIKAN: Gunakan Enum bukan string "Open"
      images: {
        create: [
            { url: '/images/challenges/cnc-module.jpg' },
        ]
      }
    }
  });
  console.log(`Created challenge with id: ${challenge2.id}`);


  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
