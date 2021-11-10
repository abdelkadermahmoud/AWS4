import * as AWS  from 'aws-sdk'
// import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
//const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new AWS.S3({
  signatureVersion: 'v4'
})


export class TodoAccess {

  constructor(
    private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly todosIndex = process.env.TODOS_CREATED_AT_INDEX,
    private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,
    private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION) {
  }
  async getAllTodos(userID:string): Promise<TodoItem[]> {
    const result = await this.docClient.query({
      TableName: this.todosTable,
      IndexName:this.todosIndex,
      KeyConditionExpression: 'userID = :ID',
      ExpressionAttributeValues: {
          ':ID': userID
      },
      ScanIndexForward: false
    }).promise()

    return result.Items as TodoItem[]
  }

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
      TableName: this.todosTable,
      Item: todo
    }).promise()

    return todo
  }

  async updateTodo(tID: string , uID : string , name : string, dueDate: string, done: boolean): Promise<void> {
    await this.docClient.update({
      TableName: this.todosTable,
      Key:{
        userId: uID,
        todoId: tID
      },
     UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
     ExpressionAttributeNames: {
      '#name': 'name'
          },
     ExpressionAttributeValues: {
            ':name': name,
            ':dueDate': dueDate,
            ':done': done
          }
    }).promise()
  }
  
  async deleteTodo(tID: string, uID : string): Promise<void> {
    await this.docClient.delete({
      TableName: this.todosTable,
      Key:{
        todoId: tID,
        userId:uID
      }
    }).promise()
  }

  async attachURL(tID: string, uID : string,imgID:string): Promise<string> {

    const signedURL=this.getUploadUrl(imgID)
    const imageLink = `https://${this.bucketName}.s3.amazonaws.com/${imgID}`
    await this.docClient
      .update({
        TableName: this.todosTable,
        Key: {
          todoId : tID,
          userId : uID
        },
        UpdateExpression: 'set attachmentUrl = :imageUrl',
        ExpressionAttributeValues: {
          ':imageUrl': imageLink
        }
      }).promise()
    return signedURL
  }

 getUploadUrl(imageId: string) {
    return s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: imageId,
      Expires: Number(this.urlExpiration)
    })
  }
}



// function createDynamoDBClient() {
//   if (process.env.IS_OFFLINE) {
//     console.log('Creating a local DynamoDB instance')
//     return new XAWS.DynamoDB.DocumentClient({
//       region: 'localhost',
//       endpoint: 'http://localhost:8000'
//     })
//   }

//   return new XAWS.DynamoDB.DocumentClient()
// }

