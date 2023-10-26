import { NextFunction, Request, Response } from 'express'
import path from 'path'
import formidable from 'formidable'
import mediasService from '@/services/media.services'
import { USER_MESSAGES } from '@/constants/messages'
import { UPLOAD_DIR } from '@/constants/dir'

export const uploadImageController = async (req: Request, res: Response, next: NextFunction) => {
  console.log(123)
  const url = await mediasService.handleUploadImage(req)
  return res.status(200).json({
    message: USER_MESSAGES.UPLOAD_SUCCESS,
    result: url
  })
}

export const serveImageController = (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.params
  return res.sendFile(path.resolve(UPLOAD_DIR, name + '.jpg'), (err) => {
    if (err) {
      res.status((err as any).status).send('Not Found')
    }
  })
}
