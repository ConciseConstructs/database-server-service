import { LambdaHandler } from '../lib/classes/lambdahandler/LambdaHandler.class'
import { IResponse } from '../lib/classes/lambdahandler/Response.class'
import { Context, Callback } from 'aws-lambda'
import { DynamoDB } from 'aws-sdk'
import { ICreateRequest } from '../lib/interfaces/database-server-service-interface/create.interface'



export function handler(incomingRequest:ICreateRequest, context:Context, callback:Callback) {

  class HandlerObject extends LambdaHandler {
    protected request:ICreateRequest
    protected response:IResponse
    private siloName:string


    constructor(incomingRequest:ICreateRequest, context:Context, callback:Callback) {
      super(incomingRequest, context, callback)
    }



        protected hookConstructorPre() {
          this.requiredInputs = ['saasName','records']
          this.needsToConnectToDatabase = true
        }







    protected performActions() {
      this.siloName = `${ this.request.saasName }-${ process.env.stage }`
      this.createUserDatabase()
    }




        private createUserDatabase() {
          this.db.batchWrite(this.makeCreateUserDatabaseSyntax())
            .promise()
              .then(result => this.hasSucceeded(result))
              .catch(error => this.hasFailed(error))
        }




            private makeCreateUserDatabaseSyntax():DynamoDB.BatchWriteItemInput {
              let batchRequest = { RequestItems: { [this.siloName]: [] } } as DynamoDB.BatchWriteItemInput
              this.request.records.forEach(record => batchRequest.RequestItems[this.siloName].push({ PutRequest: { Item: record } },))
              return batchRequest
            }

  } // End Handler Class ---------

  new HandlerObject(incomingRequest, context, callback)

} // End Main Handler Function -------
