import { LambdaHandler } from '../lib/classes/lambdahandler/LambdaHandler.class'
import { IResponse } from '../lib/classes/lambdahandler/Response.class'
import { Context, Callback } from 'aws-lambda'
import { IBatchReadRequest } from '../lib/interfaces/database-server-service-interface/batch-read.interface'


export function handler(incomingRequest:IBatchReadRequest, context:Context, callback:Callback) {

  class HandlerObject extends LambdaHandler {
    protected request:IBatchReadRequest
    protected response:IResponse


    constructor(incomingRequest:IBatchReadRequest, context:Context, callback:Callback) {
      super(incomingRequest, context, callback)
    }



        protected hookConstructorPre() {
          this.requiredInputs = ['saasName','accountId','records']
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
              let siloName = `${ this.request.saasName }-${ process.env.stage }`
              let syntax = {
                RequestItems: {
                  [`${ siloName }`]: {
                    Keys: [ ] as { table:string, id:string }[]
                  }
                }
              }
              this.request.records.forEach(record => syntax.RequestItems[siloName].Keys.push({ table: record.tableName, id: record.id }))
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
