export interface IProduct {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images?: string[];
}

export interface ICategory{
  name:string,
  slug:string,
  icon:string
}