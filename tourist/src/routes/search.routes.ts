import { searchController } from '@/controllers/search.controller'
import Router from 'express'
const searchRouter = Router()

searchRouter.get('/', searchController)

export default searchRouter
