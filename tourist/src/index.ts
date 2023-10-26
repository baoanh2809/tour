import express, { Request, Response, NextFunction } from 'express'
import { defaultErrorHandler } from '@/middlewares/errors.middleware'
import databaseService from './services/database.services'
import { routes } from './routes/index.routes'
import helmet from 'helmet'
import { initFolder } from '@/utils/file'
import { config } from 'dotenv'
import argv from 'minimist'
import { UPLOAD_DIR } from '@/constants/dir'
import '@/utils/s3'
const options = argv(process.argv.slice(2))
import cors from 'cors'
config()

const app = express()
const PORT = 4000 || process.env.PORT
initFolder()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
routes(app)
databaseService.connect()
app.use(defaultErrorHandler)
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'none'"],
      styleSrc: ["'self'", "'https://fonts.googleapis.com'"]
    }
  })
)
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`)
})
