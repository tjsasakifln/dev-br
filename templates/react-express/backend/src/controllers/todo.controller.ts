import { Request, Response } from 'express';
import { todoService } from '../services/todo.service';

export class TodoController {
  async getAllTodos(req: Request, res: Response) {
    try {
      const todos = todoService.getAllTodos();
      res.json(todos);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getTodoById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const todo = todoService.getTodoById(id);
      
      if (!todo) {
        return res.status(404).json({ error: 'Todo not found' });
      }
      
      res.json(todo);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createTodo(req: Request, res: Response) {
    try {
      const { text } = req.body;
      
      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return res.status(400).json({ error: 'Text is required and must be a non-empty string' });
      }
      
      const todo = todoService.createTodo(text.trim());
      res.status(201).json(todo);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateTodo(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { text, completed } = req.body;
      
      const updates: any = {};
      
      if (text !== undefined) {
        if (typeof text !== 'string' || text.trim().length === 0) {
          return res.status(400).json({ error: 'Text must be a non-empty string' });
        }
        updates.text = text.trim();
      }
      
      if (completed !== undefined) {
        if (typeof completed !== 'boolean') {
          return res.status(400).json({ error: 'Completed must be a boolean' });
        }
        updates.completed = completed;
      }
      
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'At least one field (text or completed) must be provided' });
      }
      
      const updatedTodo = todoService.updateTodo(id, updates);
      
      if (!updatedTodo) {
        return res.status(404).json({ error: 'Todo not found' });
      }
      
      res.json(updatedTodo);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async deleteTodo(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = todoService.deleteTodo(id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Todo not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const todoController = new TodoController();