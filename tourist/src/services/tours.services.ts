import { TokenTypes, UserVerifiStatus } from '@/constants/enums'
import HTTP from '@/constants/httpStatus'
import { TOUR_MESSEAGE, USER_MESSAGES } from '@/constants/messages'
import { ErrorsWithStatus } from '@/models/Errors'
import { TourRequest } from '@/models/requests/Tour.requests'
import User from '@/models/schemas/User.schema'
import Follower from '@/models/schemas/followers.Schema'
import RefreshToken from '@/models/schemas/refreshToken.schema'
import Tour from '@/models/schemas/tours.Schema'
import { default as DatabaseService, default as databaseService } from '@/services/database.services'
import { hashPassword } from '@/utils/crypto'
import { signToken, verifyToken } from '@/utils/jwt'
import axios from 'axios'
import { verify } from 'crypto'
import dotenv from 'dotenv'
import { ObjectId } from 'mongodb'
import { updateTourRequest } from '@/models/requests/Tour.requests'

dotenv.config()
class TourService {
  async updateTour(tour_id: string, payload: updateTourRequest) {
    const result = await databaseService.users.findOneAndUpdate(
      {
        _id: new ObjectId(tour_id)
      },
      {
        $set: {
          ...(payload as updateTourRequest)
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return result.value
  }
  async getTour(tour_id: string) {
    const tour = await databaseService.tours.findOne({
      _id: new ObjectId(tour_id)
    })
    if (!tour) {
      throw new Error('Tour not found')
    }
    return tour
  }

  async createTour(payload: TourRequest) {
    const tour_id = new ObjectId()
    await databaseService.tours.insertOne(
      new Tour({
        _id: tour_id,
        ...payload
      })
    )
    return {
      message: TOUR_MESSEAGE.TOUR_CREATE_SUCCESS
    }
  }

  async getAllTours() {
    const tours = await databaseService.tours.find({}).toArray()
    return tours
  }

  async deleteTour(tour_id: string) {
    const result = await databaseService.tours.findOneAndDelete({
      _id: new ObjectId(tour_id)
    })
    return {
      message: 'Delete tour success'
    }
  }
}

const tourService = new TourService()
export default tourService
