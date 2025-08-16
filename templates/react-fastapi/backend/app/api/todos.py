from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime
from app.models import Todo, TodoCreate, TodoUpdate

router = APIRouter()

# Armazenamento em memória (será substituído por BD real)
todos_db: List[Todo] = []
next_id = 1

@router.get("/todos", response_model=List[Todo])
def get_todos():
    return todos_db

@router.post("/todos", response_model=Todo)
def create_todo(todo: TodoCreate):
    global next_id
    new_todo = Todo(
        id=next_id,
        title=todo.title,
        description=todo.description,
        completed=False,
        created_at=datetime.now()
    )
    todos_db.append(new_todo)
    next_id += 1
    return new_todo

@router.put("/todos/{todo_id}", response_model=Todo)
def update_todo(todo_id: int, todo_update: TodoUpdate):
    for idx, todo in enumerate(todos_db):
        if todo.id == todo_id:
            update_data = todo_update.dict(exclude_unset=True)
            updated_todo = todo.copy(update=update_data)
            todos_db[idx] = updated_todo
            return updated_todo
    raise HTTPException(status_code=404, detail="Todo not found")

@router.delete("/todos/{todo_id}")
def delete_todo(todo_id: int):
    for idx, todo in enumerate(todos_db):
        if todo.id == todo_id:
            del todos_db[idx]
            return {"message": "Todo deleted successfully"}
    raise HTTPException(status_code=404, detail="Todo not found")