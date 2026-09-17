import { Router } from 'express';
import { 
  getVulnerabilities, 
  applyPatch, 
  scanAsset,
  getHardeningOptions
} from '../controllers/vulnerabilitiesController';

const router = Router();

router.get('/', getVulnerabilities);
router.post('/scan/:assetId', scanAsset);
router.post('/patch', applyPatch);
router.get('/hardening', getHardeningOptions);

export default router;