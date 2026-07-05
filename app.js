// Application Wizard UI Controller Logic
window.addEventListener("load", () => {
  // Theme Configuration Initialization
  if (localStorage.getItem("dark-theme") === "true") {
    document.body.classList.add("dark-theme");
  }

  // Bind Core Element Layout Hooks
  const productGrid = document.getElementById("product-grid");
  const searchInput = document.getElementById("search-input");
  const categoryFilter = document.getElementById("category-filter");
  const sortSelect = document.getElementById("sort-select");
  const themeToggle = document.getElementById("theme-toggle");
  
  const cartNavBtn = document.getElementById("cart-nav-btn");
  const cartItemsContainer = document.getElementById("cart-items");
  const cartCountBadge = document.getElementById("cart-count");
  const cartSubtotalText = document.getElementById("cart-subtotal");
  const checkoutBtn = document.getElementById("checkout-btn");

  const checkoutForm = document.getElementById("checkout-form");
  const confirmationModal = document.getElementById("confirmation-modal");
  const closeConfirmation = document.getElementById("close-confirmation");
  const summaryOrderId = document.getElementById("summary-order-id");

  // Step Switch Navigation Engine
  function navigateToStep(stepNumber) {
    document.querySelectorAll(".wizard-step").forEach(step => step.classList.remove("active"));
    document.getElementById(`step-${stepNumber}`).classList.add("active");

    document.querySelectorAll(".progress-step").forEach((dot, index) => {
      if (index + 1 <= stepNumber) {
        dot.classList.add("active");
      } else {
        dot.classList.remove("active");
      }
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Hook Step Switch Navigation Listeners to Buttons
  document.querySelectorAll(".prev-step-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const stepTarget = parseInt(btn.getAttribute("data-target"));
      navigateToStep(stepTarget);
    });
  });

  if (cartNavBtn) cartNavBtn.addEventListener("click", () => navigateToStep(2));
  if (checkoutBtn) checkoutBtn.addEventListener("click", () => navigateToStep(3));

  // Dynamic Content Rendering Engine
  function renderProducts(filteredList) {
    if (!productGrid) return;
    if (!filteredList || filteredList.length === 0) {
      productGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px 0;">No matching products discovered.</p>`;
      return;
    }
    productGrid.innerHTML = filteredList.map(p => `
      <article class="product-card">
        <div class="product-img-wrapper">${p.icon || '📦'}</div>
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
    if (!cartItemsContainer) return;
    const list = Cart.getItems();
    if (cartCountBadge) cartCountBadge.textContent = Cart.getCount();
    if (cartSubtotalText) cartSubtotalText.textContent = `$${Cart.getTotal().toFixed(2)}`;

    if (list.length === 0) {
      cartItemsContainer.innerHTML = `<p style="text-align:center; color:var(--text-muted); padding:30px 0;">Your shopping cart is empty.</p>`;
      if (checkoutBtn) checkoutBtn.disabled = true;
      return;
    }

    if (checkoutBtn) checkoutBtn.disabled = false;
    cartItemsContainer.innerHTML = list.map(item => `
      <div class="cart-item">
        <div class="cart-item-img">${item.icon || '📦'}</div>
        <div class="cart-item-details">
          <h4 class="cart-item-title">${item.name}</h4>
          <span class="cart-item-price">$${item.price.toFixed(2)}</span>
          <div class="cart-item-qty">
            <button class="btn-qty qty-minus" data-id="${item.id}">-</button>
            <span>${item.quantity}</span>
            <button class="btn-qty qty-plus" data-id="${item.id}">+</button>
          </div>
        </div>
        <button class="btn-remove" data-id="${item.id}">🗑️</button>
      </div>
    `).join("");
  }

  // Filtering System Pipelines
  function processCatalogState() {
    let query = searchInput ? searchInput.value.toLowerCase().trim() : "";
    let catSelection = categoryFilter ? categoryFilter.value : "all";
    let sortType = sortSelect ? sortSelect.value : "default";

    const productData = typeof products !== 'undefined' ? products : [];

    let result = productData.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(query) || (p.description && p.description.toLowerCase().includes(query));
      const matchCat = catSelection === "all" || p.category === catSelection;
      return matchSearch && matchCat;
    });

    if (sortType === "price-low") result.sort((a, b) => a.price - b.price);
    else if (sortType === "price-high") result.sort((a, b) => b.price - a.price);
    else if (sortType === "rating") result.sort((a, b) => b.rating - a.rating);

    renderProducts(result);
  }

  function displayToast(msg) {
    const box = document.getElementById("toast-container");
    if (!box) return;
    const element = document.createElement("div");
    element.className = "toast";
    element.textContent = msg;
    box.appendChild(element);
    setTimeout(() => element.remove(), 3000);
  }

  function markValidity(element, isValid, message = "") {
    const group = element.closest(".form-group");
    if (!group) return;
    const errorDisplay = group.querySelector(".error-msg");
    if (isValid) {
      group.classList.remove("invalid");
      if (errorDisplay) errorDisplay.textContent = "";
    } else {
      group.classList.add("invalid");
      if (errorDisplay) errorDisplay.textContent = message;
    }
  }

  // Global Interactive Layout Event Wireframes
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const active = document.body.classList.toggle("dark-theme");
      localStorage.setItem("dark-theme", active);
    });
  }

  if (searchInput) searchInput.addEventListener("input", processCatalogState);
  if (categoryFilter) categoryFilter.addEventListener("change", processCatalogState);
  if (sortSelect) sortSelect.addEventListener("change", processCatalogState);

  if (productGrid) {
    productGrid.addEventListener("click", (e) => {
      if (e.target.classList.contains("add-to-cart-btn")) {
        const id = parseInt(e.target.getAttribute("data-id"));
        const productData = typeof products !== 'undefined' ? products : [];
        const match = productData.find(p => p.id === id);
        if (match) {
          Cart.addItem(match);
          displayToast(`Added ${match.name} to cart!`);
        }
      }
    });
  }

  if (cartItemsContainer) {
    cartItemsContainer.addEventListener("click", (e) => {
      const id = parseInt(e.target.getAttribute("data-id"));
      if (!id) return;

      if (e.target.classList.contains("qty-plus")) Cart.updateQuantity(id, 1);
      else if (e.target.classList.contains("qty-minus")) Cart.updateQuantity(id, -1);
      else if (e.target.classList.contains("btn-remove")) {
        const item = Cart.getItems().find(i => i.id === id);
        Cart.removeItem(id);
        if (item) displayToast(`Removed ${item.name} from cart.`);
      }
    });
  }

  document.addEventListener("cartUpdated", renderCart);

  // Form Processing Submission Pipeline
  if (checkoutForm) {
    checkoutForm.addEventListener("submit", (e) => {
      e.preventDefault();
      let formValid = true;

      const nameNode = document.getElementById("full-name");
      if (nameNode && !nameNode.value.trim()) {
        markValidity(nameNode, false, "Full name field is required.");
        formValid = false;
      } else if (nameNode) markValidity(nameNode, true);

      const emailNode = document.getElementById("email");
      const mailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailNode && !mailRegex.test(emailNode.value.trim())) {
        markValidity(emailNode, false, "Enter a valid email structure.");
        formValid = false;
      } else if (emailNode) markValidity(emailNode, true);

      const phoneNode = document.getElementById("phone");
      if (phoneNode && !/^\d{10}$/.test(phoneNode.value.trim())) {
        markValidity(phoneNode, false, "Phone must span exactly 10 digits.");
        formValid = false;
      } else if (phoneNode) markValidity(phoneNode, true);

      const addressNode = document.getElementById("address");
      if (addressNode && !addressNode.value.trim()) {
        markValidity(addressNode, false, "Shipping delivery address required.");
        formValid = false;
      } else if (addressNode) markValidity(addressNode, true);

      if (formValid) {
        if (summaryOrderId) summaryOrderId.textContent = `#SE${Math.floor(100000 + Math.random() * 900000)}`;
        if (confirmationModal) confirmationModal.classList.add("open");
        Cart.clear();
        checkoutForm.reset();
      }
    });
  }

  if (closeConfirmation) {
    closeConfirmation.addEventListener("click", () => {
      if (confirmationModal) confirmationModal.classList.remove("open");
      navigateToStep(1);
    });
  }

  // Structural Setup Boot Execution Run
  const initialProducts = typeof products !== 'undefined' ? products : [];
  renderProducts(initialProducts);
  renderCart();
});
