import { LambdaHandler } from '../lib/classes/lambdahandler/LambdaHandler.class'
import { IResponse } from '../lib/classes/lambdahandler/Response.class'
import { Context, Callback } from 'aws-lambda'
import { ILinksQueueRequest } from '../lib/interfaces/database-server-service-interface/links-queue.interface'



export function handler(incomingRequest:ILinksQueueRequest, context:Context, callback:Callback) {

  class HandlerObject extends LambdaHandler {

    protected request:ILinksQueueRequest
    protected response:IResponse


    constructor(incomingRequest:ILinksQueueRequest, context:Context, callback:Callback) {
      super(incomingRequest, context, callback)
    }



        protected hookConstructorPre() {
          this.requiredInputs = ['queue']
          this.needsToExecuteLambdas = true
        }








    protected performActions() {
      this.performQueueProcessing()
    }




        private performQueueProcessing() {
          this.request.queue.forEach(item => {
            if (item.link) this.linkRecord(item)
            else this.unlinkRecord(item)
          })
        }




            private linkRecord(item) {
              this.lambda.invoke({
                FunctionName: `Database-${ process.env.stage }-links-link`,
                Payload: JSON.stringify(item)
              }).promise()
                .then(result => this.onSuccess(result))
                .catch(error => this.onFailure(error))
            }




            private unlinkRecord(item) {
              this.lambda.invoke({
                FunctionName: `Database-${ process.env.stage }-links-unlink`,
                Payload: JSON.stringify(item)
              }).promise()
                .then(result => this.onSuccess(result))
                .catch(error => this.onFailure(error))
            }




                private onFailure(outcome) {
                  outcome = JSON.parse(outcome.Payload)
                  let result = JSON.parse(outcome.body)
                  this.hasFailed(result)
                }




                private onSuccess(outcome) {
                  outcome = JSON.parse(outcome.Payload)
                  let result = JSON.parse(outcome.body)
                  if (!result.success) this.onFailure(result)
                  else this.hasSucceeded(result)
                }


  } // End Handler Class ---------

  new HandlerObject(incomingRequest, context, callback)

} // End Main Handler Function -------
