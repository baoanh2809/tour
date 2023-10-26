import { ObjectId } from 'mongodb'

interface TourConstructor {
  _id?: ObjectId
  name?: string
  participants?: string[] //user_id
  duration?: number
  price?: number
  description?: string
  startDate?: Date
  endDate?: Date
  user_joins?: number
  created_at?: Date
  update_at?: Date
}

export default class Tour {
  _id?: ObjectId
  name?: string
  participants: string[] //user_id
  duration: number
  price: number
  description: string
  startDate: Date
  endDate: Date
  user_joins: number
  created_at: Date
  update_at: Date
  constructor(tour: TourConstructor) {
    this._id = tour._id
    this.name = tour.name
    this.participants = tour.participants || []
    this.created_at = tour.created_at || new Date()
    this.user_joins = tour.user_joins || 0
    this.duration = tour.duration || 0
    this.description = tour.description || ''
    this.price = tour.price || 0
    this.startDate = tour.startDate || new Date()
    this.endDate = tour.endDate || new Date()
    this.update_at = tour.update_at || new Date()
  }
}
