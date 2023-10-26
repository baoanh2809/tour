import { UPLOAD_DIR } from '@/constants/dir'
import { handleUploadImage, getNameFromFullName } from '../utils/file'
import { Request } from 'express'
import sharp from 'sharp'
import fs from 'fs'
import fspromises from 'fs/promises'
import { isProduction } from '@/constants/config'
import { MediaTypes } from '@/constants/enums'
import { Media } from '@/models/Others'
import { uploadFileToS3 } from '@/utils/s3'
import path from 'path'
import { CompleteMultipartUploadCommandOutput } from '@aws-sdk/client-s3'
class MediaService {
  async handleUploadImage(req: Request) {
    const files = await handleUploadImage(req)
    const result: Media[] = await Promise.all(
      files.map(async (item) => {
        const newName = getNameFromFullName(item.newFilename)
        const newFullFileName = `${newName}.jpg`
        const newPath = path.resolve(UPLOAD_DIR, newFullFileName)
        await sharp(item.filepath).jpeg().toFile(newPath)
        const s3Result = await uploadFileToS3({
          filename: newFullFileName,
          filepath: newPath,
          contentType: 'image/jpeg'
        })
        Promise.all([fspromises.unlink(item.filepath), fspromises.unlink(newPath)])
        fs.unlinkSync(item.filepath)
        return {
          url: (s3Result as CompleteMultipartUploadCommandOutput).Location as string,
          type: MediaTypes.Image
        }
      })
    )
    return result
  }
}

const mediasService = new MediaService()

export default mediasService
