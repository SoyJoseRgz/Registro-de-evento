import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { getPrisma } from '../config/database';
import { AuthRequest, generateTokens, verifyRefreshToken } from '../middleware/auth';
import { env } from '../config/env';

export async function login(req: Request, res: Response) {
  try {
    const { email, password, tenantSlug } = req.body;
    const prisma = getPrisma();

    // Find tenant
    let tenant;
    if (tenantSlug) {
      tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
    } else {
      tenant = await prisma.tenant.findFirst();
    }

    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    // Find user
    const user = await prisma.user.findFirst({
      where: { email, tenantId: tenant.id },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const payload = {
      userId: user.id,
      tenantId: user.tenantId,
      role: user.role,
      email: user.email,
    };

    const tokens = generateTokens(payload);

    res.json({
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function register(req: Request, res: Response) {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can create users' });
    }

    const { email, password, name, role } = req.body;
    const prisma = getPrisma();

    // Check if user already exists in this tenant
    const existing = await prisma.user.findFirst({
      where: { email, tenantId: authReq.user.tenantId },
    });

    if (existing) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: role || 'organizer',
        tenantId: authReq.user.tenantId,
      },
    });

    res.status(201).json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function refreshToken(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    const payload = verifyRefreshToken(refreshToken);
    const tokens = generateTokens(payload);

    res.json(tokens);
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
}

export async function me(req: Request, res: Response) {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { id: authReq.user.userId },
      select: { id: true, email: true, name: true, role: true, tenantId: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}