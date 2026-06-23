import { Request, Response } from 'express';
import { getPrisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    + '-' + Date.now().toString(36);
}

export async function getAll(req: Request, res: Response) {
  try {
    const { tenantId } = req.params;
    const { status, eventType } = req.query;
    const prisma = getPrisma();

    const where: any = { tenantId };
    if (status) where.status = status;
    if (eventType) where.eventType = eventType;

    const events = await prisma.event.findMany({
      where,
      orderBy: { startDate: 'asc' },
      include: { _count: { select: { registrations: true } } },
    });

    res.json(events);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getBySlugOrId(req: Request, res: Response) {
  try {
    const { tenantId, slug } = req.params;
    const prisma = getPrisma();

    const event = await prisma.event.findFirst({
      where: {
        tenantId,
        OR: [{ id: slug }, { slug }],
      },
      include: { _count: { select: { registrations: true } } },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function create(req: Request, res: Response) {
  try {
    const authReq = req as AuthRequest;
    const { tenantId } = req.params;
    const { title, description, eventType, location, startDate, endDate, capacity, status } = req.body;
    const prisma = getPrisma();

    const slug = generateSlug(title);

    const event = await prisma.event.create({
      data: {
        tenantId,
        title,
        slug,
        description,
        eventType,
        location,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        capacity,
        status: status || 'draft',
        createdBy: authReq.user!.userId,
      },
    });

    res.status(201).json(event);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const { tenantId, id } = req.params;
    const prisma = getPrisma();

    const existing = await prisma.event.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const event = await prisma.event.update({
      where: { id },
      data: {
        ...req.body,
        startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
        endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
      },
    });

    res.json(event);
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getPublicBySlug(req: Request, res: Response) {
  try {
    const { slug } = req.params;
    const prisma = getPrisma();

    const event = await prisma.event.findFirst({
      where: { slug, status: 'published' },
      include: { _count: { select: { registrations: true } } },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Get public event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const { tenantId, id } = req.params;
    const prisma = getPrisma();

    const existing = await prisma.event.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Event not found' });
    }

    await prisma.event.delete({ where: { id } });

    res.json({ message: 'Event deleted' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}