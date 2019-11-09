import { LambdaHandler } from '../lib/classes/lambdahandler/LambdaHandler.class'
import { IResponse } from '../lib/classes/lambdahandler/Response.class'
import { Context, Callback } from 'aws-lambda'
import { DynamoDB } from 'aws-sdk'


  export interface IRequest {
    newAccountData: {
      acctId:string
      name:string
      firstName:string
      lastName:string
      address:string
      address2:string
      city:string
      state:string
      postalCode:string
      email:string
    }
    initialUser:any
  }


export function handler(incomingRequest:IRequest, context:Context, callback:Callback) {

  class HandlerObject extends LambdaHandler {
    protected request:IRequest
    protected response:IResponse


    constructor(incomingRequest:IRequest, context:Context, callback:Callback) {
      super(incomingRequest, context, callback)
    }



        protected hookConstructorPre() {
          this.requiredInputs = ['newAccountData', 'initialUser']
          this.needsToConnectToDatabase = true
        }







    protected performActions() {
      this.createUserDatabase()
    }




        private createUserDatabase() {
          this.db.batchWrite(this.makeCreateUserDatabaseSyntax())
            .promise()
              .then(result => this.hasSucceeded(result))
              .catch(error => this.hasFailed(error))
        }




            private makeCreateUserDatabaseSyntax():DynamoDB.BatchWriteItemInput {
              return {
                RequestItems: {
                  [`${ process.env.saasName }-${ process.env.stage }`]: [
                    {
                      PutRequest: {
                        Item: {
                          table: `${ this.request.newAccountData.acctId }.balances`,
                          id: "current",
                          amount: 0.00,
                          indexA: `updatedAt:${ new Date().valueOf() }`,
                        }
                      }
                    },
                    {
                      PutRequest: {
                        Item: {
                          table: `${ this.request.newAccountData.acctId }.conversations`,
                          id: "log",
                        }
                      }
                    },
                    {
                      PutRequest: {
                        Item: {
                          table: `${ this.request.newAccountData.acctId }.keywords`,
                          id: "log",
                        }
                      }
                    },
                    {
                      PutRequest: {
                        Item: {
                          table: `${ this.request.newAccountData.acctId }.opts`,
                          id: "log",
                        }
                      }
                    },
                    {
                      PutRequest: {
                        Item: {
                          table: `${ this.request.newAccountData.acctId }.opts`,
                          id: "phones",
                        }
                      }
                    },
                    {
                      PutRequest: {
                        Item: this.request.initialUser
                      }
                    },
                    {
                      PutRequest: {
                        Item: {
                          table: `${ this.request.newAccountData.acctId }.metas`,
                          id: "entity",
                          name: this.request.newAccountData.name,
                          contact: `${ this.request.newAccountData.firstName } ${ this.request.newAccountData.lastName }`,
                          address: this.request.newAccountData.address,
                          address2: this.request.newAccountData.address2,
                          city: this.request.newAccountData.city,
                          state: this.request.newAccountData.state,
                          postalCode: this.request.newAccountData.postalCode,
                          contactEmail: this.request.newAccountData.email,
                          braintreeId: null,
                          twilio: {
                            auth: null,
                            sid: null
                          }
                        }
                      }
                    }
                  ]
                }
              } as DynamoDB.BatchWriteItemInput
            }

  } // End Handler Class ---------

  new HandlerObject(incomingRequest, context, callback)

} // End Main Handler Function -------
