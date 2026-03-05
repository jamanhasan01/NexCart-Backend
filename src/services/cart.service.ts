import Cart from "../models/Cart.model"

export const removeOrderedItemsFromCart = async (
  userId: string,
  orderedItems: { product: string }[]
) => {
  const cart = await Cart.findOne({ user: userId })

  if (!cart) return

  const orderedProductIds = orderedItems.map((item) => item.product.toString())

  cart.items = cart.items.filter(
    (item:any) => !orderedProductIds.includes(item.product.toString())
  )

  await cart.save()
}