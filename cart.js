// Self-Executing Cart Module (IIFE Pattern)
const Cart = (() => {
  let items = JSON.parse(localStorage.getItem("shopease_cart")) || [];

  const save = () => {
    localStorage.setItem("shopease_cart", JSON.stringify(items));
    document.dispatchEvent(new CustomEvent("cartUpdated"));
  };

  return {
    getItems: () => items,
    addItem: (product) => {
      const existing = items.find(i => i.id === product.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        items.push({ ...product, quantity: 1 });
      }
      save();
    },
    updateQuantity: (id, amount) => {
      const item = items.find(i => i.id === id);
      if (item) {
        item.quantity += amount;
        if (item.quantity <= 0) {
          items = items.filter(i => i.id !== id);
        }
        save();
      }
    },
    removeItem: (id) => {
      items = items.filter(i => i.id !== id);
      save();
    },
    clear: () => {
      items = [];
      save();
    },
    getCount: () => items.reduce((sum, i) => sum + i.quantity, 0),
    getTotal: () => items.reduce((sum, i) => sum + (i.price * i.quantity), 0)
  };
})();
