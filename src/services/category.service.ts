import Category from "../models/Category.model";
import { ICategory } from "../types/product.type";

/* ===============================  create products category business logic ================================ */
export const createProductCategoryService = async (categories: ICategory[]) => {
  const names = categories.map((c) => c.name);

  const existing = await Category.exists({ name: { $in: names } });
  if (!!existing) {
    throw new Error("One or more categories already exist");
  }
    // 🔥 generate slug manually (REQUIRED for insertMany)
  const payload = categories.map(c => ({
    ...c,
    slug:c.name
    
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-"),
  }));
  const result = await Category.insertMany(payload);
  return result;
};
