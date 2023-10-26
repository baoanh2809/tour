import { Request, Response, NextFunction } from 'express'
import { omit } from 'lodash'
import HTTP from '@/constants/httpStatus'
import { ErrorsWithStatus } from '@/models/Errors'
export const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  try {
    if (err instanceof ErrorsWithStatus) {
      return res.status(err.status).json(omit(err, ['status']))
    }
    const finalError: any = {}
    Object.getOwnPropertyNames(err).forEach((key) => {
      if (
        !Object.getOwnPropertyDescriptor(err, key)?.configurable ||
        !Object.getOwnPropertyDescriptor(err, key)?.writable
      ) {
        return
      }
    })
    res.status(HTTP.INTERNAL_SERVER_ERROR).json({
      message: finalError.message,
      errInfo: omit(finalError, ['stack'])
    })
  } catch (err) {
    res.status(HTTP.INTERNAL_SERVER_ERROR).json({
      message: 'Internal server error',
      errInfo: omit(err as any, ['stack'])
    })
  }


}
