/* =============================== IMPORTS ================================ */
import Category from "../models/Category.model";
import Product from "../models/Product.model";
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

/* =============================== GET ALL ================================ */
const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parseBoolean = (value: unknown) => {
  if (typeof value !== "string") return undefined;
  if (value.toLowerCase() === "true") return true;
  if (value.toLowerCase() === "false") return false;
  return undefined;
};

const toArray = (value: unknown) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.flatMap((v) => `${v}`.split(","));
  return `${value}`.split(",");
};

export const getCategoriesService = async (query: any) => {
  const filter: any = {};

  const parentId = query.parentId as string | undefined;
  const parent = query.parent as string | undefined;
  const isActive = parseBoolean(query.isActive);
  const name = query.name as string | undefined;
  const ids = toArray(query.ids).filter(Boolean);
  const createdFrom = query.createdFrom as string | undefined;
  const createdTo = query.createdTo as string | undefined;

  if (parent === "null") {
    filter.parent = null;
  } else if (parent) {
    filter.parent = parent;
  }

  if (typeof isActive === "boolean") {
    filter.isActive = isActive;
  }

  if (name) {
    filter.name = { $regex: new RegExp(escapeRegex(name), "i") };
  }

  if (ids.length > 0) {
    filter._id = { $in: ids };
  }

  if (createdFrom || createdTo) {
    filter.createdAt = {};
    if (createdFrom) filter.createdAt.$gte = new Date(createdFrom);
    if (createdTo) filter.createdAt.$lte = new Date(createdTo);
  }

  const fields = (query.select as string | undefined)
    ?.split(",")
    .map((f) => f.trim())
    .filter(Boolean);
  const projection = fields && fields.length > 0 ? fields.join(" ") : undefined;

  if (parentId) {
    const [parentDoc, children] = await Promise.all([
      Category.findById(parentId).select(projection || "").lean(),
      Category.find({ parent: parentId })
        .sort({ order: 1 })
        .select(projection || "")
        .lean(),
    ]);

    return {
      data: {
        parent: parentDoc,
        children,
      },
      meta: {
        total: children.length,
        page: 1,
        limit: children.length,
        hasMore: false,
      },
    };
  }

  const page = Number(query.page) > 0 ? Number(query.page) : 1;
  const limit = Number(query.limit) > 0 ? Number(query.limit) : undefined;
  const usePagination = Boolean(query.page || query.limit);

  const findQuery = Category.find(filter)
    .sort({ order: 1 })
    .select(projection || "")
    .lean();

  if (usePagination && limit) {
    const skip = (page - 1) * limit;
    findQuery.skip(skip).limit(limit);
  }

  const [data, total] = await Promise.all([
    findQuery,
    Category.countDocuments(filter),
  ]);

  return {
    data,
    meta: {
      total,
      page: usePagination ? page : 1,
      limit: usePagination ? limit ?? data.length : data.length,
      hasMore: usePagination && limit ? page * limit < total : false,
    },
  };
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
    throw new Error(
      "This category cannot be deleted because it has subcategories.",
    );
  }
  /* =============================== CHECK PRODUCTS ================================ */
  const hasProducts = await Product.exists({ category: id });

  if (hasProducts) {
    throw new Error(
      "This category has products. Please move them before deleting.",
    );
  }
  const deleted = await Category.findByIdAndDelete(id);

  if (!deleted) {
    throw new Error("Category not found or already deleted.");
  }

  return deleted;
};
