import { NextFunction, Request, Response } from 'express'
import User from '@/models/schemas/User.schema'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { TokenPayload } from '@/models/requests/User.requests'
import tourService from '@/services/tours.services'
import databaseService from '@/services/database.services'
import { check } from 'express-validator'
import Tour from '../models/schemas/tours.Schema'
import { createTour, deleteTour, updateTourRequest } from '@/models/requests/Tour.requests'

export const createTourController = async (req: Request<ParamsDictionary, createTour>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const user = await databaseService.users.findOne({
    _id: new ObjectId(user_id)
  })
  const { body } = req
  if (user?.role === 'user') {
    throw new Error('You are not allowed to create tour')
  }
  const result = await tourService.createTour(body)
  return res.json(result)
}

export const getTourController = async (req: Request, res: Response) => {
  return res.json({
    message: 'Get tour success',
    result: req.tour
  })
}

export const updateTourController = async (req: Request<ParamsDictionary, updateTourRequest>, res: Response) => {
  const { tour_id } = req.params
  const { user_id } = req.decoded_authorization as TokenPayload
  const user = await databaseService.users.findOne({
    _id: new ObjectId(user_id)
  })
  const { body } = req
  if (user?.role === 'user') {
    throw new Error('You are not allowed to create tour')
  }
  const tour = await tourService.updateTour(tour_id, body)
  return res.json(tour)
}

export const getAllToursController = async (req: Request, res: Response) => {
  const tours = await tourService.getAllTours()
  return res.json(tours)
}

export const deleteTourController = async (req: Request<ParamsDictionary, deleteTour>, res: Response) => {
  const { tour_id } = req.params
  const { user_id } = req.decoded_authorization as TokenPayload
  const user = await databaseService.users.findOne({
    _id: new ObjectId(user_id)
  })
  if (user?.role === 'user') {
    throw new Error('You are not allowed to delete tour')
  }
  const tour = await tourService.deleteTour(tour_id)
  return res.json(tour)
}
