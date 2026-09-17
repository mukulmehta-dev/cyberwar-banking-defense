import { Router } from 'express';
import {
  startGame,
  nextRound,
  getGameState,
  endGame,
  getScores,
  triggerRandomAttack
} from '../controllers/gameController';

const router = Router();

router.post('/start', startGame);
router.post('/round/next', nextRound);
router.get('/state/:sessionId', getGameState);
router.post('/end', endGame);
router.get('/scores/:sessionId', getScores);
router.post('/attack/trigger', triggerRandomAttack);

export default router;