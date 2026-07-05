window.addEventListener("load", () => {
  if (localStorage.getItem("dark-theme") === "true") {
    document.body.classList.add("dark-theme");
  }

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

  function navigateToStep(stepNumber) {
    document.querySelectorAll(".wizard-step").forEach(step => step.classList.remove("active"));
    const targetStep = document.getElementById(`step-${stepNumber}`);
    if (targetStep) targetStep.classList.add("active");

    document.querySelectorAll(".progress-step").forEach((dot, index) => {
      if (index + 1 <= stepNumber) {
        dot.classList.add("active");
      } else {
        dot.classList.remove("active");
      }
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  document.body.addEventListener("click", (e) => {
    if (e.target.classList.contains("prev-step-btn") || e.target.hasAttribute("data-target")) {
      const target = e.target.getAttribute("data-target");
      if (target) navigateToStep(parseInt(target));
    }
  });

  if (cartNavBtn) cartNavBtn.addEventListener("click", () => navigateToStep(2));
  if (checkoutBtn) checkoutBtn.addEventListener("click", () => navigateToStep(3));

  function initHeroBanner() {
    const bannerContainer = document.getElementById("hero-banner-carousel");
    if (!bannerContainer) return;

    const productData = typeof products !== 'undefined' ? products : [];
    const featuredItems = productData.filter(p => p.featured);

    if (featuredItems.length === 0) return;

    bannerContainer.innerHTML = featuredItems.map((p, idx) => `
      <div class="banner-slide ${idx === 0 ? 'active' : ''}">
        <div class="banner-content">
          <span class="banner-tag">Special Deal</span>
          <h2 class="banner-title">${p.name}</h2>
          <p class="banner-price">$${p.price.toFixed(2)}</p>
          <button class="btn btn-primary add-to-cart-btn" data-id="${p.id}">Shop Now</button>
        </div>
        <div class="banner-img-wrapper">
          <img src="${p.image}" alt="${p.name}">
        </div>
      </div>
    `).join("");

    let activeIndex = 0;
    const slides = bannerContainer.querySelectorAll(".banner-slide");
    if (slides.length <= 1) return;

    setInterval(() => {
      slides[activeIndex].classList.remove("active");
      activeIndex = (activeIndex + 1) % slides.length;
      slides[activeIndex].classList.add("active");
    }, 4500);
  }

  function renderProducts(filteredList) {
    if (!productGrid) return;
    if (!filteredList || filteredList.length === 0) {
      productGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px 0;">No matching products discovered.</p>`;
      return;
    }
    productGrid.innerHTML = filteredList.map(p => {
      const isClothing = p.category && p.category.toLowerCase().trim() === "clothing";
      const sizeSelectorHtml = isClothing ? `
        <div class="product-size-container">
          <label for="size-select-${p.id}">Size:</label>
          <select id="size-select-${p.id}" class="size-dropdown">
            <option value="">Select Size</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
          </select>
        </div>
      ` : '';

      return `
        <article class="product-card">
          <div class="product-img-wrapper">
            <img src="${p.image}" alt="${p.name}">
          </div>
          <div class="product-info">
            <span class="product-category">${p.category}</span>
            <h3 class="product-title">${p.name}</h3>
            <p class="product-rating">⭐ ${p.rating} <span>(${Math.floor(p.rating * 15)} reviews)</span></p>
            ${sizeSelectorHtml}
            <div class="product-footer">
              <span class="product-price">$${p.price.toFixed(2)}</span>
              <button class="btn btn-primary add-to-cart-btn" data-id="${p.id}">Add to Cart</button>
            </div>
          </div>
        </article>
      `;
    }).join("");
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
        <div class="cart-item-img">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="cart-item-details">
          <h4 class="cart-item-title">${item.name} ${item.selectedSize ? `(${item.selectedSize})` : ''}</h4>
          <span class="cart-item-price">$${item.price.toFixed(2)}</span>
          <div class="cart-item-qty">
            <button class="btn-qty qty-minus" data-cart-key="${item.cartKey}">-</button>
            <span>${item.quantity}</span>
            <button class="btn-qty qty-plus" data-cart-key="${item.cartKey}">+</button>
          </div>
        </div>
        <button class="btn-remove" data-cart-key="${item.cartKey}">🗑️</button>
      </div>
    `).join("");
  }

  function processCatalogState() {
    let query = searchInput ? searchInput.value.toLowerCase().trim() : "";
    let catSelection = categoryFilter ? categoryFilter.value.toLowerCase().trim() : "all";
    let sortType = sortSelect ? sortSelect.value : "default";

    const productData = typeof products !== 'undefined' ? products : [];

    let result = productData.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(query);
      const pCat = p.category ? p.category.toLowerCase().trim() : "";
      const matchCat = catSelection === "all" || pCat === catSelection;
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
    if (!element) return;
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

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const active = document.body.classList.toggle("dark-theme");
      localStorage.setItem("dark-theme", active);
    });
  }

  if (searchInput) searchInput.addEventListener("input", processCatalogState);
  if (categoryFilter) categoryFilter.addEventListener("change", processCatalogState);
  if (sortSelect) sortSelect.addEventListener("change", processCatalogState);

  document.body.addEventListener("click", (e) => {
    if (e.target.classList.contains("add-to-cart-btn")) {
      const id = parseInt(e.target.getAttribute("data-id"));
      const productData = typeof products !== 'undefined' ? products : [];
      const match = productData.find(p => p.id === id);
      
      if (match) {
        let selectedSize = null;
        if (match.category && match.category.toLowerCase().trim() === "clothing") {
          const sizeSelector = document.getElementById(`size-select-${id}`);
          if (sizeSelector && !sizeSelector.value) {
            alert("Please select a clothing item size.");
            sizeSelector.focus();
            return;
          }
          selectedSize = sizeSelector ? sizeSelector.value : null;
        }
        Cart.addItem(match, selectedSize);
        displayToast(`Added ${match.name} to cart!`);
      }
    }
  });

  if (cartItemsContainer) {
    cartItemsContainer.addEventListener("click", (e) => {
      const cartKey = e.target.getAttribute("data-cart-key");
      if (!cartKey) return;

      if (e.target.classList.contains("qty-plus")) Cart.updateQuantity(cartKey, 1);
      else if (e.target.classList.contains("qty-minus")) Cart.updateQuantity(cartKey, -1);
      else if (e.target.classList.contains("btn-remove")) {
        const item = Cart.getItems().find(i => i.cartKey === cartKey);
        Cart.removeItem(cartKey);
        if (item) displayToast(`Removed ${item.name} from cart.`);
      }
    });
  }

  document.addEventListener("cartUpdated", renderCart);

  // ⚡ GOOGLE MAPS AUTOCOMPLETE PROTECTION ⚡
  const addr1Input = document.getElementById("address-1");
  const cityInput = document.getElementById("city");
  const stateInput = document.getElementById("state");
  const pinInput = document.getElementById("pincode");

  if (addr1Input && typeof google !== "undefined" && google.maps && google.maps.places) {
    const group1 = addr1Input.closest(".form-group");
    group1.style.position = "relative";
    
    const dropdown = document.createElement("div");
    dropdown.id = "address-autocomplete-dropdown";
    dropdown.style.cssText = "position:absolute; background:var(--bg-card); border:1px solid var(--border-color); width:100%; max-height:250px; overflow-y:auto; z-index:1000; display:none; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.1); margin-top:45px;";
    group1.appendChild(dropdown);

    const unitPrompt = document.createElement("div");
    unitPrompt.id = "unit-prompt-container";
    unitPrompt.style.cssText = "display:none; background:var(--bg-app); border-left:4px solid var(--primary-color); padding:10px; margin:10px 0; border-radius:4px; font-size:0.9rem;";
    unitPrompt.innerHTML = `
      <span style="font-weight:600; display:block; margin-bottom:4px;">Is this an apartment, suite, or unit?</span>
      <input type="text" id="address-2" placeholder="Apt, Suite, Unit # (Optional)" style="width:100%; padding:8px; border:1px solid var(--border-color); border-radius:6px; background:var(--bg-card); color:var(--text-main);">
    `;
    group1.after(unitPrompt);

    try {
      const autocompleteService = new google.maps.places.AutocompleteService();
      const placesService = new google.maps.places.PlacesService(document.createElement('div'));

      addr1Input.addEventListener("input", (e) => {
        const val = e.target.value.trim();
        dropdown.innerHTML = "";
        dropdown.style.display = "none";

        if (val.length < 3) return;

        autocompleteService.getPlacePredictions({
          input: val,
          componentRestrictions: { country: 'us' },
          types: ['address']
        }, (predictions, status) => {
          if (status !== google.maps.places.PlacesServiceStatus.OK || !predictions) return;

          dropdown.style.display = "block";

          predictions.forEach((prediction) => {
            const item = document.createElement("div");
            item.style.cssText = "padding:10px 15px; cursor:pointer; border-bottom:1px solid var(--border-color); font-weight:500; font-size:0.95rem;";
            item.textContent = prediction.description;

            item.addEventListener("click", () => {
              addr1Input.value = prediction.structured_formatting.main_text;
              dropdown.style.display = "none";

              placesService.getDetails({
                placeId: prediction.place_id,
                fields: ['address_components']
              }, (place, detailsStatus) => {
                if (detailsStatus === google.maps.places.PlacesServiceStatus.OK) {
                  parseAndPopulateAddress(place.address_components);
                }
              });
            });

            item.addEventListener("mouseenter", () => item.style.background = "var(--border-color)");
            item.addEventListener("mouseleave", () => item.style.background = "none");
            dropdown.appendChild(item);
          });
        });
      });
    } catch (e) {
      console.warn("Google Places Autocomplete failed to configure. Input fields reverted to manual entries safely.", e);
    }

    function parseAndPopulateAddress(components) {
      let streetNumber = "";
      let route = "";
      
      components.forEach(component => {
        const types = component.types;
        if (types.includes("street_number")) streetNumber = component.long_name;
        if (types.includes("route")) route = component.short_name;
        if (types.includes("locality") && cityInput) cityInput.value = component.long_name;
        if (types.includes("administrative_area_level_1") && stateInput) stateInput.value = component.short_name;
        if (types.includes("postal_code") && pinInput) pinInput.value = component.long_name;
      });

      if (streetNumber && route) {
        addr1Input.value = `${streetNumber} ${route}`;
      }

      clearAddressErrors();
      
      if (unitPrompt) {
        unitPrompt.style.display = "block";
        const aptInput = document.getElementById("address-2");
        if (aptInput) aptInput.focus();
      }
    }

    document.addEventListener("click", (e) => {
      if (e.target !== addr1Input && e.target !== dropdown) {
        dropdown.style.display = "none";
      }
    });
  }

  function clearAddressErrors() {
    ["city", "state", "pincode"].forEach(id => {
      const node = document.getElementById(id);
      if (node) markValidity(node, true);
    });
  }

  // Handle inputs typing changes to remove warning frameworks
  ["first-name", "last-name", "email", "address-1", "city", "state", "pincode"].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", () => {
        if (el.value.trim()) markValidity(el, true);
      });
    }
  });

  if (checkoutForm) {
    checkoutForm.addEventListener("submit", (e) => {
      e.preventDefault();
      let formValid = true;

      const firstNameNode = document.getElementById("first-name");
      if (firstNameNode && !firstNameNode.value.trim()) {
        markValidity(firstNameNode, false, "First name field is required.");
        formValid = false;
      }

      const lastNameNode = document.getElementById("last-name");
      if (lastNameNode && !lastNameNode.value.trim()) {
        markValidity(lastNameNode, false, "Last name field is required.");
        formValid = false;
      }

      const emailNode = document.getElementById("email");
      if (emailNode && !emailNode.value.trim()) {
        markValidity(emailNode, false, "Email field is required.");
        formValid = false;
      }

      const addrNode = document.getElementById("address-1");
      if (addrNode && !addrNode.value.trim()) {
        markValidity(addrNode, false, "Please enter a valid street address.");
        formValid = false;
      }

      const cityNode = document.getElementById("city");
      if (cityNode && !cityNode.value.trim()) {
        markValidity(cityNode, false, "City field is required.");
        formValid = false;
      }

      const stateNode = document.getElementById("state");
      if (stateNode && !stateNode.value.trim()) {
        markValidity(stateNode, false, "State field is required.");
        formValid = false;
      }

      const pinNode = document.getElementById("pincode");
      if (pinNode && !pinNode.value.trim()) {
        markValidity(pinNode, false, "ZIP Code field is required.");
        formValid = false;
      }

      if (formValid) {
        if (summaryOrderId) summaryOrderId.textContent = `#SE${Math.floor(100000 + Math.random() * 900000)}`;
        if (confirmationModal) confirmationModal.classList.add("open");
        Cart.clear();
        checkoutForm.reset();
        const up = document.getElementById("unit-prompt-container");
        if (up) up.style.display = "none";
      }
    });
  }

  if (closeConfirmation) {
    closeConfirmation.addEventListener("click", () => {
      if (confirmationModal) confirmationModal.classList.remove("open");
      navigateToStep(1);
    });
  }

  const logoElement = document.querySelector(".logo");
  if (logoElement) {
    logoElement.style.cursor = "pointer";
    logoElement.addEventListener("click", () => navigateToStep(1));
  }

  const initialProducts = typeof products !== 'undefined' ? products : [];
  initHeroBanner();
  renderProducts(initialProducts);
  renderCart();
});
