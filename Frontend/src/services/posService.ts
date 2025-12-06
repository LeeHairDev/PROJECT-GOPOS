type CartItem = { product: any; qty: number };

const cart: CartItem[] = [];

export const posService = {
  addToCart(product: any) {
    const existing = cart.find(c => c.product._id === product._id);
    if (existing) existing.qty += 1;
    else cart.unshift({ product, qty: 1 });
    // notify listeners if needed
    const evt = new CustomEvent('pos-cart-changed', { detail: { cart: [...cart] } });
    window.dispatchEvent(evt);
    return [...cart];
  },
  getCart() { return [...cart]; },
  updateQty(productId: string, qty: number) {
    const it = cart.find(c => c.product._id === productId);
    if (it) it.qty = Math.max(1, qty);
    window.dispatchEvent(new CustomEvent('pos-cart-changed', { detail: { cart: [...cart] } }));
    return [...cart];
  },
  remove(productId: string) {
    const idx = cart.findIndex(c => c.product._id === productId);
    if (idx >= 0) cart.splice(idx, 1);
    window.dispatchEvent(new CustomEvent('pos-cart-changed', { detail: { cart: [...cart] } }));
    return [...cart];
  },
  clear() { cart.length = 0; window.dispatchEvent(new CustomEvent('pos-cart-changed', { detail: { cart: [] } })); },
}

export default posService;
