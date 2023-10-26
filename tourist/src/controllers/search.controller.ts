import { SearchQuery } from '@/models/requests/Search.requets'
import searchService from '@/services/search.services'
import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'

export const searchController = async (req: Request<SearchQuery>, res: Response, next: NextFunction) => {
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const result = await searchService.searchTours({ name: req.query.name as string, limit, page })
  res.json({
    message: 'Search success',
    result
  })
}
