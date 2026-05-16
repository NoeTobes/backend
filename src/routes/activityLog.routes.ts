import { Router } from 'express';
import { ActivityLogController } from '../controllers/activityLog.controller';
import { authMiddleware, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

// All activity log routes require Admin access
router.use(authMiddleware, authorizeRoles('Admin'));

router.get('/', ActivityLogController.getAll);
router.get('/recent', ActivityLogController.getRecent);
router.get('/actions', ActivityLogController.getActions);
router.get('/user/:userId', ActivityLogController.getByUser);
router.delete('/clear-old', ActivityLogController.clearOldLogs);

export default router;