// Application Cart Operations State Manager Engine
const Cart = (() => {
  let items = [];

  function saveAndDispatch() {
    document.dispatchEvent(new CustomEvent("cartUpdated"));
  }

  return {
    getItems: () => items,
    getCount: () => items.reduce((acc, item) => acc + item.quantity, 0),
    getTotal: () => items.reduce((acc, item) => acc + (item.price * item.quantity), 0),
    
    addItem: (product) => {
      const match = items.find(i => i.id === product.id);
      if (match) {
        match.quantity += 1;
      } else {
        items.push({ ...product, quantity: 1 });
      }
      saveAndDispatch();
    },
    
    updateQuantity: (id, change) => {
      const match = items.find(i => i.id === id);
      if (match) {
        match.quantity += change;
        if (match.quantity <= 0) {
          items = items.filter(i => i.id !== id);
        }
        saveAndDispatch();
      }
    },
    
    removeItem: (id) => {
      items = items.filter(i => i.id !== id);
      saveAndDispatch();
    },
    
    clear: () => {
      items = [];
      saveAndDispatch();
    }
  };
})();
