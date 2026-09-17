import { Router } from 'express';
import { joinGame, getPlayers, updatePlayerScore, leaveGame } from '../controllers/playersController';

const router = Router();

router.post('/join', joinGame);
router.get('/:sessionId', getPlayers);
router.patch('/:id/score', updatePlayerScore);
router.delete('/:id', leaveGame);

export default router;