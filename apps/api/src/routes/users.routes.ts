import { Router } from 'express';
import { userService } from '../services/user.service';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.post('/', asyncHandler(async (req, res) => {
  const { email, name } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  const newUser = await userService.createUser(email, name);
  res.status(201).json(newUser);
}));

router.get('/', asyncHandler(async (req, res) => {
  const users = await userService.getUsers();
  res.status(200).json(users);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await userService.getUserById(id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.status(200).json(user);
}));

export default router;