export interface TourRequest {
  name?: string
  participants?: string[] //user_id
  duration?: number
  price?: number
  description?: string
  startDates?: Date[]
  user_joins?: number
}

export interface updateTourRequest {
  tour_id: string
  name?: string
  participants?: string[] //user_id
  duration?: number
  price?: number
  description?: string
  startDate?: Date
  endDat?: Date
}

export interface createTour {
  user_id: string
}

export interface deleteTour {
  tour_id: string
}

export interface Pagination {
  page: string
  limit: string
}
