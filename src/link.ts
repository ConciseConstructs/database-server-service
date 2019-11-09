import { LambdaHandler } from '../lib/classes/lambdahandler/LambdaHandler.class'
import { IResponse } from '../lib/classes/lambdahandler/Response.class'
import { Context, Callback } from 'aws-lambda'


  export interface IRequest {
    accountId:string
    table:string
    id:string
    foreignTable:string
    foreignId:string
  }


export function handler(incomingRequest:IRequest, context:Context, callback:Callback) {

  class HandlerObject extends LambdaHandler {
    protected request:IRequest
    protected response:IResponse


    constructor(incomingRequest:IRequest, context:Context, callback:Callback) {
      super(incomingRequest, context, callback)
    }



        protected hookConstructorPre() {
          this.requiredInputs = ['accountId', 'id', 'foreignTable', 'foreignId']
          this.needsToConnectToDatabase = true
        }








    protected performActions() {
      this.db.update(this.makeAddForeignLinkSyntax()).promise()
        .then(result => this.hasSucceeded(result))
        .catch(error => this.hasFailed(error))
    }




        private makeAddForeignLinkSyntax() {
          return {
            TableName: `${ process.env.saasName }-${ process.env.stage }`,
            Key: { table: `${ this.request.accountId }.${ this.request.table }`, id: this.request.id },
            UpdateExpression: `SET links.#table.#id = :value`,
            ExpressionAttributeNames: {
              "#table": this.request.foreignTable,
              "#id": this.request.foreignId
            },
            ExpressionAttributeValues: { ":value": null }
          }
        }


  } // End Handler Class ---------

  new HandlerObject(incomingRequest, context, callback)

} // End Main Handler Function -------
