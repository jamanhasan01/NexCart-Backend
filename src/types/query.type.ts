export interface IPagination {
  page: number
  limit: number
  select?: string
  search?: string
  sort?: string
  isCombo?: string
  isFlashDeal?: string
  isTrending?: string
}
