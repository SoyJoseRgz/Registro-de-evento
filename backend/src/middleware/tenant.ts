import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { getPrisma } from '../config/database';

export interface TenantRequest extends AuthRequest {
  tenantId?: string;
}

export async function resolveTenant(req: TenantRequest, res: Response, next: NextFunction): Promise<void> {
  const tenantId = req.params.tenantId;

  if (!tenantId) {
    res.status(400).json({ error: 'Tenant ID required' });
    return;
  }

  const prisma = getPrisma();
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });

  if (!tenant) {
    res.status(404).json({ error: 'Tenant not found' });
    return;
  }

  req.tenantId = tenantId;
  next();
}
