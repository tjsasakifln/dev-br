import { Router } from 'express';
import { streamGenerationProgress } from '../../controllers/generation.controller';

const router = Router();

router.route('/:id/stream').get(streamGenerationProgress);

export default router;