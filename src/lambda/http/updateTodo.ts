import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateTodo } from '../../businessLogic/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const updatedT: UpdateTodoRequest = JSON.parse(event.body)
    const uID=getUserId(event)
    // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
    await updateTodo(todoId , updatedT , uID)

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: "Success"
    }

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
}
)
