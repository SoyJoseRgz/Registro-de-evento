import { Router } from 'express';
import { whaconnectEvents, whaconnectLookup, whaconnectRegister } from '../controllers/whaconnectController';

const router = Router();

router.get('/events', whaconnectEvents);
router.get('/lookup', whaconnectLookup);
router.get('/register', whaconnectRegister);

export default router;
