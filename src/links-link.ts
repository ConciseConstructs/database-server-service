import { LambdaHandler } from '../lib/classes/lambdahandler/LambdaHandler.class'
import { IResponse } from '../lib/classes/lambdahandler/Response.class'
import { Context, Callback } from 'aws-lambda'
import { ILinkRequest } from '../lib/interfaces/database-server-service-interface/links-link.interface'


export function handler(incomingRequest:ILinkRequest, context:Context, callback:Callback) {

  class HandlerObject extends LambdaHandler {

    protected request:ILinkRequest
    protected response:IResponse


    constructor(incomingRequest:ILinkRequest, context:Context, callback:Callback) {
      super(incomingRequest, context, callback)
    }



        protected hookConstructorPre() {
          this.requiredInputs = ['silo', 'table', 'id', 'foreignTable', 'foreignId', 'accountId']
          this.needsToConnectToDatabase = true
        }








    protected performActions() {
      this.db.update(this.makeAddForeignLinkSyntax()).promise()
        .then(result => {
          console.log('success:', result)
          this.hasSucceeded(result)
        })
        .catch(error => {
          console.log('error:', error)
          this.hasFailed(error)
        })
    }




        private makeAddForeignLinkSyntax() {
          let syntax = {
            TableName: `${ this.request.silo }`,
            Key: { table: `${ this.request.accountId }.${ this.request.table }`, id: this.request.id },
            UpdateExpression: `SET links.#table.#id = :value`,
            ExpressionAttributeNames: {
              "#table": this.request.foreignTable,
              "#id": this.request.foreignId
            },
            ExpressionAttributeValues: { ":value": null }
          }
          console.log('syntax:', syntax)
          return syntax
        }


  } // End Handler Class ---------

  new HandlerObject(incomingRequest, context, callback)

} // End Main Handler Function -------
