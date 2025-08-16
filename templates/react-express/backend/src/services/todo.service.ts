export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

class TodoService {
  private todos: Todo[] = [];
  private nextId = 1;

  getAllTodos(): Todo[] {
    return this.todos;
  }

  getTodoById(id: string): Todo | undefined {
    return this.todos.find(todo => todo.id === id);
  }

  createTodo(text: string): Todo {
    const todo: Todo = {
      id: this.nextId.toString(),
      text,
      completed: false,
      createdAt: new Date()
    };
    this.nextId++;
    this.todos.push(todo);
    return todo;
  }

  updateTodo(id: string, updates: Partial<Pick<Todo, 'text' | 'completed'>>): Todo | null {
    const todoIndex = this.todos.findIndex(todo => todo.id === id);
    if (todoIndex === -1) {
      return null;
    }

    this.todos[todoIndex] = {
      ...this.todos[todoIndex],
      ...updates
    };

    return this.todos[todoIndex];
  }

  deleteTodo(id: string): boolean {
    const todoIndex = this.todos.findIndex(todo => todo.id === id);
    if (todoIndex === -1) {
      return false;
    }

    this.todos.splice(todoIndex, 1);
    return true;
  }
}

export const todoService = new TodoService();