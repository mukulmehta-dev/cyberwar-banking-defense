import { Router } from 'express';
import { getIncidents, createIncident, resolveIncident, getEventLog } from '../controllers/incidentsController';

const router = Router();

router.get('/', getIncidents);
router.post('/', createIncident);
router.post('/:id/resolve', resolveIncident);
router.get('/events/:sessionId', getEventLog);

export default router;