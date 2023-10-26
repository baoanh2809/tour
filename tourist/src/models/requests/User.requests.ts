import { JwtPayload } from 'jsonwebtoken'
import { TokenTypes, UserVerifiStatus } from '@/constants/enums'
import { emailVerifyToken } from '../../middlewares/users.middlewares'
import { ParamsDictionary } from 'express-serve-static-core'

export interface UpdateMeRequest {
  name?: string
  dateofbirth?: string
  bio?: string
  location?: string
  website?: string
  user_name?: string
  avatar?: string
  cover_photo?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  confirmPassword: string
  dateofbirth: string
}

export interface TokenPayload extends JwtPayload {
  user_id: string
  token_type: TokenTypes
  verify: UserVerifiStatus
  exp: number
  iat: number
}

export interface LogoutRefreshBody {
  refreshToken: string
}

export interface RefreshTokenBody {
  refreshToken: string
}

export interface emailVerifyToken {
  email_verify_token: string
}

export interface forgotPassword {
  email: string
}

export interface verifyForgotPassword {
  forgotPasswordToken: string
}

export interface resetPassword {
  password: string
  confirmPassword: string
  forgotPasswordToken: string
}

export interface updateMe {
  name?: string
  dateofbirth?: string
  bio?: string
  location?: string
  website?: string
  username?: string
  avatar?: string
  cover_photo?: string
}

export interface getProfile {
  username: string
}

export interface followUser {
  follower_user_id: string
}

export interface unFollow extends ParamsDictionary {
  user_id: string
}

export interface changePassword {
  oldPassword: string
  password: string
  confirmPassword: string
}
