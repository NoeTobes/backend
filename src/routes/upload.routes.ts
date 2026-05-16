import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/profile-picture', authMiddleware, UploadController.uploadProfilePicture, UploadController.handleUpload);

export default router;