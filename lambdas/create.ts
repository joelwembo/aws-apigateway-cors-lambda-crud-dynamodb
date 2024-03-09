import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const TABLE_NAME = process.env.TABLE_NAME || 'productstable';
const PRIMARY_KEY = process.env.PRIMARY_KEY || 'id';

const db = new AWS.DynamoDB.DocumentClient();



export const handler = async (event: any = {}): Promise<any> => {

  if (!event.body) {
    return { statusCode: 400, body: 'invalid request, you are missing the parameter bodyvvv' };
  }
  const item = typeof event.body == 'object' ? event.body : JSON.parse(event.body);
  item[PRIMARY_KEY] = uuidv4();
  const params = {
    TableName: TABLE_NAME,
    Item: item
  };

  try {
    await db.put(params).promise();
    return { statusCode: 201, body: 'c' };
  } catch (errorResponse) {
    // const errorResponse = error.code === 'ValidationException' && error.message.includes('reserved keyword') ?
    //   RESERVED_RESPONSE : DYNAMODB_EXECUTION_ERROR;
    return { statusCode: 500, body: errorResponse };
  }
};
