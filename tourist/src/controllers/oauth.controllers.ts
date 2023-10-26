import userService from '@/services/users.services'
import { Request, Response } from 'express'

export const oAuthController = async (req: Request, res: Response) => {
  const { code } = req.query
  const result = await userService.oauth(code as string)
  console.log(result)
  const urlRedirect = `${process.env.CLIENT_REDIRECT_CALLBACK}?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}&new_user=${result.newUser}&verify=${result.verify}`
  return res.redirect(urlRedirect)
}
