import { SearchQuery } from '@/models/requests/Search.requets'
import Tour from '@/models/schemas/tours.Schema'
import databaseService from '@/services/database.services'

class SearchService {
  async searchTours({ name, limit, page }: { limit: number, page: number, name: string }) {
    const tours = await databaseService.tours
      .find({
        $text: {
          $search: name
        }
      })
      .skip(limit * (page - 1))
      .limit(limit)
      .toArray()
    return tours
  }
}

const searchService = new SearchService()

export default searchService
