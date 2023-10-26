import jwt, { SignOptions } from 'jsonwebtoken'
import { config } from 'dotenv'
import { TokenPayload } from '@/models/requests/User.requests'
config()
export const signToken = ({
  payload,
  privateKey,
  option = {
    algorithm: 'HS256'
  }
}: {
  payload: string | object | Buffer
  privateKey: string
  option?: SignOptions
}) => {
  return new Promise<string>((resolve, rejects) => {
    jwt.sign(payload, privateKey, option, (err, token) => {
      if (err) {
        throw rejects(err)
      }
      resolve(token as string)
    })
  })
}

export const verifyToken = ({ token, secretOrPublicKey }: { token: string; secretOrPublicKey: string }) => {
  return new Promise<TokenPayload>((resolve, rejects) => {
    jwt.verify(token, secretOrPublicKey, (err, decoded) => {
      if (err) {
        throw rejects(err)
      }
      resolve(decoded as TokenPayload)
    })
  })
}
