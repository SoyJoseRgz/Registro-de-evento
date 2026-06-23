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
  const passwordHash = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { id: 'admin-001' },
    update: {},
    create: {
      id: 'admin-001',
      tenantId: tenant.id,
      email: 'admin@demo.com',
      passwordHash,
      name: 'Admin User',
      role: 'admin',
    },
  });
  console.log('Admin user created:', admin.email);

  // Create sample event
  const event = await prisma.event.upsert({
    where: { id: 'event-001' },
    update: {},
    create: {
      id: 'event-001',
      tenantId: tenant.id,
      title: 'Conferencia Tech 2024',
      slug: 'conferencia-tech-2024',
      description: 'Una conferencia sobre las ultimas tendencias en tecnologia',
      eventType: 'conference',
      location: 'Centro de Convenciones',
      startDate: new Date('2024-06-15T09:00:00Z'),
      endDate: new Date('2024-06-15T18:00:00Z'),
      capacity: 100,
      status: 'published',
      createdBy: admin.id,
    },
  });
  console.log('Event created:', event.title);

  console.log('Seeding complete!');
  console.log('---');
  console.log('Login credentials:');
  console.log('  Email: admin@demo.com');
  console.log('  Password: admin123');
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