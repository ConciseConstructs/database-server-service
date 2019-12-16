import { LambdaHandler } from '../lib/classes/lambdahandler/LambdaHandler.class'
import { IResponse } from '../lib/classes/lambdahandler/Response.class'
import { Context, Callback } from 'aws-lambda'
import { DynamoDB } from 'aws-sdk'


  export interface IRequest {
    units:number
  }


export function handler(incomingRequest:IRequest, context:Context, callback:Callback) {

  class HandlerObject extends LambdaHandler {
    protected request:IRequest
    protected response:IResponse
    currentCapacity: any


    constructor(incomingRequest:IRequest, context:Context, callback:Callback) {
      super(incomingRequest, context, callback)
    }



        protected hookConstructorPre() {
          this.requiredInputs = ['units']
          this.needsToConnectToDatabase = true
        }








    protected async performActions() {
      const db = new DynamoDB()
      let result = await db.describeTable({ TableName: `${ process.env.saasName }-${ process.env.stage }` }).promise() as any
      if (result && result.Table) this.currentCapacity = result.Table.ProvisionedThroughput.WriteCapacityUnits
      db.updateTable(this.makeUpdateCapacitySyntax()).promise()
        .then(result => this.onUpdateCapacitySuccess(result))
        .catch(error => this.onUpdateCapacityFailure(error))
    }




      private makeUpdateCapacitySyntax() {
        return {
          TableName: `${ process.env.saasName }-${ process.env.stage }`,
          ProvisionedThroughput: {
           ReadCapacityUnits: this.currentCapacity + this.request.units,
           WriteCapacityUnits: this.currentCapacity + this.request.units
          }
      }
    }




    private onUpdateCapacityFailure(error) {  console.log('error-ead7aff3-23be-40d0-9d6c-e2a1f2996676', error)
      this.hasFailed(error)
    }




    private onUpdateCapacitySuccess(result) {
      this.hasSucceeded(result)
    }


  } // End Handler Class ---------

  new HandlerObject(incomingRequest, context, callback)

} // End Main Handler Function -------
