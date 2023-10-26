import { Router } from 'express'
import { wrapRequestHandler } from '../utils/handlers'
import { oAuthController } from '@/controllers/oauth.controllers'

const oAuthRouter = Router()

oAuthRouter.get('/oauth/google', wrapRequestHandler(oAuthController))

export default oAuthRouter
