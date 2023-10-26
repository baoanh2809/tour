import { ObjectId } from 'mongodb'
interface FollowerType {
  _id?: ObjectId
  user_id: string
  created_at?: Date
  follower_user_id: ObjectId
}

export default class Follower {
  _id?: ObjectId
  user_id: string
  created_at?: Date
  follower_user_id: ObjectId
  constructor({ _id, user_id, created_at, follower_user_id }: FollowerType) {
    this._id = _id
    this.user_id = user_id
    this.created_at = created_at || new Date()
    this.follower_user_id = follower_user_id
  }
}
