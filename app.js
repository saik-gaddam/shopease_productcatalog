/**
 * ShopEase - Main app logic
 * Handles rendering, filtering/search/sort, cart UI, and checkout flow.
 */

document.addEventListener("DOMContentLoaded", () => {
  // ---------- Element references ----------
  const productGrid = document.getElementById("productGrid");
  const searchInput = document.getElementById("searchInput");
  const categorySelect = document.getElementById("categoryFilter");
  const sortSelect = document.getElementById("sortFilter");
  const noResults = document.getElementById("noResults");

  const cartIcon = document.getElementById("cartIcon");
  const cartCount = document.getElementById("cartCount");
  const cartDrawer = document.getElementById("cartDrawer");
  const cartOverlay = document.getElementById("cartOverlay");
  const closeCartBtn = document.getElementById("closeCartBtn");
  const cartItemsContainer = document.getElementById("cartItems");
  const cartEmptyMsg = document.getElementById("cartEmptyMsg");
  const cartSubtotal = document.getElementById("cartSubtotal");
  const checkoutBtn = document.getElementById("checkoutBtn");

  const checkoutModal = document.getElementById("checkoutModal");
  const checkoutOverlay = document.getElementById("checkoutOverlay");
  const closeCheckoutBtn = document.getElementById("closeCheckoutBtn");
  const checkoutForm = document.getElementById("checkoutForm");
  const checkoutTotal = document.getElementById("checkoutTotal");
  const confirmationView = document.getElementById("confirmationView");
  const orderIdSpan = document.getElementById("orderId");

  const darkModeToggle = document.getElementById("darkModeToggle");
  const toast = document.getElementById("toast");

  // ---------- Helpers ----------
  function formatCurrency(amount) {
    return "₹" + amount.toLocaleString("en-IN");
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2000);
  }

  function renderStars(rating) {
    const fullStars = Math.round(rating);
    return "★".repeat(fullStars) + "☆".repeat(5 - fullStars);
  }

  // ---------- Product rendering ----------
  function getFilteredProducts() {
    let result = [...PRODUCTS];

    const search = searchInput.value.trim().toLowerCase();
    if (search) {
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search)
      );
    }

    const category = categorySelect.value;
    if (category !== "all") {
      result = result.filter((p) => p.category === category);
    }

    const sort = sortSelect.value;
    if (sort === "price-asc") result.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") result.sort((a, b) => b.price - a.price);
    if (sort === "rating-desc") result.sort((a, b) => b.rating - a.rating);

    return result;
  }

  function renderProducts() {
    const products = getFilteredProducts();
    productGrid.innerHTML = "";

    if (products.length === 0) {
      noResults.classList.remove("hidden");
    } else {
      noResults.classList.add("hidden");
    }

    products.forEach((product) => {
      const card = document.createElement("div");
      card.className = "product-card";
      card.innerHTML = `
        <img src="${product.image}" alt="${product.title}" loading="lazy" />
        <div class="product-info">
          <span class="product-category">${product.category}</span>
          <h3>${product.title}</h3>
          <p class="product-desc">${product.description}</p>
          <div class="product-rating">${renderStars(product.rating)} <span>(${product.rating})</span></div>
          <div class="product-footer">
            <span class="product-price">${formatCurrency(product.price)}</span>
            <button class="btn-add-cart" data-id="${product.id}">Add to Cart</button>
          </div>
        </div>
      `;
      productGrid.appendChild(card);
    });
  }

  // ---------- Cart UI ----------
  function refreshCartUI() {
    const items = Cart.getItems();
    const totalCount = Cart.getTotalCount();
    const subtotal = Cart.getSubtotal();

    cartCount.textContent = totalCount;
    cartCount.classList.toggle("hidden", totalCount === 0);

    cartItemsContainer.innerHTML = "";

    if (items.length === 0) {
      cartEmptyMsg.classList.remove("hidden");
      checkoutBtn.disabled = true;
    } else {
      cartEmptyMsg.classList.add("hidden");
      checkoutBtn.disabled = false;

      items.forEach((item) => {
        const row = document.createElement("div");
        row.className = "cart-item";
        row.innerHTML = `
          <img src="${item.image}" alt="${item.title}" />
          <div class="cart-item-info">
            <h4>${item.title}</h4>
            <span>${formatCurrency(item.price)}</span>
          </div>
          <div class="cart-item-qty">
            <button class="qty-btn" data-action="decrease" data-id="${item.id}">−</button>
            <span>${item.qty}</span>
            <button class="qty-btn" data-action="increase" data-id="${item.id}">+</button>
          </div>
          <button class="remove-btn" data-id="${item.id}" title="Remove">🗑</button>
        `;
        cartItemsContainer.appendChild(row);
      });
    }

    cartSubtotal.textContent = formatCurrency(subtotal);
    checkoutTotal.textContent = formatCurrency(subtotal);
  }

  function openCart() {
    cartDrawer.classList.add("open");
    cartOverlay.classList.add("show");
  }

  function closeCart() {
    cartDrawer.classList.remove("open");
    cartOverlay.classList.remove("show");
  }

  // ---------- Checkout ----------
  function openCheckout() {
    if (Cart.getItems().length === 0) return;
    checkoutForm.classList.remove("hidden");
    confirmationView.classList.add("hidden");
    checkoutModal.classList.add("open");
    checkoutOverlay.classList.add("show");
  }

  function closeCheckout() {
    checkoutModal.classList.remove("open");
    checkoutOverlay.classList.remove("show");
  }

  function validateCheckoutForm(formData) {
    const errors = {};

    if (!formData.get("name").trim()) {
      errors.name = "Full name is required";
    }

    const email = formData.get("email").trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      errors.email = "Email is required";
    } else if (!emailPattern.test(email)) {
      errors.email = "Enter a valid email address";
    }

    const phone = formData.get("phone").trim();
    if (!phone) {
      errors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(phone)) {
      errors.phone = "Enter a valid 10-digit phone number";
    }

    if (!formData.get("address").trim()) {
      errors.address = "Delivery address is required";
    }

    return errors;
  }

  function showFieldErrors(errors) {
    document.querySelectorAll(".field-error").forEach((el) => (el.textContent = ""));
    Object.entries(errors).forEach(([field, message]) => {
      const el = document.querySelector(`.field-error[data-field="${field}"]`);
      if (el) el.textContent = message;
    });
  }

  // ---------- Event listeners ----------
  searchInput.addEventListener("input", renderProducts);
  categorySelect.addEventListener("change", renderProducts);
  sortSelect.addEventListener("change", renderProducts);

  productGrid.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-add-cart");
    if (!btn) return;

    const productId = Number(btn.dataset.id);
    const product = PRODUCTS.find((p) => p.id === productId);
    Cart.addItem(product);
    refreshCartUI();
    showToast(`${product.title} added to cart`);
  });

  cartIcon.addEventListener("click", openCart);
  closeCartBtn.addEventListener("click", closeCart);
  cartOverlay.addEventListener("click", closeCart);

  cartItemsContainer.addEventListener("click", (e) => {
    const qtyBtn = e.target.closest(".qty-btn");
    const removeBtn = e.target.closest(".remove-btn");

    if (qtyBtn) {
      const id = Number(qtyBtn.dataset.id);
      const items = Cart.getItems();
      const item = items.find((i) => i.id === id);
      if (!item) return;

      const newQty = qtyBtn.dataset.action === "increase" ? item.qty + 1 : item.qty - 1;
      Cart.updateQty(id, newQty);
      refreshCartUI();
    }

    if (removeBtn) {
      const id = Number(removeBtn.dataset.id);
      Cart.removeItem(id);
      refreshCartUI();
      showToast("Item removed from cart");
    }
  });

  checkoutBtn.addEventListener("click", () => {
    closeCart();
    openCheckout();
  });

  closeCheckoutBtn.addEventListener("click", closeCheckout);
  checkoutOverlay.addEventListener("click", closeCheckout);

  checkoutForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(checkoutForm);
    const errors = validateCheckoutForm(formData);

    showFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    // "Place order": generate a mock order ID, clear cart, show confirmation
    const orderId = "SE" + Math.floor(100000 + Math.random() * 900000);
    orderIdSpan.textContent = orderId;

    checkoutForm.classList.add("hidden");
    confirmationView.classList.remove("hidden");

    Cart.clear();
    refreshCartUI();
    checkoutForm.reset();
  });

  // ---------- Dark mode ----------
  function applyDarkModePreference() {
    const saved = localStorage.getItem("shopease_theme");
    if (saved === "dark") {
      document.body.classList.add("dark");
      darkModeToggle.checked = true;
    }
  }

  darkModeToggle.addEventListener("change", () => {
    document.body.classList.toggle("dark", darkModeToggle.checked);
    localStorage.setItem("shopease_theme", darkModeToggle.checked ? "dark" : "light");
  });

  // ---------- Init ----------
  applyDarkModePreference();
  renderProducts();
  refreshCartUI();
});
