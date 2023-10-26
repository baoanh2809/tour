import { Request, Response, NextFunction } from 'express'
import { ParamSchema, checkSchema } from 'express-validator'
import { validate } from '@/utils/validation'
import databaseService from '@/services/database.services'
import userService from '@/services/users.services'
import { ErrorsWithStatus } from '@/models/Errors'
import { USER_MESSAGES } from '@/constants/messages'
import { hashPassword } from '@/utils/crypto'
import HTTP_status from '@/constants/httpStatus'
import { verifyToken } from '@/utils/jwt'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize } from 'lodash'
import { ObjectId } from 'mongodb'
import { UserVerifiStatus } from '@/constants/enums'
import { TokenPayload } from '@/models/requests/User.requests'
import { REGEX_UESRNAME } from '@/constants/regex'

const passwordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USER_MESSAGES.PASSWORD_IS_REQUIRED
  },
  isString: {
    errorMessage: USER_MESSAGES.PASSWORD_MUST_BE_STRING
  },
  isLength: {
    options: {
      min: 6,
      max: 30
    },
    errorMessage: USER_MESSAGES.PASSWORD_LENGTH_MUST_BE_6_TO_30
  },
  isStrongPassword: {
    options: {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    },
    errorMessage: USER_MESSAGES.PASSWORD_MUST_BE_STRONG
  }
}

const confirmPasswordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USER_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED
  },
  isString: {
    errorMessage: USER_MESSAGES.CONFIRM_PASSWORD_MUST_BE_STRING
  },
  isLength: {
    options: {
      min: 6,
      max: 30
    },
    errorMessage: USER_MESSAGES.CONFIRM_PASSWORD_LENGTH_MUST_BE_6_TO_30
  },
  isStrongPassword: {
    options: {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    },
    errorMessage: USER_MESSAGES.CONFIRM_PASSWORD_MUST_BE_STRONG
  },
  custom: {
    options: (value, { req }) => {
      if (value !== req.body.password) {
        throw new Error(USER_MESSAGES.CONFIRM_PASSWORD_IS_NOT_MATCH)
      }
      return true
    }
  }
}

const forgotPasswordSchema: ParamSchema = {
  trim: true,
  custom: {
    options: async (value: string, { req }) => {
      if (!value) {
        throw new ErrorsWithStatus({
          message: USER_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED,
          status: HTTP_status.UNAUTHORIZED
        })
      }
      try {
        const decoded_forgot_password_token = await verifyToken({
          token: value,
          secretOrPublicKey: process.env.JWT_SECRET_FORGOT_PASSWORD_VERIFY_TOKEN as string
        })
        const { user_id } = decoded_forgot_password_token
        const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
          ; (req as Request).decoded_forgot_password_token = decoded_forgot_password_token
        if (user === null) {
          throw new ErrorsWithStatus({
            message: USER_MESSAGES.USER_NOT_FOUND,
            status: HTTP_status.UNAUTHORIZED
          })
        }
        if (user.forgotPasswordToken !== value) {
          throw new ErrorsWithStatus({
            message: USER_MESSAGES.INVALID_PASSWORD_TOKEN,
            status: HTTP_status.UNAUTHORIZED
          })
        }
      } catch (err) {
        if (err instanceof JsonWebTokenError) {
          throw new ErrorsWithStatus({
            message: capitalize(err.message),
            status: HTTP_status.UNAUTHORIZED
          })
        }
        throw err
      }
      return true
    }
  }
}

const nameSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USER_MESSAGES.NAME_IS_REQUIRED
  },
  isString: {
    errorMessage: USER_MESSAGES.NAME_MUST_BE_STRING
  },
  trim: true,
  isLength: {
    options: {
      min: 1,
      max: 100
    },
    errorMessage: USER_MESSAGES.NAME_LENGTH_MUST_BE_1_TO_100
  }
}

const dateOfBirthSchema: ParamSchema = {
  isISO8601: {
    options: {
      strict: true,
      strictSeparator: true
    }
  },
  errorMessage: USER_MESSAGES.DATE_OF_BIRTH_MUST_BE_ISO08601
}

const imageSchema: ParamSchema = {
  optional: true,
  isString: {
    errorMessage: USER_MESSAGES.IMAGE_MUST_BE_STRING
  },
  trim: true,
  isLength: {
    options: {
      min: 1,
      max: 400
    },
    errorMessage: USER_MESSAGES.IMAGE_LENGTH_MUST_BE_1_TO_400
  }
}

const userIdSchema: ParamSchema = {
  custom: {
    options: async (value) => {
      if (!ObjectId.isValid(value)) {
        throw new ErrorsWithStatus({
          message: USER_MESSAGES.INVALID_USER_ID,
          status: HTTP_status.NOT_FOUND
        })
      }
      const follower_user = await databaseService.users.findOne({ _id: new ObjectId(value) })
      if (!follower_user) {
        throw new ErrorsWithStatus({
          message: USER_MESSAGES.USER_NOT_FOUND_BY_ID,
          status: HTTP_status.NOT_FOUND
        })
      }
    }
  }
}

export const logginValidate = validate(
  checkSchema(
    {
      email: {
        isEmail: {
          errorMessage: USER_MESSAGES.EMAIL_IS_INVALID
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const user = await databaseService.users.findOne({
              email: value,
              password: hashPassword(req.body.password)
            })
            if (user === null) {
              throw new Error(USER_MESSAGES.USER_NOT_FOUND)
            }
            req.user = user
            return true
          }
        }
      },
      password: {
        isString: {
          errorMessage: USER_MESSAGES.PASSWORD_MUST_BE_STRING
        },
        isLength: {
          options: {
            min: 6,
            max: 30
          },
          errorMessage: USER_MESSAGES.PASSWORD_LENGTH_MUST_BE_6_TO_30
        },
        isStrongPassword: {
          options: {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
          },
          errorMessage: USER_MESSAGES.PASSWORD_MUST_BE_STRONG
        }
      }
    },
    ['body']
  )
)

export const registerValidator = validate(
  checkSchema(
    {
      name: nameSchema,
      email: {
        notEmpty: {
          errorMessage: USER_MESSAGES.EMAIL_IS_REQUIRED
        },
        isEmail: {
          errorMessage: USER_MESSAGES.EMAIL_IS_INVALID
        },
        trim: true,
        custom: {
          options: async (value) => {
            const isExistEmail = await userService.checkEmailExist(value)
            if (isExistEmail) {
              throw new Error(USER_MESSAGES.EMAIL_ALREADY_EXISTS)
            }
            return true
          }
        }
      },
      password: {
        notEmpty: {
          errorMessage: USER_MESSAGES.PASSWORD_IS_REQUIRED
        },
        isString: {
          errorMessage: USER_MESSAGES.PASSWORD_MUST_BE_STRING
        },
        isLength: {
          options: {
            min: 6,
            max: 30
          },
          errorMessage: USER_MESSAGES.PASSWORD_LENGTH_MUST_BE_6_TO_30
        },
        isStrongPassword: {
          options: {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
          },
          errorMessage: USER_MESSAGES.PASSWORD_MUST_BE_STRONG
        }
      },
      confirmPassword: {
        notEmpty: {
          errorMessage: USER_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED
        },
        isString: {
          errorMessage: USER_MESSAGES.CONFIRM_PASSWORD_MUST_BE_STRING
        },
        isLength: {
          options: {
            min: 6,
            max: 30
          },
          errorMessage: USER_MESSAGES.CONFIRM_PASSWORD_LENGTH_MUST_BE_6_TO_30
        },
        isStrongPassword: {
          options: {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
          },
          errorMessage: USER_MESSAGES.CONFIRM_PASSWORD_MUST_BE_STRONG
        },
        custom: {
          options: (value, { req }) => {
            if (value !== req.body.password) {
              throw new Error(USER_MESSAGES.CONFIRM_PASSWORD_IS_NOT_MATCH)
            }
            return true
          }
        }
      },
      dateofbirth: dateOfBirthSchema
    },
    ['body']
  )
)

export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        custom: {
          options: async (value, { req }) => {
            const access_token = (value || '').split(' ')[1]
            if (!access_token) {
              throw new ErrorsWithStatus({
                message: USER_MESSAGES.AUTHORIZATION_IS_INVALID,
                status: HTTP_status.UNAUTHORIZED
              })
            }
            try {
              const decoded_authorization = await verifyToken({
                token: access_token,
                secretOrPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
              })
                ; (req as Request).decoded_authorization = decoded_authorization
            } catch (err) {
              throw new ErrorsWithStatus({
                message: capitalize((err as JsonWebTokenError).message),
                status: HTTP_status.UNAUTHORIZED
              })
            }
            return true
          }
        }
      }
    },
    ['headers']
  )
)

export const refreshTokenValidator = validate(
  checkSchema(
    {
      refreshToken: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorsWithStatus({
                message: USER_MESSAGES.REFRESH_TOKEN_IS_REQUIRED,
                status: HTTP_status.UNAUTHORIZED
              })
            }
            try {
              const [decoded_refresh_token, refresh_token] = await Promise.all([
                verifyToken({ token: value, secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN as string }),
                databaseService.refreshTokens.findOne({ token: value })
              ])
                ; (req as Request).decoded_refresh_token = decoded_refresh_token
              if (refresh_token === null) {
                throw new ErrorsWithStatus({
                  message: USER_MESSAGES.USER_REFRESH_TOKEN_IS_NOT_EXIST,
                  status: HTTP_status.UNAUTHORIZED
                })
              }
            } catch (err) {
              if (err instanceof JsonWebTokenError) {
                throw new ErrorsWithStatus({
                  message: capitalize(err.message),
                  status: HTTP_status.UNAUTHORIZED
                })
              }
              throw err
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const emailVerifyToken = validate(
  checkSchema(
    {
      email_verify_token: {
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorsWithStatus({
                message: USER_MESSAGES.EMAIL_VERIFY_TOKEN_IS_REQUIRED,
                status: HTTP_status.UNAUTHORIZED
              })
            }
            try {
              const decoded_email_veridy_token = await verifyToken({
                token: value,
                secretOrPublicKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string
              })
                ; (req as Request).decoded_email_veridy_token = decoded_email_veridy_token
            } catch (err) {
              throw new ErrorsWithStatus({
                message: capitalize((err as JsonWebTokenError).message),
                status: HTTP_status.UNAUTHORIZED
              })
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const forgotPasswordValidator = validate(
  checkSchema(
    {
      email: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            const user = await databaseService.users.findOne({ email: value })
            if (user === null) {
              throw new ErrorsWithStatus({
                message: USER_MESSAGES.USER_NOT_FOUND,
                status: HTTP_status.UNAUTHORIZED
              })
            }
            req.user = user
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const verifyForgotPasswordToken = validate(
  checkSchema(
    {
      forgotPasswordToken: forgotPasswordSchema
    },
    ['body']
  )
)

export const resetPasswordValidator = validate(
  checkSchema({
    password: passwordSchema,
    confirmPassword: confirmPasswordSchema,
    forgotPasswordToken: forgotPasswordSchema
  })
)

export const verifiedUserValidator = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  if (user?.verify !== UserVerifiStatus.Verified) {
    return next(
      new ErrorsWithStatus({
        message: USER_MESSAGES.USER_NOT_VERIFIED,
        status: HTTP_status.FORBIDDEN
      })
    )
  }
  next()
}

export const updateMeValidator = validate(
  checkSchema(
    {
      name: {
        ...nameSchema,
        optional: true,
        notEmpty: undefined
      },
      dateofbirth: {
        ...dateOfBirthSchema,
        optional: true
      },
      bio: {
        optional: true,
        isString: {
          errorMessage: USER_MESSAGES.BIO_MUST_BE_STRING
        },
        trim: true,
        isLength: {
          options: {
            min: 1,
            max: 200
          },
          errorMessage: USER_MESSAGES.BIO_LENGTH_MUST_BE_1_TO_200
        }
      },
      location: {
        optional: true,
        isString: {
          errorMessage: USER_MESSAGES.LOCATION_MUST_BE_STRING
        },
        trim: true,
        isLength: {
          options: {
            min: 1,
            max: 200
          },
          errorMessage: USER_MESSAGES.LOCATION_LENGTH_MUST_BE_1_TO_200
        }
      },
      website: {
        optional: true,
        isString: {
          errorMessage: USER_MESSAGES.WEBSITE_MUST_BE_STRING
        },
        trim: true,
        isLength: {
          options: {
            min: 1,
            max: 100
          },
          errorMessage: USER_MESSAGES.WEBSITE_LENGTH_MUST_BE_1_TO_100
        }
      },
      username: {
        optional: true,
        isString: {
          errorMessage: USER_MESSAGES.USERNAME_MUST_BE_STRING
        },
        trim: true,
        custom: {
          options: async (value) => {
            if (!REGEX_UESRNAME.test(value)) {
              throw Error(USER_MESSAGES.USERNAME_IS_INVALID)
            }
            const user = await databaseService.users.findOne({ username: value })
            if (user) {
              throw Error(USER_MESSAGES.USERNAME_EXISTS)
            }
          }
        }
      },
      avatar: imageSchema,
      cover_photo: imageSchema
    },
    ['body']
  )
)

export const followValidator = validate(
  checkSchema(
    {
      follower_user_id: userIdSchema
    },
    ['body']
  )
)

export const unFollowValidator = validate(
  checkSchema({
    user_id: userIdSchema
  })
)

export const changePasswordValidator = validate(
  checkSchema({
    oldPassword: {
      ...passwordSchema,
      custom: {
        options: async (value, { req }) => {
          const { user_id } = (req as Request).decoded_authorization as TokenPayload
          const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
          if (!user) {
            throw new ErrorsWithStatus({
              message: USER_MESSAGES.USER_NOT_FOUND,
              status: HTTP_status.UNAUTHORIZED
            })
          }
          const { password } = user
          const isMatch = hashPassword(value) === password
          if (!isMatch) {
            throw new ErrorsWithStatus({
              message: USER_MESSAGES.OLD_PASSWORD_IS_NOT_MATCH,
              status: HTTP_status.UNAUTHORIZED
            })
          }
        }
      }
    },
    password: passwordSchema,
    confirmPassword: confirmPasswordSchema
  })
)

export const isUserLoggedInValidator = (middleware: (req: Request, res: Response, next: NextFunction) => void) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.headers.authorization) {
      return middleware(req, res, next)
    }
    next()
  }
}
