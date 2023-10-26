import { Pagination } from "@/models/requests/Tour.requests"
import { extend } from "lodash"

export interface SearchQuery extends Pagination {
  name: string
}
