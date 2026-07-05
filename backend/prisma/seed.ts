import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo' },
    update: {},
    create: {
      name: 'Demo Company',
      slug: 'demo',
      config: '{}',
    },
  });
  console.log('Tenant created:', tenant.name);

  // Create admin user
  const passwordHash = await bcrypt.hash('Rodriguez010020#', 12);
  const admin = await prisma.user.upsert({
    where: { id: 'admin-001' },
    update: {
      email: 'joserodriguez@hnet.com.mx',
      passwordHash,
      name: 'Admin User',
    },
    create: {
      id: 'admin-001',
      tenantId: tenant.id,
      email: 'joserodriguez@hnet.com.mx',
      passwordHash,
      name: 'Admin User',
      role: 'admin',
    },
  });
  console.log('Admin user created:', admin.email);

  // Create sample event
  const event = await prisma.event.upsert({
    where: { id: 'event-001' },
    update: {
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000),
    },
    create: {
      id: 'event-001',
      tenantId: tenant.id,
      title: 'Conferencia Tech 2024',
      slug: 'conferencia-tech-2024',
      description: 'Una conferencia sobre las ultimas tendencias en tecnologia',
      eventType: 'conference',
      location: 'Centro de Convenciones',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000),
      capacity: 100,
      status: 'published',
      createdBy: admin.id,
    },
  });
  console.log('Event created:', event.title);

  console.log('Seeding complete!');
  console.log('---');
  console.log('Login credentials:');
  console.log('  Email: joserodriguez@hnet.com.mx');
  console.log('  Password: Rodriguez010020#');
  console.log('  Tenant slug: demo');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });