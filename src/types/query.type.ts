export interface IPagination {
  page: number
  limit: number
  select?: string
  search?: string
  categories?: string
  productId?: string
  minPrice?: string
  maxPrice: string
  sort?: string
  isCombo?: string
  isFlashDeal?: string
  isTrending?: string
}
