import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { registerValidation, loginValidation } from '../middlewares/validation.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', registerValidation, AuthController.register);
router.post('/verify-email', AuthController.verifyEmail);
router.post('/authenticate', loginValidation, AuthController.authenticate);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/revoke-token', authMiddleware, AuthController.revokeToken);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/validate-reset-token', AuthController.validateResetToken);
router.post('/reset-password', AuthController.resetPassword);
router.post('/authenticate-2fa', AuthController.authenticate2FA);
export default router;