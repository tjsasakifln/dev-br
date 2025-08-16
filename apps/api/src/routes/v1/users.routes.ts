import { Router } from 'express';
import { getCurrentUser } from '../../controllers/user.controller';
import { protect } from '../../middleware/auth.middleware';

const router = Router();

// Adicione a rota abaixo
router.get('/me', protect, getCurrentUser);

export default router;