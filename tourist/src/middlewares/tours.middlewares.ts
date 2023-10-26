import { TOUR_MESSEAGE, USER_MESSAGES } from '@/constants/messages'
import databaseService from '@/services/database.services'
import { validate } from '@/utils/validation'
import { Request, Response, NextFunction } from 'express'
import { ParamSchema, checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { TokenPayload } from '@/models/requests/User.requests'
import { ErrorsWithStatus } from '@/models/Errors'
import HTTP from '@/constants/httpStatus'
import User from '@/models/schemas/User.schema'
import Tour from '@/models/schemas/tours.Schema'

const daySchema: ParamSchema = {
  isISO8601: {
    options: {
      strict: true,
      strictSeparator: true
    }
  },
  errorMessage: TOUR_MESSEAGE.DATE_OF_BIRTH_MUST_BE_ISO08601
}

export const createTourValidator = validate(
  checkSchema(
    {
      name: {
        isString: {
          errorMessage: TOUR_MESSEAGE.NAME_MUST_BE_STRING
        },
        trim: true,
        notEmpty: {
          errorMessage: TOUR_MESSEAGE.NAME_MUST_NOT_BE_EMPTY
        }
      },
      price: {
        notEmpty: {
          errorMessage: TOUR_MESSEAGE.PRICE_MUST_NOT_BE_EMPTY
        },
        trim: true
      },
      startDate: {
        ...daySchema,
        notEmpty: {
          errorMessage: TOUR_MESSEAGE.START_DATE_MUST_NOT_BE_EMPTY
        },
        trim: true
      },
      endDate: {
        ...daySchema,
        notEmpty: {
          errorMessage: TOUR_MESSEAGE.END_DATE_MUST_NOT_BE_EMPTY
        },
        trim: true
      }
    },
    ['body']
  )
)

export const tourIdValidator = validate(
  checkSchema(
    {
      tour_id: {
        isMongoId: {
          errorMessage: TOUR_MESSEAGE.TOUR_ID_MUST_BE_MONGO_ID
        },
        custom: {
          options: async (value, { req }) => {
            const tour = await databaseService.tours.findOne({
              _id: new ObjectId(value)
            })
            if (!tour) {
              throw new ErrorsWithStatus({
                status: HTTP.NOT_FOUND,
                message: TOUR_MESSEAGE.TOUR_NOT_FOUND
              })
            }
            ;(req as Request).tour = tour
            return true
          }
        }
      }
    },
    ['params', 'body']
  )
)

export const audienceValidator = async (req: Request, res: Response, next: NextFunction) => {
  const tour = req.tour as Tour
  if (!req.decoded_authorization) {
    throw new ErrorsWithStatus({
      status: HTTP.UNAUTHORIZED,
      message: USER_MESSAGES.ACCESS_TOKEN_IS_REQUIRED
    })
  }
}
