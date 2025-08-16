import { Router } from 'express';
import { todoController } from '../controllers/todo.controller';

const router = Router();

router.get('/', todoController.getAllTodos.bind(todoController));
router.get('/:id', todoController.getTodoById.bind(todoController));
router.post('/', todoController.createTodo.bind(todoController));
router.put('/:id', todoController.updateTodo.bind(todoController));
router.delete('/:id', todoController.deleteTodo.bind(todoController));

export { router as todosRouter };