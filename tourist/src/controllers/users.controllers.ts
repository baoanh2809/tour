import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import User from '@/models/schemas/User.schema'
import {
  LoginRequest,
  LogoutRefreshBody,
  RegisterRequest,
  TokenPayload,
  emailVerifyToken,
  forgotPassword,
  verifyForgotPassword,
  resetPassword,
  updateMe,
  getProfile,
  followUser,
  unFollow,
  changePassword,
  RefreshTokenBody
} from '@/models/requests/User.requests'
import databaseService from '@/services/database.services'
import userService from '@/services/users.services'
import { ObjectId } from 'mongodb'
import { USER_MESSAGES } from '@/constants/messages'
import HTTP from '@/constants/httpStatus'
import { verify } from 'crypto'
import { UserVerifiStatus } from '@/constants/enums'
import { body } from 'express-validator'
import { pick } from 'lodash'

export const loginController = async (req: Request<ParamsDictionary, any, LoginRequest>, res: Response) => {
  const user = req.user as User
  const user_id = user._id as ObjectId
  const result = await userService.login({ user_id: user_id.toString(), verify: user.verify })
  res.status(200).json({ message: USER_MESSAGES.LOGIN_SUCCESS, result })
}

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterRequest>,
  res: Response,
  next: NextFunction
) => {
  const result = await userService.register(req.body)
  res.status(201).json({ message: USER_MESSAGES.REGISTER_SUCCESS, result })
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutRefreshBody>, res: Response) => {
  const { refreshToken } = req.body
  const result = await userService.logout(refreshToken)
  return res.status(201).json(result)
}

export const verifyEmailController = async (req: Request<ParamsDictionary, any, emailVerifyToken>, res: Response) => {
  const { user_id } = req.decoded_email_veridy_token as TokenPayload
  const user = await databaseService.users.findOne({
    _id: new ObjectId(user_id)
  })
  if (!user) {
    return res.status(HTTP.NOT_FOUND).json({
      message: USER_MESSAGES.USER_NOT_FOUND
    })
  }
  if (user.email_verified_token === '') {
    return res.json({
      message: USER_MESSAGES.EMAIL_AlREADY_VERIFIED_BEFORE
    })
  }

  const result = await userService.verifyEmail(user_id)
  return res.json({
    message: USER_MESSAGES.EMAIL_VERIFIED_SUCCESS
  })
}

export const resendVerifyEmailController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const user = await databaseService.users.findOne({
    _id: new ObjectId(user_id)
  })
  if (!user) {
    return res.status(HTTP.NOT_FOUND).json({
      message: USER_MESSAGES.USER_NOT_FOUND
    })
  }
  if (user.verify === UserVerifiStatus.Verified) {
    return res.json({
      message: USER_MESSAGES.EMAIL_AlREADY_VERIFIED_BEFORE
    })
  }
  const result = await userService.resendVerifyEmail(user_id, user.email)
  return res.json(result)
}

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, forgotPassword>,
  res: Response,
  next: NextFunction
) => {
  const { _id, verify, email } = req.user as User
  const result = await userService.forgotPassword({ user_id: (_id as ObjectId).toString(), verify, email })
  return res.json(result)
}

export const verifyForgotPasswordController = async (
  req: Request<ParamsDictionary, any, verifyForgotPassword>,
  res: Response,
  next: NextFunction
) => {
  return res.json({
    message: USER_MESSAGES.FORGOT_PASSWORD_VERIFIED_SUCCESS
  })
}

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, resetPassword>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_forgot_password_token as TokenPayload
  const password = req.body.password
  const result = await userService.resetPassword(user_id, password)
  return res.json(result)
}

export const getMeController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  console.log(user_id)
  const user = await userService.getMe(user_id)
  return res.json({
    message: USER_MESSAGES.GET_ME_SUCCESS,
    result: user
  })
}

export const updateMeController = async (
  req: Request<ParamsDictionary, any, updateMe>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { body } = req
  const result = await userService.updateMe(user_id, body)
  return res.json({
    message: USER_MESSAGES.UPDATE_ME_SUCCESS,
    result
  })
}

export const getProFileController = async (req: Request<getProfile>, res: Response, next: NextFunction) => {
  const { username } = req.params
  const user = await userService.getProfile(username)
  return res.json({
    message: USER_MESSAGES.GET_PROFILE_SUCCESS,
    result: user
  })
}

export const followController = async (
  req: Request<ParamsDictionary, any, followUser>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { follower_user_id } = req.body
  const result = await userService.follow(user_id, follower_user_id)
  return res.json(result)
}

export const unFollowController = async (req: Request<unFollow>, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { user_id: follower_user_id } = req.params
  const result = await userService.unFollow(user_id, follower_user_id)
  return res.json(result)
}

export const changePasswordController = async (
  req: Request<ParamsDictionary, any, changePassword>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { password } = req.body
  const result = await userService.changePassword(user_id, password)
  return res.json(result)
}

export const refreshTokenController = async (
  req: Request<ParamsDictionary, any, RefreshTokenBody>,
  res: Response,
  next: NextFunction
) => {
  const { refreshToken } = req.body
  const { user_id, verify, exp } = req.decoded_refresh_token as TokenPayload
  const result = await userService.refreshToken({ user_id, refreshToken, verify, exp })
  return res.json({
    message: USER_MESSAGES.REFRESH_TOKEN_SUCCESS,
    result
  })
}
