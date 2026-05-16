import { Router } from 'express';
import { TwoFactorController } from '../controllers/twoFactor.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/setup', authMiddleware, TwoFactorController.setup);
router.post('/enable', authMiddleware, TwoFactorController.enable);
router.post('/disable', authMiddleware, TwoFactorController.disable);
router.post('/verify', TwoFactorController.verify);
router.get('/status', authMiddleware, TwoFactorController.getStatus);

export default router;