import tourRouter from '@/routes/tours.routes'
import usersRouter from '@/routes/users.routes'
import oAuthRouter from '@/routes/oauths.routes'
import mediaRouter from '@/routes/media.routes'
import searchRouter from '@/routes/search.routes'
export const pathsRoutes = {
  tour: {
    root: '/tours',
    routes: tourRouter
  },
  booking: {
    root: '/bookings',
    routes: ''
  },
  review: {
    root: '/reviews',
    routes: ''
  },
  user: {
    root: '/users',
    routes: usersRouter
  },
  oauth: {
    root: '/',
    routes: oAuthRouter
  },
  media: {
    root: '/media',
    routes: mediaRouter
  },
  search: {
    root: '/search',
    routes: searchRouter
  }
}
