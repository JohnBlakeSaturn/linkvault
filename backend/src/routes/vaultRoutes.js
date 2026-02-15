import { Router } from 'express';
import {
  createVaultItem,
  deleteMyItem,
  downloadVaultFile,
  getVaultItem,
  listMyItems
} from '../controllers/vaultController.js';
import { ensureAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.post('/', upload.single('file'), createVaultItem);
router.get('/mine', ensureAuth, listMyItems);
router.delete('/mine/:id', ensureAuth, deleteMyItem);
router.get('/:token', getVaultItem);
router.get('/:token/download', downloadVaultFile);

export default router;
