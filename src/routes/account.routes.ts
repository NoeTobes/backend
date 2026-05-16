import { Router } from 'express';
import { AccountController } from '../controllers/account.controller';
import { authMiddleware, authorizeRoles } from '../middlewares/auth.middleware';
import { updateAccountValidation } from '../middlewares/validation.middleware';

const router = Router();

router.get('/', authMiddleware, authorizeRoles('Admin'), AccountController.getAll);
router.get('/:id', authMiddleware, AccountController.getById);
router.put('/:id', authMiddleware, updateAccountValidation, AccountController.update);
router.delete('/:id', authMiddleware, authorizeRoles('Admin'), AccountController.delete);

export default router;