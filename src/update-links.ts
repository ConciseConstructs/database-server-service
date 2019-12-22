import { LambdaHandler } from '../lib/classes/lambdahandler/LambdaHandler.class'
import { IResponse } from '../lib/classes/lambdahandler/Response.class'
import { Context, Callback } from 'aws-lambda'


  export interface IRequest {
    queue: {
      accountId:string
      table:string
      id:string
      foreignTable:string
      foreignId:string
      link:boolean
    }[]
  }


export function handler(incomingRequest:IRequest, context:Context, callback:Callback) {

  class HandlerObject extends LambdaHandler {
    protected request:IRequest
    protected response:IResponse
    private interval:number
    private count:number
    private record:{
      accountId:string
      table:string
      id:string
      foreignTable:string
      foreignId:string
      link:boolean
    }


    constructor(incomingRequest:IRequest, context:Context, callback:Callback) {
      super(incomingRequest, context, callback)
    }



        protected hookConstructorPre() {
          this.requiredInputs = ['queue']
          this.needsToExecuteLambdas = true
          this.interval = 500
          this.count = 0
        }








    protected performActions() {
      this.performQueueProcess()
    }




        private performQueueProcess() {
          setTimeout(()=> {
            this.record = this.request.queue[this.count]
            if (this.record.link) this.linkRecord()
            else this.unlinkRecord()
            this.count++
            if (this.count < this.request.queue.length) this.performQueueProcess()
          }, this.interval)
        }




            private linkRecord() {
              this.lambda.invoke({
                // FunctionName: `Alertur-Database-DEV-link`,
                FunctionName: `${ process.env.saasName }-Database-${ process.env.stage }-link`,
                Payload: JSON.stringify(this.record)
              }).promise()
                .then(result => this.onSuccess(result))
                .catch(error => this.onFailure(error))
            }




            private unlinkRecord() {
              this.lambda.invoke({
                // FunctionName: `Alertur-Database-DEV-unlink`,
                FunctionName: `${ process.env.saasName }-Database-${ process.env.stage }-unlink`,
                Payload: JSON.stringify(this.record)
              }).promise()
                .then(result => this.onSuccess(result))
                .catch(error => this.onFailure(error))
            }




                private onSuccess(outcome) {
                  outcome = JSON.parse(outcome.Payload)
                  let result = JSON.parse(outcome.body)
                  if (!result.success) this.onFailure(result)
                  else this.hasSucceeded(result)
                }




                private onFailure(outcome) {
                  outcome = JSON.parse(outcome.Payload)
                  let result = JSON.parse(outcome.body)
                  this.hasFailed(result)
                }


  } // End Handler Class ---------

  new HandlerObject(incomingRequest, context, callback)

} // End Main Handler Function -------

// handler({
//   queue: [
//     {
//       accountId: "acct-uiWio",
//       foreignId: "cnct-zncM",
//       foreignTable: "contacts",
//       id: "tag-7fl",
//       link: true,
//       table: "tags",
//     },
//     {
//       accountId: "acct-uiWio",
//       foreignId: "cnct-zncM",
//       foreignTable: "contacts",
//       id: "tag-LJe",
//       link: true,
//       table: "tags",
//     }
//   ]
// }, {} as Context, ()=>{})