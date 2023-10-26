import { S3 } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { config } from 'dotenv'
import fs from 'fs'
import path from 'path'
config()
const s3 = new S3({
  region: process.env.AWS_REGION,
  credentials: {
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string
  }
})
// const file = fs.readFileSync(path.resolve('uploads/c14ea6547180a71f6ce5ddc00.jpg'))
export const uploadFileToS3 = ({
  filename,
  filepath,
  contentType
}: {
  filename: string
  filepath: string
  contentType: string
}) => {
  const parralUpload3 = new Upload({
    client: s3,
    params: { Bucket: 'tour-2023', Key: filename, Body: fs.readFileSync(filepath), ContentType: contentType },
    tags: [],
    queueSize: 4,
    partSize: 1024 * 1024 * 5,
    leavePartsOnError: false
  })
  return parralUpload3.done()
}
