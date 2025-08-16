import { Router } from 'express';
import { projectService } from '../services/project.service';
import { asyncHandler } from '../middleware/asyncHandler';
import { generationQueue } from '../lib/queue';
import { githubService } from '../services/github.service';

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

router.post('/:id/feedback', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating, feedback } = req.body;
  
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }
  
  const project = await projectService.getProjectById(id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  if (project.status !== 'COMPLETED') {
    return res.status(400).json({ error: 'Can only provide feedback for completed projects' });
  }
  
  if (project.userRating) {
    return res.status(400).json({ error: 'Feedback has already been provided for this project' });
  }
  
  const updatedProject = await projectService.updateProject(id, { 
    userRating: rating,
    userFeedback: feedback || null
  });
  
  res.status(200).json(updatedProject);
}));

router.post('/:id/publish', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { accessToken } = req.body;
  
  if (!accessToken) {
    return res.status(400).json({ error: 'GitHub access token is required' });
  }
  
  const project = await projectService.getProjectById(id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  if (project.status !== 'COMPLETED') {
    return res.status(400).json({ error: 'Project must be completed before publishing' });
  }
  
  if (project.repositoryUrl) {
    return res.status(400).json({ error: 'Project has already been published' });
  }
  
  if (!project.generatedCode) {
    return res.status(400).json({ error: 'No generated code found for this project' });
  }
  
  try {
    const result = await githubService.publishProject({
      accessToken,
      projectName: project.name,
      generatedCode: project.generatedCode as Record<string, any>,
    });
    
    const updatedProject = await projectService.updateProject(id, { 
      repositoryUrl: result.repositoryUrl 
    });
    
    res.status(200).json({
      ...updatedProject,
      repositoryName: result.repositoryName,
    });
  } catch (error) {
    console.error('Error publishing project:', error);
    res.status(500).json({ 
      error: 'Failed to publish project to GitHub',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

export default router;