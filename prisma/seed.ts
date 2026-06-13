import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../src/generated/prisma/client.js';
import { auth } from '../src/lib/auth.js';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  const user = {
    name: 'Admin',
    email: 'admin@example.com',
    password: 'RycbarmOswin1043',
  };

  const existing = await prisma.user.findUnique({ where: { email: user.email } });
  if (existing) {
    console.log('ℹ️  Admin user already exists, skipping.');
    return;
  }

  await auth.api.signUpEmail({
    body: {
      name: user.name,
      email: user.email,
      password: user.password,
    },
  });

  await prisma.user.update({
    where: { email: user.email },
    data: { role: 'admin' },
  });

  console.log(`✅ Created admin user (${user.email} / ${user.password})`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
