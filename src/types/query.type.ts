export interface IProductQuery {
  page: number;
  limit: number;
  select?: string;
  search?: string;
  categories?: string;
  productId?: string;
  minPrice?: string;
  maxPrice: string;
  sort?: string;
  status?: string;
  isCombo?: string;
  isFlashDeal?: string;
  isTrending?: string;
  isAdmin?:string;
}

export interface IOrderQuery {
  page: number;
  limit: number;
  select?: string;
  status?: string;
  search?: string;
  userId?: string;
}
