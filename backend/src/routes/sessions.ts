import { Router } from 'express';
import { createSession, getSession, getAllSessions, updateSession } from '../controllers/sessionsController';

const router = Router();

router.post('/', createSession);
router.get('/', getAllSessions);
router.get('/:id', getSession);
router.patch('/:id', updateSession);

export default router;