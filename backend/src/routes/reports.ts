import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { getPrisma } from '../config/database';
import { stringify } from 'csv-stringify/sync';

const router = Router({ mergeParams: true });

router.get('/', authenticate, requireRole('admin', 'organizer'), async (req, res) => {
  try {
    const { tenantId, eventId } = req.params;
    const prisma = getPrisma();

    const totalRegistrations = await prisma.registration.count({
      where: { eventId, tenantId, status: { not: 'cancelled' } },
    });

    const checkedIn = await prisma.registration.count({
      where: { eventId, tenantId, status: 'checked_in' },
    });

    const byStatus = await prisma.registration.groupBy({
      by: ['status'],
      where: { eventId, tenantId },
      _count: true,
    });

    const event = await prisma.event.findFirst({
      where: { id: eventId, tenantId },
    });

    res.json({
      event: event ? { id: event.id, title: event.title, capacity: event.capacity } : null,
      totalRegistrations,
      checkedIn,
      attendanceRate: totalRegistrations > 0 ? (checkedIn / totalRegistrations * 100).toFixed(1) : 0,
      byStatus,
    });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/export', authenticate, requireRole('admin', 'organizer'), async (req, res) => {
  try {
    const { tenantId, eventId } = req.params;
    const prisma = getPrisma();

    const registrations = await prisma.registration.findMany({
      where: { eventId, tenantId },
      orderBy: { registeredAt: 'desc' },
    });

    const data = registrations.map(r => ({
      nombre: r.attendeeName,
      email: r.attendeeEmail,
      telefono: r.attendeePhone || '',
      estado: r.status,
      fecha_registro: r.registeredAt.toISOString(),
      fecha_checkin: r.checkedInAt?.toISOString() || '',
    }));

    const csv = stringify(data, {
      header: true,
      columns: ['nombre', 'email', 'telefono', 'estado', 'fecha_registro', 'fecha_checkin'],
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=registrations-${eventId}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
