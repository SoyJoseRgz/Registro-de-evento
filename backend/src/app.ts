import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter';
import authRoutes from './routes/auth';
import eventRoutes from './routes/events';
import { getPublicBySlug } from './controllers/eventController';
import registrationRoutes from './routes/registrations';
import checkinRoutes from './routes/checkin';
import reportRoutes from './routes/reports';
import fieldRoutes from './routes/fields';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(generalLimiter);

// Health check
app.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public routes (no auth needed)
app.get('/api/v1/events/public/:slug', getPublicBySlug);
app.get('/api/v1/events/public/:eventId/fields', async (req, res) => {
  try {
    const { eventId } = req.params;
    const prisma = (await import('./config/database')).getPrisma();
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    const fields = await prisma.registrationField.findMany({
      where: { tenantId: event.tenantId },
      orderBy: { displayOrder: 'asc' },
    });
    res.json(fields);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tenants/:tenantId/events', eventRoutes);
app.use('/api/v1/tenants/:tenantId/registrations', registrationRoutes);
app.use('/api/v1/tenants/:tenantId/events/:eventId/registrations', registrationRoutes);
app.use('/api/v1/tenants/:tenantId/checkin', checkinRoutes);
app.use('/api/v1/tenants/:tenantId/events/:eventId/checkins', checkinRoutes);
app.use('/api/v1/tenants/:tenantId/events/:eventId/report', reportRoutes);
app.use('/api/v1/tenants/:tenantId/events/:eventId/export', reportRoutes);
app.use('/api/v1/tenants/:tenantId/fields', fieldRoutes);

// Error handler
app.use(errorHandler);

export default app;
