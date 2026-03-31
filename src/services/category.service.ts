/* =============================== IMPORTS ================================ */
import Category from "../models/Category.model";
import { generateSlug } from "../utils/generateSlug";

/* =============================== CREATE ================================ */
export const createCategoryService = async (payload: any) => {
  const slug = generateSlug(payload.name);

  const exist = await Category.findOne({ slug });
  if (exist) throw new Error("Category already exists");

  const result = await Category.create({
    ...payload,
    slug,
    parent: payload.parent || null,
  });

  return result;
};

/* =============================== TREE BUILDER ================================ */
const buildTree = (categories: any[]) => {
  const map = new Map();

  categories.forEach((cat) => {
    map.set(cat._id.toString(), { ...cat, children: [] });
  });

  const tree: any[] = [];

  categories.forEach((cat) => {
    if (cat.parent) {
      const parent = map.get(cat.parent.toString());
      parent?.children.push(map.get(cat._id.toString()));
    } else {
      tree.push(map.get(cat._id.toString()));
    }
  });

  return tree;
};

/* =============================== GET TREE ================================ */
export const getCategoryTreeService = async () => {
  const categories = await Category.find({ isActive: true })
    .sort({ order: 1 })
    .lean();

  return buildTree(categories);
};

/* =============================== UPDATE ================================ */
export const updateCategoryService = async (id: string, payload: any) => {
  if (payload.name) {
    payload.slug = generateSlug(payload.name);
  }

  const updated = await Category.findByIdAndUpdate(id, payload, {
    new: true,
  });

  if (!updated) throw new Error("Category not found");

  return updated;
};

/* =============================== DELETE ================================ */
export const deleteCategoryService = async (id: string) => {
  const hasChild = await Category.findOne({ parent: id });

  if (hasChild) {
    throw new Error("Cannot delete category with children");
  }

  const deleted = await Category.findByIdAndDelete(id);

  if (!deleted) throw new Error("Category not found");

  return deleted;
};
