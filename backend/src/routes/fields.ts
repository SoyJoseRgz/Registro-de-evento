import { Router } from 'express';
import { getFields, createField, updateField, deleteField } from '../controllers/fieldController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roles';

const router = Router({ mergeParams: true });

router.get('/', authenticate, getFields);
router.post('/', authenticate, requireRole('admin', 'organizer'), createField);
router.put('/:id', authenticate, requireRole('admin', 'organizer'), updateField);
router.delete('/:id', authenticate, requireRole('admin'), deleteField);

export default router;
