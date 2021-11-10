import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../dataLayer/todoAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

//  import { parseUserId } from '../auth/utils'

const todoAccess = new TodoAccess()

export async function getTodosForUser(userId:string): Promise<TodoItem[]> {
  return todoAccess.getAllTodos(userId)
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  uID: string
): Promise<TodoItem> {

  const itemId = uuid.v4()
  return await todoAccess.createTodo({
  userId: uID,
  todoId: itemId,
  createdAt:  new Date().toISOString(),
  name: createTodoRequest.name,
  dueDate: createTodoRequest.dueDate,
  done: false
  })
}
export async function updateTodo(tID:string,
  updateTodoRequest: UpdateTodoRequest,
 uID:string
): Promise<void> {
  const {name,dueDate,done}=updateTodoRequest
   await todoAccess.updateTodo(tID,uID,name,dueDate,done)
}
export async function deleteTodo(tID:string, uID:string
): Promise<void> {
  
   await todoAccess.deleteTodo(tID,uID)
}
export async function createAttachmentPresignedUrl(tID:string, uID:string
): Promise<string> {
  const imgID = uuid.v4()
 return await todoAccess.attachURL(tID,uID,imgID)
}

