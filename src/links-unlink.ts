import { LambdaHandler } from '../lib/classes/lambdahandler/LambdaHandler.class'
import { IResponse } from '../lib/classes/lambdahandler/Response.class'
import { Context, Callback } from 'aws-lambda'
import { IUnlinkRequest } from '../lib/interfaces/database-server-service-interface/links.unlink.interface'


export function handler(incomingRequest:IUnlinkRequest, context:Context, callback:Callback) {

  class HandlerObject extends LambdaHandler {

    protected request:IUnlinkRequest
    protected response:IResponse


    constructor(incomingRequest:IUnlinkRequest, context:Context, callback:Callback) {
      super(incomingRequest, context, callback)
    }



        protected hookConstructorPre() {
          this.requiredInputs = ['silo', 'table', 'id', 'foreignTable', 'foreignId', 'accountId']
          this.needsToConnectToDatabase = true
        }








    protected performActions() {
      console.log('performActions')
      this.db.update(this.makeRemoveLinkSyntax()).promise()
        .then(result => {
          console.log('success:', result)
          this.hasSucceeded(result)
        } 
        )
        .catch(error => {
          console.log('failure:', error)
          this.hasFailed(error)
        } 
        )
    }




        private makeRemoveLinkSyntax() {
          let syntax = {
            TableName: `${ this.request.silo }`,
            Key: { table: `${ this.request.accountId }.${ this.request.table }`, id: this.request.id },
            UpdateExpression: `REMOVE links.#table.#id`,
            ExpressionAttributeNames: {
              "#table": this.request.foreignTable,
              "#id": this.request.foreignId
            }
          }
          console.log('syntax:', syntax)
          return syntax
        }


  } // End Handler Class ---------

  new HandlerObject(incomingRequest, context, callback)

} // End Main Handler Function -------
