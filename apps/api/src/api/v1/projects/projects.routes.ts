import { Router } from 'express';
import { projectService } from './projects.service';
import { asyncHandler } from '../../../middleware/asyncHandler';
import { generationQueue } from '../../../lib/queue';

const router = Router();

router.post('/', asyncHandler(async (req, res) => {
  const { name, prompt, userId } = req.body;
  
  if (!name || !prompt || !userId) {
    return res.status(400).json({ error: 'name, prompt, and userId are required' });
  }
  
  const project = await projectService.createProject({ name, prompt, userId });
  res.status(201).json(project);
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
  
  const project = await projectService.getProjectById(id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  if (project.status !== 'PENDING' && project.status !== 'FAILED') {
    return res.status(400).json({ error: 'Project is not in a state that allows generation' });
  }
  
  await generationQueue.add('generateProject', { projectId: id });
  
  const updatedProject = await projectService.updateProject(id, { status: 'QUEUED' });
  
  res.status(202).json(updatedProject);
}));

router.get('/:id/generations/latest', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const latestGeneration = await projectService.getLatestGeneration(id);

  if (!latestGeneration) {
    return res.status(404).json({ error: 'No generations found for this project' });
  }
  
  res.status(200).json(latestGeneration);
}));

export default router;