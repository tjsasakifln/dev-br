import { Router } from 'express';
import { userService } from './users.service';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    const newUser = await userService.createUser(email, name);
    res.status(201).json(newUser);
  } catch (error: any) {
    // Deteta o nosso erro específico e devolve 409
    if (error.message === 'Email already in use.') {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create user' });
  }
});

export default router;