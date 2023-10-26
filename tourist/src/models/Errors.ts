import HTTP from '@/constants/httpStatus'
import { USER_MESSAGES } from '@/constants/messages'
type errorType = Record<
  string,
  {
    msg: string
    [key: string]: any
  }
>
export class ErrorsWithStatus {
  message: string
  status: number
  constructor({ message, status }: { message: string; status: number }) {
    this.message = message
    this.status = status
  }
}

export class EntityError extends ErrorsWithStatus {
  errors: errorType
  constructor({
    message = USER_MESSAGES.VALIDATION_ERROR,
    errors
  }: {
    message?: string
    status?: number
    errors: errorType
  }) {
    super({ message, status: HTTP.UNPROCESSABLE_ENTITY })
    this.errors = errors
  }
}
