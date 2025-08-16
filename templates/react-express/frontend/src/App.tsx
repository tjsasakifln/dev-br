import { useState, useEffect } from 'react'
import { Todo } from './types/todo'
import { AddTodoForm } from './components/AddTodoForm'
import { TodoList } from './components/TodoList'

function App() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  const fetchTodos = async () => {
    try {
      const response = await fetch('/api/todos')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data: Todo[] = await response.json()
      setTodos(data)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch todos')
    } finally {
      setLoading(false)
    }
  }

  const addTodo = async (text: string) => {
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const newTodo: Todo = await response.json()
      setTodos(prev => [...prev, newTodo])
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add todo')
    }
  }

  const toggleTodo = async (id: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed }),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const updatedTodo: Todo = await response.json()
      setTodos(prev => prev.map(todo => 
        todo.id === id ? updatedTodo : todo
      ))
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update todo')
    }
  }

  const deleteTodo = async (id: string) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      setTodos(prev => prev.filter(todo => todo.id !== id))
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete todo')
    }
  }

  useEffect(() => {
    fetchTodos()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading todos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Todo List
        </h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            Error: {error}
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <AddTodoForm onAdd={addTodo} />
          <TodoList 
            todos={todos} 
            onToggle={toggleTodo} 
            onDelete={deleteTodo} 
          />
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Frontend: React + TypeScript + Vite</p>
          <p>Backend: Express.js + TypeScript</p>
        </div>
      </div>
    </div>
  )
}

export default App