import { TokenTypes, UserVerifiStatus } from '@/constants/enums'
import HTTP from '@/constants/httpStatus'
import { USER_MESSAGES } from '@/constants/messages'
import { ErrorsWithStatus } from '@/models/Errors'
import { RegisterRequest, updateMe } from '@/models/requests/User.requests'
import User from '@/models/schemas/User.schema'
import Follower from '@/models/schemas/followers.Schema'
import RefreshToken from '@/models/schemas/refreshToken.schema'
import { default as DatabaseService, default as databaseService } from '@/services/database.services'
import { hashPassword } from '@/utils/crypto'
import { signToken, verifyToken } from '@/utils/jwt'
import axios from 'axios'
import { verify } from 'crypto'
import dotenv from 'dotenv'
import { ObjectId } from 'mongodb'
import { sendForgotPasswordEmail, sendVerifyEmail, sendVerifyEmailTemplate } from '@/utils/email'
dotenv.config()
class UserService {
  private signAccessToken({ user_id, verify }: { user_id: string; verify: UserVerifiStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenTypes.AccessToken,
        verify
      },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      option: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRE_In
      }
    })
  }

  private signRefeshToken({ user_id, verify, exp }: { user_id: string; verify: UserVerifiStatus; exp?: number }) {
    if (exp) {
      return signToken({
        payload: {
          user_id,
          token_type: TokenTypes.RefreshToken,
          verify,
          exp
        },
        privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
      })
    }
    return signToken({
      payload: {
        user_id,
        token_type: TokenTypes.RefreshToken,
        verify
      },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      option: {
        expiresIn: process.env.REFESH_TOKEN_EXPIRE_In
      }
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private signEmailVerifyToken({ user_id, verify }: { user_id: string; verify: UserVerifiStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenTypes.RefreshToken
      },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
      option: {
        expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRE_In
      }
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private signForgotPasswordToken({ user_id, verify }: { user_id: string; verify: UserVerifiStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenTypes.ForgotPasswordToken
      },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_VERIFY_TOKEN as string,
      option: {
        expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRE_In
      }
    })
  }

  private signAccessAndRefeshToken({ user_id, verify }: { user_id: string; verify: UserVerifiStatus }) {
    return Promise.all([this.signAccessToken({ user_id, verify }), this.signRefeshToken({ user_id, verify })])
  }

  private decodeRefreshToken(refreshToken: string) {
    return verifyToken({
      token: refreshToken,
      secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
    })
  }

  async register(payload: RegisterRequest) {
    const user_id = new ObjectId()
    const email_verified_token = await this.signEmailVerifyToken({
      user_id: user_id.toString(),
      verify: UserVerifiStatus.Unverified
    })
    await DatabaseService.users.insertOne(
      new User({
        ...payload,
        _id: user_id,
        username: `user_${user_id.toString()}`,
        email_verified_token,
        dateofbirth: new Date(payload.dateofbirth),
        password: hashPassword(payload.password)
      })
    )
    const [accessToken, refreshToken] = await this.signAccessAndRefeshToken({
      user_id: user_id.toString(),
      verify: UserVerifiStatus.Unverified
    })

    const { iat, exp } = await this.decodeRefreshToken(refreshToken)
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refreshToken, iat, exp })
    )

    await sendVerifyEmailTemplate(payload.email, email_verified_token)
    return {
      accessToken,
      refreshToken,
      newUser: true,
      verify
    }
  }

  async refreshToken({
    user_id,
    refreshToken,
    verify,
    exp
  }: {
    user_id: string
    refreshToken: string
    verify: UserVerifiStatus
    exp: number
  }) {
    console.log(exp)
    const [newAccessToken, newRefreshToken] = await Promise.all([
      this.signAccessToken({ user_id, verify }),
      this.signRefeshToken({ user_id, verify, exp }),
      databaseService.refreshTokens.deleteOne({ token: refreshToken })
    ])
    const decodeRefreshToken = await this.decodeRefreshToken(newRefreshToken)
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: newRefreshToken,
        iat: decodeRefreshToken.iat,
        exp: decodeRefreshToken.exp
      })
    )
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    }
  }

  async checkEmailExist(email: string) {
    const result = await DatabaseService.users.findOne({ email })
    return Boolean(result)
  }

  private async getOAuthGoogleToken(code: string) {
    const body = {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_AUTHORIZED_REDIRECT_URI,
      grant_type: 'authorization_code'
    }
    const { data } = await axios.post('https://oauth2.googleapis.com/token', body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    return data as {
      access_token: string
      id_token: string
    }
  }

  private async getGoogleUserInfo(access_token: string, id_token: string) {
    const { data } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
      params: {
        access_token,
        alt: 'json'
      },
      headers: {
        Authorization: `Bearer ${id_token}`
      }
    })
    return data as {
      id: string
      email: string
      verified_email: boolean
      name: string
      given_name: string
      family_name: string
      picture: string
      locale: string
    }
  }
  async oauth(code: string) {
    const { id_token, access_token } = await this.getOAuthGoogleToken(code)
    const userInfo = await this.getGoogleUserInfo(access_token, id_token)
    if (!userInfo.verified_email) {
      throw new ErrorsWithStatus({
        message: USER_MESSAGES.GMAIL_NOT_VERIFIED,
        status: HTTP.BAD_REQUEST
      })
    }
    const user = await databaseService.users.findOne({ email: userInfo.email })
    if (user) {
      const [accessToken, refreshToken] = await this.signAccessAndRefeshToken({
        user_id: user._id.toString(),
        verify: user.verify
      })
      const { iat, exp } = await this.decodeRefreshToken(refreshToken)
      await databaseService.refreshTokens.insertOne(
        new RefreshToken({ user_id: user._id, token: refreshToken, iat, exp })
      )
      return {
        accessToken,
        refreshToken,
        newUser: 0,
        verify: user.verify
      }
    } else {
      const password = Math.random().toString(36).substring(2, 15)
      const data = this.register({
        email: userInfo.email,
        password,
        confirmPassword: password,
        name: userInfo.name,
        dateofbirth: new Date().toISOString()
      })
      return {
        newUser: 0,
        verify: UserVerifiStatus.Unverified,
        ...data
      }
    }
  }

  async login({ user_id, verify }: { user_id: string; verify: UserVerifiStatus }) {
    verify = UserVerifiStatus.Unverified
    const [accessToken, refreshToken] = await this.signAccessAndRefeshToken({
      user_id: user_id,
      verify: verify
    })
    const { iat, exp } = await this.decodeRefreshToken(refreshToken)
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refreshToken, iat, exp })
    )
    return {
      accessToken,
      refreshToken
    }
  }

  async logout(refreshToken: string) {
    await databaseService.refreshTokens.deleteOne({ token: refreshToken })
    return {
      message: USER_MESSAGES.LOGOUT_SUCCESS
    }
  }

  async verifyEmail(user_id: string) {
    const [token] = await Promise.all([
      this.signAccessAndRefeshToken({
        user_id: user_id,
        verify: UserVerifiStatus.Unverified
      }),
      databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
        {
          $set: {
            email_verified_token: '',
            verify: UserVerifiStatus.Verified,
            updated_at: '$$NOW'
          }
        }
      ])
    ])
    const [accessToken, refreshToken] = token
    const { iat, exp } = await this.decodeRefreshToken(refreshToken)
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refreshToken, iat, exp })
    )
    return {
      accessToken,
      refreshToken
    }
  }

  async resendVerifyEmail(user_id: string, email: string) {
    const email_verified_token = await this.signEmailVerifyToken({
      user_id: user_id,
      verify: UserVerifiStatus.Unverified
    })
    await sendVerifyEmailTemplate(email, email_verified_token)
    console.log('Resend email_verified_token: ', email_verified_token)
    await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
      {
        $set: {
          email_verified_token,
          updated_at: '$$NOW'
        }
      }
    ])
    return {
      message: USER_MESSAGES.RESEND_VERIFY_EMAIL_SUCCESS
    }
  }

  async forgotPassword({ user_id, verify, email }: { user_id: string; verify: UserVerifiStatus; email: string }) {
    const forgotPasswordToken = await this.signForgotPasswordToken({
      user_id: user_id,
      verify
    })
    await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
      {
        $set: {
          forgotPasswordToken,
          updated_at: '$$NOW'
        }
      }
    ])
    // Send link to email
    console.log('forgotPasswordToken: ', forgotPasswordToken)

    await sendForgotPasswordEmail(email, forgotPasswordToken)
    return {
      message: USER_MESSAGES.CHECK_EMAIL_FORGOT_PASSWORD
    }
  }

  async resetPassword(user_id: string, password: string) {
    await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
      {
        $set: {
          forgotPasswordToken: '',
          password: hashPassword(password),
          updated_at: '$$NOW'
        }
      }
    ])
    return {
      message: USER_MESSAGES.RESET_PASSWORD_SUCCESS
    }
  }

  async getMe(user_id: string) {
    const user = await databaseService.users.findOne(
      { _id: new ObjectId(user_id) },
      {
        projection: {
          password: 0,
          email_verified_token: 0,
          forgotPasswordToken: 0
        }
      }
    )
    return user
  }

  async updateMe(user_id: string, payload: updateMe) {
    const _payload = payload.dateofbirth ? { ...payload, dateofbirth: new Date(payload.dateofbirth) } : payload
    const result = await databaseService.users.findOneAndUpdate(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          ...(_payload as updateMe & { dateofbirth?: Date })
        },
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after',
        projection: {
          password: 0,
          email_verified_token: 0,
          forgot_password_token: 0
        }
      }
    )
    return result.value
  }

  async getProfile(username: string) {
    const user = await databaseService.users.findOne(
      {
        username
      },
      {
        projection: {
          password: 0,
          email_verified_token: 0,
          forgot_password_token: 0,
          verify: 0,
          created_at: 0,
          updated_at: 0
        }
      }
    )
    if (!user) {
      throw new ErrorsWithStatus({
        message: USER_MESSAGES.USER_NOT_FOUND,
        status: HTTP.NOT_FOUND
      })
    }
    return user
  }

  async follow(user_id: string, follower_user_id: string) {
    console.log(follower_user_id)
    const follower = await databaseService.followers.findOne({
      user_id: new ObjectId(user_id).toString(),
      follower_user_id: new ObjectId(follower_user_id)
    })
    if (follower === null) {
      await databaseService.followers.insertOne(
        new Follower({
          user_id: new ObjectId(user_id).toString(),
          follower_user_id: new ObjectId(follower_user_id)
        })
      )
      return {
        message: USER_MESSAGES.FOLLOW_SUCCESS
      }
    }
    return {
      message: USER_MESSAGES.FOLLOW_ALREADY
    }
  }

  async unFollow(user_id: string, follower_user_id: string) {
    const follower = await databaseService.followers.findOne({
      user_id: new ObjectId(user_id).toString(),
      follower_user_id: new ObjectId(follower_user_id)
    })
    if (follower === null) {
      return {
        message: USER_MESSAGES.AlREADY_UNFOLLOW
      }
    }
    await databaseService.followers.deleteOne({
      user_id: new ObjectId(user_id).toString(),
      follower_user_id: new ObjectId(follower_user_id)
    })
    return {
      message: USER_MESSAGES.UNFOLLOW_SUCCESS
    }
  }

  async changePassword(user_id: string, newPassword: string) {
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          password: hashPassword(newPassword)
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return {
      message: USER_MESSAGES.Change_PASSWORD_SUCCESS
    }
  }
}
const userService = new UserService()
export default userService
