import { Router } from 'express';
import { projectService } from './projects.service';
import { asyncHandler } from '../../../middleware/asyncHandler';

const router = Router();

router.post('/', asyncHandler(async (req, res) => {
  const { name, prompt, userId } = req.body;
  
  if (!name || !prompt || !userId) {
    return res.status(400).json({ error: 'Missing required fields: name, prompt, userId' });
  }

  const newProject = await projectService.createProject({ name, prompt, userId });
  res.status(201).json(newProject);
}));

router.get('/', asyncHandler(async (req, res) => {
  const { userId } = req.query;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'A valid userId query parameter is required' });
  }
  
  const projects = await projectService.getProjectsByUserId(userId);
  res.status(200).json(projects);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const project = await projectService.getProjectById(id);

  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  res.status(200).json(project);
}));

router.post('/:id/generate', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Verifica se o projeto existe antes de iniciar a geração
  const project = await projectService.getProjectById(id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  const newGeneration = await projectService.startGenerationForProject(id);
  
  res.status(202).json({
    message: 'Generation process started',
    generationId: newGeneration.id,
  });
}));

export default router;