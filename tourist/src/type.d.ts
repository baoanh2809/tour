import express from 'express'
import Tour from './models/schemas/tours.Schema';
declare module 'express' {
  interface Request {
    user?: User
    decoded_authorization?: TokenPayload
    decoded_refresh_token?: TokenPayload
    decoded_email_veridy_token?: TokenPayload
    decoded_forgot_password_token?: TokenPayload
    tour?: Tour
  }
}
