import { uploadImageController, serveImageController } from '@/controllers/media.controller'
import { wrapRequestHandler } from '../utils/handlers'
import { Router } from 'express'

import multer from 'multer'

const mediaRouter = Router()
mediaRouter.get('/static/image/:name', serveImageController)
mediaRouter.post('/upload-image', wrapRequestHandler(uploadImageController))

export default mediaRouter
