import { Request, Response } from 'express';
import { getPrisma } from '../config/database';
import { generateQRCode } from '../services/qrService';
import { sendRegistrationConfirmation } from '../services/whaconnectService';

export async function whaconnectEvents(req: Request, res: Response) {
  try {
    const tenantId = req.query.tenantId as string;

    if (!tenantId) {
      return res.status(400).json({ success: false, message: 'tenantId es requerido' });
    }

    const prisma = getPrisma();

    const events = await prisma.event.findMany({
      where: {
        tenantId,
        status: 'published',
        endDate: { gte: new Date() },
      },
      select: {
        slug: true,
        title: true,
        description: true,
        startDate: true,
        endDate: true,
        location: true,
        capacity: true,
        eventType: true,
      },
      orderBy: { startDate: 'asc' },
    });

    res.json({ success: true, events });
  } catch (error) {
    console.error('Whaconnect events error:', error);
    res.status(500).json({ success: false, message: 'Error al obtener eventos' });
  }
}

export async function whaconnectLookup(req: Request, res: Response) {
  try {
    const tenantId = req.query.tenantId as string;
    const data = (req.query.data as string || '').trim();

    if (!tenantId) {
      return res.status(400).json({ success: false, message: 'tenantId es requerido' });
    }

    if (!data) {
      return res.status(400).json({ success: false, message: 'data es requerido (email o teléfono)' });
    }

    const prisma = getPrisma();

    const row = await prisma.registration.findFirst({
      where: {
        tenantId,
        status: { not: 'cancelled' },
        OR: [
          { attendeeEmail: { equals: data } },
          { attendeePhone: { equals: data } },
        ],
      },
      include: { event: true },
    });

    if (!row) {
      return res.json({ success: false, message: 'No se encontró ningún registro con ese email o teléfono' });
    }

    res.json({
      success: true,
      registration: {
        name: row.attendeeName,
        email: row.attendeeEmail,
        phone: row.attendeePhone,
        event: row.event.title,
        date: row.event.startDate,
        location: row.event.location,
        status: row.status,
        registeredAt: row.registeredAt,
      },
    });
  } catch (error) {
    console.error('Whaconnect lookup error:', error);
    res.status(500).json({ success: false, message: 'Error al consultar registro' });
  }
}

export async function whaconnectRegister(req: Request, res: Response) {
  try {
    const tenantId = req.query.tenantId as string;
    const raw = (req.query.data as string || '').split(',').map(s => s.trim());
    const [name, email, phone, eventSlug] = raw;

    if (!tenantId) {
      return res.status(400).json({ success: false, message: 'tenantId es requerido' });
    }

    if (!name || !email || !phone || !eventSlug) {
      return res.status(400).json({
        success: false,
        message: 'data debe tener formato: nombre,email,telefono,slug_evento',
      });
    }

    const prisma = getPrisma();

    const event = await prisma.event.findFirst({
      where: { slug: eventSlug, tenantId },
    });

    if (!event) {
      return res.json({ success: false, message: 'Evento no encontrado' });
    }

    if (event.status !== 'published') {
      return res.json({ success: false, message: 'El evento no está disponible' });
    }

    if (event.endDate < new Date()) {
      return res.json({ success: false, message: 'El evento ya ha terminado' });
    }

    const registrationCount = await prisma.registration.count({
      where: { eventId: event.id, status: { not: 'cancelled' } },
    });

    if (registrationCount >= event.capacity) {
      return res.json({ success: false, message: 'El evento está lleno' });
    }

    const existing = await prisma.registration.findFirst({
      where: {
        eventId: event.id,
        status: { not: 'cancelled' },
        OR: [
          { attendeeEmail: email },
          { attendeePhone: phone },
        ],
      },
    });

    if (existing) {
      const field = existing.attendeeEmail === email ? 'email' : 'teléfono';
      return res.json({ success: false, message: `Ya estás registrado con ese ${field}` });
    }

    const registration = await prisma.registration.create({
      data: {
        eventId: event.id,
        tenantId,
        attendeeName: name,
        attendeeEmail: email,
        attendeePhone: phone,
        status: 'confirmed',
      },
    });

    const qrCode = await generateQRCode(
      {
        registrationId: registration.id,
        eventId: event.id,
        tenantId,
      },
      event.endDate
    );

    await prisma.registration.update({
      where: { id: registration.id },
      data: { qrCode },
    });

    const eventDate = new Date(event.startDate).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    await sendRegistrationConfirmation(phone, event.title, eventDate);

    res.json({
      success: true,
      message: `Registrado exitosamente en: ${event.title}`,
      qrCode,
    });
  } catch (error) {
    console.error('Whaconnect register error:', error);
    res.status(500).json({ success: false, message: 'Error al registrar' });
  }
}
