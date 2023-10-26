import express, { Application, Router } from 'express'
import tourRouter from '@/routes/tours.routes'
import usersRouter from '@/routes/users.routes'
import { pathsRoutes } from '@/constants/paths'
import mediaRouter from '@/routes/media.routes'
import { UPLOAD_DIR } from '@/constants/dir'
export function routes(app: Application): void {
  const apiV1Router = Router()
  apiV1Router.use(pathsRoutes.media.root, pathsRoutes.media.routes)
  apiV1Router.use(pathsRoutes.tour.root, pathsRoutes.tour.routes)
  apiV1Router.use(pathsRoutes.user.root, pathsRoutes.user.routes)
  apiV1Router.use(pathsRoutes.oauth.root, pathsRoutes.oauth.routes)
  apiV1Router.use(pathsRoutes.search.root, pathsRoutes.search.routes)
  app.use('/api', apiV1Router)
}
