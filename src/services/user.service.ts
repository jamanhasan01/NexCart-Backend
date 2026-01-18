import User from "../models/User.model";

// ================================Get all Users service======================================
export const getAllUserService = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;

  // ================================Database Queries======================================
  const total_users = await User.countDocuments();
  const users = await User.find().limit(limit).skip(skip);
  /* =============================== Return Payload ================================ */
  return {
    users,
    total_users,
    page,
    limit,
    total_pages: Math.ceil(total_users / limit),
  };
};
// ================================Get a single user======================================
export const getSingleUserService = async (id: string) => {
  const userFind =await User.findById( id );
  return userFind;
};
