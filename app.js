// Application UI Controller Logic
document.addEventListener("DOMContentLoaded", () => {
  // Theme Configuration Initialization
  if (localStorage.getItem("dark-theme") === "true") {
    document.body.classList.add("dark-theme");
  }

  // Bind Element Hooks
  const productGrid = document.getElementById("product-grid");
  const searchInput = document.getElementById("search-input");
  const categoryFilter = document.getElementById("category-filter");
  const sortSelect = document.getElementById("sort-select");
  const themeToggle = document.getElementById("theme-toggle");
  
  const cartBtn = document.getElementById("cart-btn");
  const closeCart = document.getElementById("close-cart");
  const cartDrawer = document.getElementById("cart-drawer");
  const cartItemsContainer = document.getElementById("cart-items");
  const cartCountBadge = document.getElementById("cart-count");
  const cartSubtotalText = document.getElementById("cart-subtotal");
  const checkoutBtn = document.getElementById("checkout-btn");

  const checkoutModal = document.getElementById("checkout-modal");
  const closeModal = document.getElementById("close-modal");
  const checkoutForm = document.getElementById("checkout-form");
  const confirmationModal = document.getElementById("confirmation-modal");
  const closeConfirmation = document.getElementById("close-confirmation");
  const summaryOrderId = document.getElementById("summary-order-id");

  // Core Dynamic Rendering Functions
  function renderProducts(filteredList) {
    if (filteredList.length === 0) {
      productGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px 0;">No matching products discovered.</p>`;
      return;
    }
    productGrid.innerHTML = filteredList.map(p => `
      <article class="product-card">
        <div class="product-img-wrapper">${p.icon}</div>
        <div class="product-info">
          <span class="product-category">${p.category}</span>
          <h3 class="product-title">${p.name}</h3>
          <p class="product-rating">⭐ ${p.rating} <span>(${Math.floor(p.rating * 15)} reviews)</span></p>
          <div class="product-footer">
            <span class="product-price">$${p.price.toFixed(2)}</span>
            <button class="btn btn-primary add-to-cart-btn" data-id="${p.id}">Add to Cart</button>
          </div>
        </div>
      </article>
    `).join("");
  }

  function renderCart() {
    const list = Cart.getItems();
    cartCountBadge.textContent = Cart.getCount();
    cartSubtotalText.textContent = `$${Cart.getTotal().toFixed(2)}`;

    if (list.length === 0) {
      cartItemsContainer.innerHTML = `<p style="text-align:center; color:var(--text-muted); padding:30px 0;">Your shopping cart is empty.</p>`;
      checkoutBtn.disabled = true;
      return;
    }

    checkoutBtn.disabled = false;
    cartItemsContainer.innerHTML = list.map(item => `
      <div class="cart-item">
        <div class="cart-item-img">${item.icon}</div>
        <div class="cart-item-details">
          <h4 class="cart-item-title">${item.name}</h4>
          <span class="cart-item-price">$${item.price.toFixed(2)}</span>
          <div class="cart-item-qty">
            <button class="btn-qty qty-minus" data-id="${item.id}">-</button>
            <span>${item.quantity}</span>
            <button class="btn-qty qty-plus" data-id="${item.id}">+</button>
          </div>
        </div>
        <button class="btn-remove" data-id="${item.id}" aria-label="Remove item">🗑️</button>
      </div>
    `).join("");
  }

  // Filtration Processing Orchestration Pipeline
  function processCatalogState() {
    let query = searchInput.value.toLowerCase().trim();
    let catSelection = categoryFilter.value;
    let sortType = sortSelect.value;

    let result = products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query);
      const matchCat = catSelection === "all" || p.category === catSelection;
      return matchSearch && matchCat;
    });

    if (sortType === "price-low") result.sort((a, b) => a.price - b.price);
    else if (sortType === "price-high") result.sort((a, b) => b.price - a.price);
    else if (sortType === "rating") result.sort((a, b) => b.rating - a.rating);

    renderProducts(result);
  }

  // Toast Messaging System Component
  function displayToast(msg) {
    const box = document.getElementById("toast-container");
    const element = document.createElement("div");
    element.className = "toast";
    element.textContent = msg;
    box.appendChild(element);
    setTimeout(() => element.remove(), 3000);
  }

  // Input Error Form Validation Assertions
  function markValidity(element, isValid, message = "") {
    const group = element.closest(".form-group");
    const errorDisplay = group.querySelector(".error-msg");
    if (isValid) {
      group.classList.remove("invalid");
      errorDisplay.textContent = "";
    } else {
      group.classList.add("invalid");
      errorDisplay.textContent = message;
    }
  }

  // Event Routing Wireframes
  themeToggle.addEventListener("click", () => {
    const active = document.body.classList.toggle("dark-theme");
    localStorage.setItem("dark-theme", active);
  });

  searchInput.addEventListener("input", processCatalogState);
  categoryFilter.addEventListener("change", processCatalogState);
  sortSelect.addEventListener("change", processCatalogState);

  cartBtn.addEventListener("click", () => cartDrawer.classList.add("open"));
  closeCart.addEventListener("click", () => cartDrawer.classList.remove("open"));

  // Delegated Event Hub Operations
  productGrid.addEventListener("click", (e) => {
    if (e.target.classList.contains("add-to-cart-btn")) {
      const id = parseInt(e.target.getAttribute("data-id"));
      const match = products.find(p => p.id === id);
      if (match) {
        Cart.addItem(match);
        displayToast(`Added ${match.name} to cart!`);
      }
    }
  });

  cartDrawer.addEventListener("click", (e) => {
    const id = parseInt(e.target.getAttribute("data-id"));
    if (!id) return;

    if (e.target.classList.contains("qty-plus")) Cart.updateQuantity(id, 1);
    else if (e.target.classList.contains("qty-minus")) Cart.updateQuantity(id, -1);
    else if (e.target.classList.contains("btn-remove")) {
      const targetItem = Cart.getItems().find(i => i.id === id);
      Cart.removeItem(id);
      if (targetItem) displayToast(`Removed ${targetItem.name} from cart.`);
    }
  });

  document.addEventListener("cartUpdated", renderCart);

  // Modal Checkout Form Workflow System Hooks
  checkoutBtn.addEventListener("click", () => {
    cartDrawer.classList.remove("open");
    checkoutModal.classList.add("open");
  });

  closeModal.addEventListener("click", () => checkoutModal.classList.remove("open"));

  checkoutForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let formValid = true;

    const nameNode = document.getElementById("full-name");
    if (!nameNode.value.trim()) {
      markValidity(nameNode, false, "Full name field is required.");
      formValid = false;
    } else markValidity(nameNode, true);

    const emailNode = document.getElementById("email");
    const mailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!mailRegex.test(emailNode.value.trim())) {
      markValidity(emailNode, false, "Enter a valid email structure.");
      formValid = false;
    } else markValidity(emailNode, true);

    const phoneNode = document.getElementById("phone");
    if (!/^\d{10}$/.test(phoneNode.value.trim())) {
      markValidity(phoneNode, false, "Phone must span exactly 10 digital numbers.");
      formValid = false;
    } else markValidity(phoneNode, true);

    const addressNode = document.getElementById("address");
    if (!addressNode.value.trim()) {
      markValidity(addressNode, false, "Shipping delivery address required.");
      formValid = false;
    } else markValidity(addressNode, true);

    if (formValid) {
      checkoutModal.classList.remove("open");
      summaryOrderId.textContent = `#SE${Math.floor(100000 + Math.random() * 900000)}`;
      confirmationModal.classList.add("open");
      Cart.clear();
      checkoutForm.reset();
    }
  });

  closeConfirmation.addEventListener("click", () => confirmationModal.classList.remove("open"));

  // Structural Setup Boot Execution Run
  renderProducts(products);
  renderCart();
});
