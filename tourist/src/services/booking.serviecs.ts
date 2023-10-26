import { ErrorsWithStatus } from '@/models/Errors'
import Booking from '@/models/schemas/bookings.Schema'
import databaseService from '@/services/database.services'
import dotenv from 'dotenv'
import { BOOKING_MESSAGE, USER_MESSAGES } from '@/constants/messages'
import { ObjectId } from 'mongodb'
import HTTP from '@/constants/httpStatus'

dotenv.config()

class BookingService {
  async createBooking(user_id: string, tour_id: string) {
    const _id = new ObjectId()
    const booking = new Booking({
      _id,
      user_id,
      tour_id
    })
    await databaseService.bookings.insertOne(booking)
    return {
      message: BOOKING_MESSAGE.BOOKING_CREATE_SUCCESS
    }
  }

  async getBookingById(user_id: string) {
    const bookings = await databaseService.bookings
      .find({
        user_id
      })
      .toArray()
    return bookings
  }

  async deleteBooking(user_id: string, tour_id: string) {
    const booking = await databaseService.bookings.findOne({
      user_id,
      tour_id
    })
    if (!booking) {
      throw new ErrorsWithStatus({
        status: HTTP.NOT_FOUND,
        message: BOOKING_MESSAGE.BOOKING_NOT_FOUND
      })
    }
    await databaseService.bookings.deleteOne({
      user_id,
      tour_id
    })
    return {
      message: BOOKING_MESSAGE.BOOKING_DELETE_SUCCESS
    }
  }

  async deleteAllBookingByTourId(tour_id: string) {
    const bookings = await databaseService.bookings
      .find({
        tour_id
      })
      .toArray()
    if (!bookings) {
      throw new ErrorsWithStatus({
        status: HTTP.NOT_FOUND,
        message: BOOKING_MESSAGE.BOOKING_NOT_FOUND
      })
    }
    await databaseService.bookings.deleteMany({
      tour_id
    })
    return {
      message: BOOKING_MESSAGE.BOOKING_DELETE_SUCCESS
    }
  }

  async getAllBooking() {
    const bookings = await databaseService.bookings.find().toArray()
    return bookings
  }

  async updateBooking(user_id: string, tour_id: string, payload: any) {
    const booking = await databaseService.bookings.findOne({
      user_id,
      tour_id
    })
    if (!booking) {
      throw new ErrorsWithStatus({
        status: HTTP.NOT_FOUND,
        message: BOOKING_MESSAGE.BOOKING_NOT_FOUND
      })
    }
    await databaseService.bookings.updateOne(
      {
        user_id,
        tour_id
      },
      {
        $set: payload,
        $currentDate: {
          updated_at: true
        }
      }
    )
    return {
      message: BOOKING_MESSAGE.BOOKING_UPDATE_SUCCESS
    }
  }
}

const bookingService = new BookingService()

export default bookingService
