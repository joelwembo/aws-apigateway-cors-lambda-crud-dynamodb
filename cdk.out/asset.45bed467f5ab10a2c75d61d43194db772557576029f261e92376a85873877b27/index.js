"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// update-one.ts
var update_one_exports = {};
__export(update_one_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(update_one_exports);
var AWS = __toESM(require("aws-sdk"));
var TABLE_NAME = process.env.TABLE_NAME || "";
var PRIMARY_KEY = process.env.PRIMARY_KEY || "";
var RESERVED_RESPONSE = `Error: You're using AWS reserved keywords as attributes`;
var DYNAMODB_EXECUTION_ERROR = `Error: Execution update, caused a Dynamodb error, please take a look at your CloudWatch Logs.`;
var db = new AWS.DynamoDB.DocumentClient();
var handler = async (event = {}) => {
  if (!event.body) {
    return { statusCode: 400, body: "invalid request, you are missing the parameter body" };
  }
  const editedItemId = event.pathParameters.id;
  if (!editedItemId) {
    return { statusCode: 400, body: "invalid request, you are missing the path parameter id" };
  }
  const editedItem = typeof event.body == "object" ? event.body : JSON.parse(event.body);
  const editedItemProperties = Object.keys(editedItem);
  if (!editedItem || editedItemProperties.length < 1) {
    return { statusCode: 400, body: "invalid request, no arguments provided" };
  }
  const firstProperty = editedItemProperties.splice(0, 1);
  const params = {
    TableName: TABLE_NAME,
    Key: {
      [PRIMARY_KEY]: editedItemId
    },
    UpdateExpression: `set ${firstProperty} = :${firstProperty}`,
    ExpressionAttributeValues: {},
    ReturnValues: "UPDATED_NEW"
  };
  params.ExpressionAttributeValues[`:${firstProperty}`] = editedItem[`${firstProperty}`];
  editedItemProperties.forEach((property) => {
    params.UpdateExpression += `, ${property} = :${property}`;
    params.ExpressionAttributeValues[`:${property}`] = editedItem[property];
  });
  try {
    await db.update(params).promise();
    return { statusCode: 204, body: "" };
  } catch (dbError) {
    const errorResponse = dbError.code === "ValidationException" && dbError.message.includes("reserved keyword") ? RESERVED_RESPONSE : DYNAMODB_EXECUTION_ERROR;
    return { statusCode: 500, body: errorResponse };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
