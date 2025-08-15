import { Router } from 'express';
import { generationService } from './generations.service';
import { asyncHandler } from '../../../middleware/asyncHandler';

const router = Router();

router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const generation = await generationService.getGenerationById(id);

  if (!generation) {
    return res.status(404).json({ error: 'Generation not found' });
  }
  
  res.status(200).json(generation);
}));

export default router;