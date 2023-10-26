import express from 'express'
import { body, validationResult, ValidationChain } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/src/middlewares/schema'
import HTTP from '@/constants/httpStatus'
import { ErrorsWithStatus } from '@/models/Errors'
import { EntityError } from '../models/Errors'

export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    await validation.run(req)
    const errors = validationResult(req)
    if (errors.isEmpty()) {
      return next()
    }
    const errorsObj = errors.mapped()
    const entityError = new EntityError({ errors: {} })
    for (const key in errorsObj) {
      const { msg } = errorsObj[key]
      if (msg instanceof ErrorsWithStatus && msg.status !== HTTP.UNPROCESSABLE_ENTITY) {
        return next(msg)
      }
      entityError.errors[key] = errorsObj[key]
    }
    next(entityError)
  }
}
