import { Router } from 'express';
import { getSecurityMeasures, applySecurityMeasure, getBudget, updateBudget } from '../controllers/defenseController';

const router = Router();

router.get('/measures', getSecurityMeasures);
router.post('/measures', applySecurityMeasure);
router.get('/budget/:sessionId', getBudget);
router.post('/budget', updateBudget);

export default router;