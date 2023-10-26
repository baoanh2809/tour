import { Router } from 'express'
import {
  logginValidate,
  registerValidator,
  accessTokenValidator,
  refreshTokenValidator,
  emailVerifyToken,
  forgotPasswordValidator,
  verifyForgotPasswordToken,
  resetPasswordValidator,
  verifiedUserValidator,
  updateMeValidator,
  followValidator,
  unFollowValidator,
  changePasswordValidator
} from '@/middlewares/users.middlewares'
import {
  loginController,
  logoutController,
  verifyEmailController,
  resendVerifyEmailController,
  forgotPasswordController,
  verifyForgotPasswordController,
  resetPasswordController,
  getMeController,
  updateMeController,
  getProFileController,
  changePasswordController,
  refreshTokenController
} from '@/controllers/users.controllers'
import { registerController } from '@/controllers/users.controllers'
import { filterMiddleware } from '@/middlewares/common.middlewares'
import { validate } from '@/utils/validation'
import { wrapRequestHandler } from '../utils/handlers'
import { updateMe } from '@/models/requests/User.requests'
const usersRouter = Router()

usersRouter.get('/test', (req, res) => {
  res.json({ message: 'Test router' })
})

usersRouter.post('/verify-email', emailVerifyToken, wrapRequestHandler(verifyEmailController))
usersRouter.post('/resend-verify-email', accessTokenValidator, wrapRequestHandler(resendVerifyEmailController))
usersRouter.post('/forgot-password', forgotPasswordValidator, wrapRequestHandler(forgotPasswordController))
usersRouter.post(
  '/verify-forgot-password',
  verifyForgotPasswordToken,
  wrapRequestHandler(verifyForgotPasswordController)
)
usersRouter.get('/me', accessTokenValidator, wrapRequestHandler(getMeController))
usersRouter.patch(
  '/me',
  accessTokenValidator,
  verifiedUserValidator,
  updateMeValidator,
  filterMiddleware<updateMe>([
    'name',
    'dateofbirth',
    'bio',
    'location',
    'website',
    'username',
    'avatar',
    'cover_photo'
  ]),
  wrapRequestHandler(updateMeController)
)
usersRouter.put(
  '/change-password',
  accessTokenValidator,
  verifiedUserValidator,
  changePasswordValidator,
  wrapRequestHandler(changePasswordController)
)
usersRouter.get('/:username', wrapRequestHandler(getProFileController))
usersRouter.post('/reset-password', resetPasswordValidator, wrapRequestHandler(resetPasswordController))
usersRouter.post('/login', logginValidate, wrapRequestHandler(loginController))
usersRouter.post('/register', registerValidator, wrapRequestHandler(registerController))
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))

usersRouter.post('/refresh-token', refreshTokenValidator, wrapRequestHandler(refreshTokenController))

export default usersRouter
