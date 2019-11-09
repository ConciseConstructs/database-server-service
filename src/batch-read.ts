import { LambdaHandler } from '../lib/classes/lambdahandler/LambdaHandler.class'
import { IResponse } from '../lib/classes/lambdahandler/Response.class'
import { Context, Callback } from 'aws-lambda'


  export interface IRequest {
    accountId:string
    tableName:string
    ids:string[]
  }


export function handler(incomingRequest:IRequest, context:Context, callback:Callback) {

  class HandlerObject extends LambdaHandler {
    protected request:IRequest
    protected response:IResponse


    constructor(incomingRequest:IRequest, context:Context, callback:Callback) {
      super(incomingRequest, context, callback)
    }



        protected hookConstructorPre() {
          this.requiredInputs = ['accountId', 'tableName', 'ids']
          this.needsToConnectToDatabase = true
        }




    protected performActions() {
      this.batchGetByIds()
    }




        private batchGetByIds() {
          this.db.batchGet(this.makeBatchGetSyntax()).promise()
            .then(result => this.onBatchGetByIdsSuccess(result))
            .catch(error => this.onBatchGetByIdsFailure(error))
        }




            private makeBatchGetSyntax() {
              let siloName = `${ process.env.saasName }-${ process.env.stage }`
              let tableName = `${ this.request.accountId }.${ this.request.tableName }`
              let syntax = {
                RequestItems: {
                  [`${ siloName }`]: {
                    Keys: [ ] as { table:string, id:string }[]
                  }
                }
              }
              this.request.ids.forEach(id => syntax.RequestItems[siloName].Keys.push({ table: tableName, id: id }))
              return syntax
            }




            private onBatchGetByIdsFailure(error) {  console.error('error-acf8d95c-92dc-4ca5-b405-bbad347046ef', error)
              this.hasFailed(error)
            }




            private onBatchGetByIdsSuccess(result) {
              if (!result.Items) this.onBatchGetByIdsFailure(result)
              this.hasSucceeded(result)
            }


  } // End Handler Class ---------

  new HandlerObject(incomingRequest, context, callback)

} // End Main Handler Function -------
