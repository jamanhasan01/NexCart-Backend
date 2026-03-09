/* =============================== imports ================================ */

import User from '../models/User.model'

/* =============================== interface ================================ */

interface IUserQueries {
  page?: number
  limit?: number
  search?: string
  role?: string
  status?: string
}

/* =============================== Get all Users ================================ */

export const getAllUserService = async ({
  page = 1,
  limit = 20,
  search,
  role,
  status,
}: IUserQueries) => {
  const skip = (page - 1) * limit

  /* =============================== build query ================================ */

  const query: any = {}

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ]
  }

  if (role && role !== 'all') {
    query.role = role
  }

  if (status === 'active') {
    query.isBlocked = false
  }

  if (status === 'blocked') {
    query.isBlocked = true
  }

  /* =============================== users ================================ */

  const users = await User.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })

  const total_users = await User.countDocuments(query)

  const total_pages = Math.ceil(total_users / limit)

  /* =============================== stats ================================ */

  const stats = {
    total_users: await User.countDocuments(),
    admins: await User.countDocuments({ role: 'admin' }),
    customers: await User.countDocuments({ role: 'customer' }),
    active: await User.countDocuments({ isBlocked: false }),
    blocked: await User.countDocuments({ isBlocked: true }),
  }

  /* =============================== return ================================ */

  return {
    users,
    page,
    limit,
    total_pages,
    total_users,
    stats,
  }
}

/* =============================== Get single user ================================ */

export const getSingleUserService = async (id: string) => {
  return await User.findById(id)
}