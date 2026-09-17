import { Router } from 'express';
import { getAllAssets, getAssetById, updateAssetSecurity } from '../controllers/assetsController';

const router = Router();

router.get('/', getAllAssets);
router.get('/:id', getAssetById);
router.patch('/:id/security', updateAssetSecurity);

export default router;