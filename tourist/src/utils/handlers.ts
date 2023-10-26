import { Request, Response, NextFunction, RequestHandler } from 'express'
// type Fun = (req: Request, res: Response, next: NextFunction) => Promise<void>

export const wrapRequestHandler = <P>(fun: RequestHandler<P>) => {
  return async (req: Request<P>, res: Response, next: NextFunction) => {
    try {
      await fun(req, res, next)
    } catch (err) {
      next(err)
    }
  }
}
