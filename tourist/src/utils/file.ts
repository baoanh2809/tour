import fs from 'fs'
import path from 'path'
import { Request, Response } from 'express'
import { File } from 'formidable'
import { UPLOAD_TEMP_DIR } from '@/constants/dir'

export const initFolder = () => {
  if (!fs.existsSync(UPLOAD_TEMP_DIR)) {
    fs.mkdirSync(UPLOAD_TEMP_DIR, { recursive: true })
  }
}

export const handleUploadImage = async (req: Request) => {
  const formidable = (await import('formidable')).default
  const form = formidable({
    uploadDir: UPLOAD_TEMP_DIR,
    maxFields: 4,
    keepExtensions: true,
    maxFieldsSize: 300 * 1024,
    maxTotalFileSize: 300 * 1024 * 4,
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      if (!valid) {
        form.emit('error' as any, new Error('File is not valid') as any)
      }
      return valid
    }
  })
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      // eslint-disable-next-line no-extra-boolean-cast
      if (!Boolean(files.image)) {
        return reject(new Error('File is Empty') as any)
      }
      resolve(files.image as File[])
    })
  })
}

export const getNameFromFullName = (filename: string) => {
  const namearr = filename.split('.')
  namearr.pop()
  return namearr.join('')
}
