import { accessTokenValidator, isUserLoggedInValidator, verifiedUserValidator } from '@/middlewares/users.middlewares'
import { wrapRequestHandler } from '@/utils/handlers'
import {
  createTourController,
  deleteTourController,
  getAllToursController,
  getTourController,
  updateTourController
} from '@/controllers/tours.controllers'
import { Router } from 'express'
import { wrap } from 'module'
import { audienceValidator, createTourValidator } from '@/middlewares/tours.middlewares'

const toursRouter = Router()

toursRouter.post(
  '/create-tour',
  accessTokenValidator,
  verifiedUserValidator,
  createTourValidator,
  wrapRequestHandler(createTourController)
)

toursRouter.get(
  '/get-tour/:tour_id',
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  audienceValidator,
  wrapRequestHandler(getTourController)
)
toursRouter.patch(
  '/update-tour/:tour_id',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(updateTourController)
)

toursRouter.delete(
  '/delete-tour/:tour_id',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(deleteTourController)
)

toursRouter.get('/', accessTokenValidator, verifiedUserValidator, wrapRequestHandler(getAllToursController))
export default toursRouter
