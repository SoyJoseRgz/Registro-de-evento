import { Request, Response } from 'express';
import { getPrisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { generateQRCode } from '../services/qrService';
import { sendRegistrationConfirmation } from '../services/whaconnectService';

export async function getRegistrations(req: Request, res: Response) {
  try {
    const { tenantId, eventId } = req.params;
    const prisma = getPrisma();

    const registrations = await prisma.registration.findMany({
      where: { tenantId, eventId },
      orderBy: { registeredAt: 'desc' },
    });

    res.json(registrations);
  } catch (error) {
    console.error('Get registrations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function registerAttendee(req: Request, res: Response) {
  try {
    const { tenantId, eventId } = req.params;
    const { attendeeName, attendeeEmail, attendeePhone, customFields } = req.body;
    const prisma = getPrisma();

    const event = await prisma.event.findFirst({
      where: { id: eventId, tenantId },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.status !== 'published') {
      return res.status(400).json({ error: 'Event is not published' });
    }

    if (event.endDate < new Date()) {
      return res.status(400).json({ error: 'Event has already ended' });
    }

    const registrationCount = await prisma.registration.count({
      where: { eventId, status: { not: 'cancelled' } },
    });

    if (registrationCount >= event.capacity) {
      return res.status(400).json({ error: 'Event is at full capacity' });
    }

    const existing = await prisma.registration.findFirst({
      where: {
        eventId,
        status: { not: 'cancelled' },
        OR: [
          { attendeeEmail },
          ...(attendeePhone ? [{ attendeePhone }] : []),
        ],
      },
    });

    if (existing) {
      const field = existing.attendeeEmail === attendeeEmail ? 'email' : 'phone number';
      return res.status(409).json({ error: `Already registered with this ${field}` });
    }

    const registration = await prisma.registration.create({
      data: {
        eventId,
        tenantId,
        attendeeName,
        attendeeEmail,
        attendeePhone,
        customFields: customFields ? JSON.stringify(customFields) : null,
        status: 'confirmed',
      },
    });

    const qrCode = await generateQRCode(
      {
        registrationId: registration.id,
        eventId,
        tenantId,
      },
      event.endDate
    );

    await prisma.registration.update({
      where: { id: registration.id },
      data: { qrCode },
    });

    if (attendeePhone) {
      const eventDate = new Date(event.startDate).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      await sendRegistrationConfirmation(attendeePhone, event.title, eventDate);
    }

    res.status(201).json({
      ...registration,
      qrCode,
    });
  } catch (error) {
    console.error('Register attendee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getRegistration(req: Request, res: Response) {
  try {
    const { tenantId, id } = req.params;
    const prisma = getPrisma();

    const registration = await prisma.registration.findFirst({
      where: { id, tenantId },
      include: { event: true },
    });

    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    res.json(registration);
  } catch (error) {
    console.error('Get registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateRegistration(req: Request, res: Response) {
  try {
    const { tenantId, id } = req.params;
    const authReq = req as AuthRequest;
    const prisma = getPrisma();

    const existing = await prisma.registration.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    if (authReq.user?.role === 'assistant' && existing.attendeeEmail !== authReq.user.email) {
      return res.status(403).json({ error: 'Can only update your own registration' });
    }

    const registration = await prisma.registration.update({
      where: { id },
      data: {
        attendeeName: req.body.attendeeName,
        attendeeEmail: req.body.attendeeEmail,
        attendeePhone: req.body.attendeePhone,
        customFields: req.body.customFields,
      },
    });

    res.json(registration);
  } catch (error) {
    console.error('Update registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function cancelRegistration(req: Request, res: Response) {
  try {
    const { tenantId, id } = req.params;
    const authReq = req as AuthRequest;
    const prisma = getPrisma();

    const existing = await prisma.registration.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    if (authReq.user?.role === 'assistant' && existing.attendeeEmail !== authReq.user.email) {
      return res.status(403).json({ error: 'Can only cancel your own registration' });
    }

    await prisma.registration.update({
      where: { id },
      data: { status: 'cancelled' },
    });

    res.json({ message: 'Registration cancelled' });
  } catch (error) {
    console.error('Cancel registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function cancelByToken(req: Request, res: Response) {
  try {
    const { tenantId, token } = req.params;
    const prisma = getPrisma();

    const jwt = require('jsonwebtoken');
    const { env } = require('../config/env');
    
    let decoded: any;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const registration = await prisma.registration.findFirst({
      where: { id: decoded.registrationId, tenantId },
    });

    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    await prisma.registration.update({
      where: { id: registration.id },
      data: { status: 'cancelled' },
    });

    res.json({ message: 'Registration cancelled successfully' });
  } catch (error) {
    console.error('Cancel by token error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
