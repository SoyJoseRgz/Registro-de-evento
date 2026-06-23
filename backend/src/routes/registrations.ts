import { Router } from 'express';
import { 
  getRegistrations, 
  registerAttendee, 
  getRegistration, 
  updateRegistration, 
  cancelRegistration,
  cancelByToken
} from '../controllers/registrationController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { validate } from '../middleware/validate';
import { registerAttendeeSchema, updateRegistrationSchema } from '../validations/registration.schema';

const router = Router({ mergeParams: true });

router.get('/', authenticate, requireRole('admin', 'organizer'), getRegistrations);
router.post('/register', validate(registerAttendeeSchema), registerAttendee);
router.get('/:id', authenticate, getRegistration);
router.put('/:id', authenticate, validate(updateRegistrationSchema), updateRegistration);
router.delete('/:id', authenticate, cancelRegistration);
router.post('/cancel/:token', cancelByToken);

export default router;
