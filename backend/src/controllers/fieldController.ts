import { Request, Response } from 'express';
import { getPrisma } from '../config/database';

export async function getFields(req: Request, res: Response) {
  try {
    const { tenantId } = req.params;
    const prisma = getPrisma();

    const fields = await prisma.registrationField.findMany({
      where: { tenantId },
      orderBy: { displayOrder: 'asc' },
    });

    res.json(fields);
  } catch (error) {
    console.error('Get fields error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createField(req: Request, res: Response) {
  try {
    const { tenantId } = req.params;
    const { fieldName, fieldType, options, isRequired, displayOrder } = req.body;
    const prisma = getPrisma();

    const field = await prisma.registrationField.create({
      data: {
        tenantId,
        fieldName,
        fieldType,
        options: options || null,
        isRequired: isRequired || false,
        displayOrder: displayOrder || 0,
      },
    });

    res.status(201).json(field);
  } catch (error) {
    console.error('Create field error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateField(req: Request, res: Response) {
  try {
    const { tenantId, id } = req.params;
    const prisma = getPrisma();

    const existing = await prisma.registrationField.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Field not found' });
    }

    const field = await prisma.registrationField.update({
      where: { id },
      data: req.body,
    });

    res.json(field);
  } catch (error) {
    console.error('Update field error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteField(req: Request, res: Response) {
  try {
    const { tenantId, id } = req.params;
    const prisma = getPrisma();

    const existing = await prisma.registrationField.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Field not found' });
    }

    await prisma.registrationField.delete({ where: { id } });

    res.json({ message: 'Field deleted' });
  } catch (error) {
    console.error('Delete field error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
