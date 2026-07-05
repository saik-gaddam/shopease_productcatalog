const Cart = (() => {
  let items = [];

  function saveAndDispatch() {
    document.dispatchEvent(new CustomEvent("cartUpdated"));
  }

  return {
    getItems: () => items,
    getCount: () => items.reduce((acc, item) => acc + item.quantity, 0),
    getTotal: () => items.reduce((acc, item) => acc + (item.price * item.quantity), 0),
    
    addItem: (product, size = null) => {
      const cartKey = size ? `${product.id}_${size}` : `${product.id}`;
      const match = items.find(i => i.cartKey === cartKey);
      
      if (match) {
        match.quantity += 1;
      } else {
        items.push({ ...product, quantity: 1, selectedSize: size, cartKey: cartKey });
      }
      saveAndDispatch();
    },
    
    updateQuantity: (cartKey, change) => {
      const match = items.find(i => i.cartKey === cartKey);
      if (match) {
        match.quantity += change;
        if (match.quantity <= 0) {
          items = items.filter(i => i.cartKey !== cartKey);
        }
        saveAndDispatch();
      }
    },
    
    removeItem: (cartKey) => {
      items = items.filter(i => i.cartKey !== cartKey);
      saveAndDispatch();
    },
    
    clear: () => {
      items = [];
      saveAndDispatch();
    }
  };
})();
