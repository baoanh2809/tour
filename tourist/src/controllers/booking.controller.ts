import { TokenPayload } from '@/models/requests/User.requests'
import bookingService from '@/services/booking.serviecs'
import { Request, Response } from 'express'

export const creatBookingTour = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const tour_id = req.params.toString()
  const result = await bookingService.createBooking(user_id, tour_id)
  return res.json(result)
}

export const deleteBookingTour = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const tour_id = req.params.toString()
  const result = await bookingService.deleteBooking(user_id, tour_id)
  return res.json(result)
}

export const getAllBookingTour = async (req: Request, res: Response) => {
  const result = await bookingService.getAllBooking()
  return res.json(result)
}

export const updateBookingTour = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const tour_id = req.params.toString()
  const { body } = req
  const result = await bookingService.updateBooking(user_id, tour_id, body)
  return res.json(result)
}

export const getBookingTourById = async (req: Request, res: Response) => {
  const { booking_id } = req.params
  const result = await bookingService.getBookingById(booking_id)
  return res.json(result)
}
