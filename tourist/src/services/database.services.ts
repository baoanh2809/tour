import { MongoClient, Db, Collection } from 'mongodb'
import dotenv from 'dotenv'
import User from '@/models/schemas/User.schema'
import e from 'express'
import { error } from 'console'
import RefreshToken from '@/models/schemas/refreshToken.schema'
import Booking from '@/models/schemas/bookings.Schema'
import Follower from '@/models/schemas/followers.Schema'
import Tour from '@/models/schemas/tours.Schema'
dotenv.config()
// const mongoUrl = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.brqve.mongodb.net/users`
const mongoUrl = `mongodb://localhost:27017`
class DatabaseService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(mongoUrl)
    this.db = this.client.db(`${process.env.DB_NAME}`)
  }
  async connect() {
    try {
      // Send a ping to confirm a successful connection
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.log('Error', error)
      throw error
    }
  }

  // async indexTours() {
  //   const exist = await this.tours.indexExists(['content_text'])
  //   if (!exist) {
  //     await this.tours.createIndex({ content_text: 'text' }, { default_language: 'none' })
  //   }
  // }

  get users(): Collection<User> {
    return this.db.collection(`${process.env.DB_USERS_COLLECTION}`)
  }

  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(`${process.env.DB_REFRESH_TOKEN_COLLECTION}`)
  }

  get bookings(): Collection<Booking> {
    return this.db.collection(`${process.env.DB_BOOKING_COLLECTION}`)
  }

  get followers(): Collection<Follower> {
    return this.db.collection(`${process.env.DB_FOLLOWERS_COLLECTION}`)
  }

  get tours(): Collection<Tour> {
    return this.db.collection(`${process.env.DB_TOURS_COLLECTION}`)
  }
}

const databaseService = new DatabaseService()
export default databaseService
