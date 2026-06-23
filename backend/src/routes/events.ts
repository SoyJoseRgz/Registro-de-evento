import { Router } from 'express';
import { getAll, getBySlugOrId, create, update, remove } from '../controllers/eventController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { validate } from '../middleware/validate';
import { createEventSchema, updateEventSchema } from '../validations/event.schema';

const router = Router({ mergeParams: true });

router.get('/', getAll);
router.get('/:slug', getBySlugOrId);
router.post('/', authenticate, requireRole('admin', 'organizer'), validate(createEventSchema), create);
router.put('/:id', authenticate, requireRole('admin', 'organizer'), validate(updateEventSchema), update);
router.delete('/:id', authenticate, requireRole('admin'), remove);

export default router;