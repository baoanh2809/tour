import { ObjectId } from 'mongodb'

interface BookingType {
  _id?: ObjectId
  user_id: string
  tour_id: string
  created_at?: Date
}

export default class Booking {
  _id?: ObjectId
  created_at?: Date
  user_id: string
  tour_id: string
  constructor(booking: BookingType) {
    this._id = booking._id
    this.created_at = booking.created_at || new Date()
    this.user_id = booking.user_id
    this.tour_id = booking.tour_id
  }
}
