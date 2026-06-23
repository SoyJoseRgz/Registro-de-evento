import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { getPrisma } from '../config/database';
import { verifyQRToken } from '../services/qrService';

const router = Router({ mergeParams: true });

router.post('/', authenticate, requireRole('admin', 'organizer'), async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { qrToken, registrationId } = req.body;
    const prisma = getPrisma();
    const authReq = req as any;

    let registration;

    if (qrToken) {
      const decoded = verifyQRToken(qrToken);
      if (!decoded) {
        return res.status(400).json({ error: 'Invalid or expired QR code' });
      }

      registration = await prisma.registration.findFirst({
        where: { id: decoded.registrationId, tenantId: decoded.tenantId },
      });
    } else if (registrationId) {
      registration = await prisma.registration.findFirst({
        where: { id: registrationId, tenantId },
      });
    } else {
      return res.status(400).json({ error: 'QR token or registration ID required' });
    }

    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    if (registration.status === 'cancelled') {
      return res.status(400).json({ error: 'Registration is cancelled' });
    }

    if (registration.status === 'checked_in') {
      return res.status(400).json({ error: 'Already checked in' });
    }

    await prisma.checkIn.create({
      data: {
        registrationId: registration.id,
        eventId: registration.eventId,
        checkedInBy: authReq.user.userId,
        method: qrToken ? 'qr' : 'manual',
      },
    });

    await prisma.registration.update({
      where: { id: registration.id },
      data: { status: 'checked_in', checkedInAt: new Date() },
    });

    res.json({ message: 'Check-in successful', registration });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', authenticate, requireRole('admin', 'organizer'), async (req, res) => {
  try {
    const { tenantId, eventId } = req.params;
    const prisma = getPrisma();

    const checkins = await prisma.checkIn.findMany({
      where: { eventId, registration: { tenantId } },
      include: { registration: true },
      orderBy: { checkedInAt: 'desc' },
    });

    res.json(checkins);
  } catch (error) {
    console.error('Get checkins error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
