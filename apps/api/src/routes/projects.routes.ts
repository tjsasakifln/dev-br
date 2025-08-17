import { Router } from 'express';
import { projectService } from '../services/project.service';
import { asyncHandler } from '../middleware/asyncHandler';
import { generationQueue } from '../lib/queue';
import { githubService } from '../services/github.service';
import { upload } from '../middleware/upload';
import { generationRateLimit } from '../middleware/rateLimiter';
import { protect } from '../middleware/auth.middleware';
import archiver from 'archiver';

const router = Router();

router.post('/', protect, asyncHandler(async (req, res) => {
  const { name, prompt } = req.body;
  const userId = (req as any).user.id;
  
  if (!name || !prompt) {
    return res.status(400).json({ error: 'name and prompt are required' });
  }
  
  const project = await projectService.createProject({ name, prompt, userId });
  res.status(201).json(project);
}));

router.get('/', protect, asyncHandler(async (req, res) => {
  const userId = (req as any).user.id;
  
  const projects = await projectService.getProjectsByUserId(userId);
  res.status(200).json(projects);
}));

router.get('/:id', protect, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = (req as any).user.id;
  const project = await projectService.getProjectById(id);

  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  // Verify project ownership
  if (project.userId !== userId) {
    return res.status(403).json({ error: 'Access denied - not your project' });
  }
  
  res.status(200).json(project);
}));

router.post('/:id/generate', protect, generationRateLimit, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = (req as any).user.id;
  
  // Usar o cliente Prisma para encontrar o projeto, garantindo que pertence ao userId
  const project = await projectService.getProjectById(id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  // Verificar se o projeto pertence ao usuário
  if (project.userId !== userId) {
    return res.status(403).json({ error: 'Access denied - not your project' });
  }
  
  // Atualizar o status do projeto para QUEUED
  await projectService.updateProject(id, { status: 'QUEUED' });
  
  // Adicionar trabalho à fila com nome 'start-generation'
  await generationQueue.add('start-generation', { 
    projectId: id, 
    userId: userId 
  });
  
  // Resposta HTTP 202 Accepted com mensagem de sucesso
  res.status(202).json({ 
    message: 'Project generation has been queued.' 
  });
}));

router.get('/:id/generations/latest', protect, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = (req as any).user.id;
  
  // Verify project ownership first
  const project = await projectService.getProjectById(id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  if (project.userId !== userId) {
    return res.status(403).json({ error: 'Access denied - not your project' });
  }
  
  const latestGeneration = await projectService.getLatestGeneration(id);

  if (!latestGeneration) {
    return res.status(404).json({ error: 'No generations found for this project' });
  }
  
  res.status(200).json(latestGeneration);
}));

router.post('/:id/feedback', protect, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating, feedback } = req.body;
  const userId = (req as any).user.id;
  
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }
  
  const project = await projectService.getProjectById(id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  // Verify project ownership
  if (project.userId !== userId) {
    return res.status(403).json({ error: 'Access denied - not your project' });
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

router.post('/:id/publish', protect, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { accessToken } = req.body;
  const userId = (req as any).user.id;
  
  if (!accessToken) {
    return res.status(400).json({ error: 'GitHub access token is required' });
  }
  
  const project = await projectService.getProjectById(id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  // Verify project ownership
  if (project.userId !== userId) {
    return res.status(403).json({ error: 'Access denied - not your project' });
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

router.get('/:id/download', protect, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = (req as any).user.id;
  
  const project = await projectService.getProjectById(id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  // Verify project ownership
  if (project.userId !== userId) {
    return res.status(403).json({ error: 'Access denied - not your project' });
  }
  
  if (project.status !== 'COMPLETED') {
    return res.status(400).json({ error: 'Project must be completed before downloading' });
  }
  
  if (!project.generatedCode) {
    return res.status(400).json({ error: 'No generated code found for this project' });
  }
  
  // Set response headers for zip download
  const fileName = `${project.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}.zip`;
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  
  // Create archive
  const archive = archiver('zip', {
    zlib: { level: 9 } // Maximum compression
  });
  
  // Handle archive errors
  archive.on('error', (err) => {
    console.error('Archive error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to create archive' });
    }
  });
  
  // Pipe archive to response
  archive.pipe(res);
  
  // Helper function to add files from generated code object
  const addFilesToArchive = (obj: any, currentPath = '') => {
    for (const [key, value] of Object.entries(obj)) {
      const filePath = currentPath ? `${currentPath}/${key}` : key;
      
      if (typeof value === 'string') {
        // It's a file
        archive.append(value, { name: filePath });
      } else if (typeof value === 'object' && value !== null) {
        // It's a directory, recurse
        addFilesToArchive(value, filePath);
      }
    }
  };
  
  // Add all files from generated code
  addFilesToArchive(project.generatedCode as Record<string, any>);
  
  // Finalize the archive
  await archive.finalize();
}));

router.post('/:id/upload', protect, upload.single('file'), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = (req as any).user.id;
  
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const project = await projectService.getProjectById(id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  // Verify project ownership
  if (project.userId !== userId) {
    return res.status(403).json({ error: 'Access denied - not your project' });
  }
  
  // Update project with uploaded file path
  const updatedProject = await projectService.updateProject(id, {
    uploadedFile: req.file.path
  });
  
  res.status(200).json({
    message: 'File uploaded successfully',
    fileName: req.file.filename,
    filePath: req.file.path,
    project: updatedProject
  });
}));

export default router;