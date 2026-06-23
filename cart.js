/**
 * Cart module
 * Handles all cart state and persistence to localStorage.
 * Exposes a small API so app.js doesn't need to know storage details.
 */

const Cart = (() => {
  const STORAGE_KEY = "shopease_cart";

  function getItems() {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  function saveItems(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  function addItem(product) {
    const items = getItems();
    const existing = items.find((i) => i.id === product.id);

    if (existing) {
      existing.qty += 1;
    } else {
      items.push({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        qty: 1,
      });
    }

    saveItems(items);
    return items;
  }

  function updateQty(productId, qty) {
    let items = getItems();
    if (qty <= 0) {
      items = items.filter((i) => i.id !== productId);
    } else {
      const item = items.find((i) => i.id === productId);
      if (item) item.qty = qty;
    }
    saveItems(items);
    return items;
  }

  function removeItem(productId) {
    const items = getItems().filter((i) => i.id !== productId);
    saveItems(items);
    return items;
  }

  function clear() {
    saveItems([]);
    return [];
  }

  function getTotalCount() {
    return getItems().reduce((sum, item) => sum + item.qty, 0);
  }

  function getSubtotal() {
    return getItems().reduce((sum, item) => sum + item.qty * item.price, 0);
  }

  return { getItems, addItem, updateQty, removeItem, clear, getTotalCount, getSubtotal };
})();
