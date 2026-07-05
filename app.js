// --- ADVANCED ADDRESS ENGINE WITH MULTI-STAGE DISAMBIGUATION ---

// Mock database representing partial address matches across multiple states
const addressDatabase = {
  "6012": [
    { street: "6012 Laurel Lane", city: "Austin", state: "TX", pincode: "78730" },
    { street: "6012 Laurel Lane", city: "Fort Myers", state: "FL", pincode: "33912" },
    { street: "6012 Laurel Lane", city: "Denver", state: "CO", pincode: "80206" },
    { street: "6012 Laurel Lane", city: "Charlotte", state: "NC", pincode: "28215" }
  ],
  "prentiss": [
    { street: "1230 Prentiss Dr", city: "Downers Grove", state: "IL", pincode: "60516" }
  ],
  "ash": [
    { street: "45 Ash St", city: "Nashua", state: "NH", pincode: "03062" }
  ]
};

document.addEventListener("DOMContentLoaded", () => {
  const addr1Input = document.getElementById("address-1");
  const cityInput = document.getElementById("city");
  const stateInput = document.getElementById("state");
  const pinInput = document.getElementById("pincode");
  const form = document.getElementById("checkout-form");

  if (!addr1Input) return;

  // 1. Setup/Inject UI elements dynamically for dropdowns and unit prompt
  const group1 = addr1Input.closest(".form-group");
  
  // Suggestion Dropdown Container
  const dropdown = document.createElement("div");
  dropdown.id = "address-autocomplete-dropdown";
  dropdown.style.cssText = "position:absolute; background:var(--bg-card); border:1px solid var(--border-color); width:100%; max-height:200px; overflow-y:auto; z-index:1000; display:none; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.1); margin-top:45px;";
  group1.style.position = "relative";
  group1.appendChild(dropdown);

  // Unit/Apartment Follow-up Banner
  const unitPrompt = document.createElement("div");
  unitPrompt.id = "unit-prompt-container";
  unitPrompt.style.cssText = "display:none; background:var(--bg-app); border-left:4px solid var(--primary-color); padding:10px; margin:10px 0; border-radius:4px; font-size:0.9rem;";
  unitPrompt.innerHTML = `
    <span style="font-weight:600; display:block; margin-bottom:4px;">Is this an apartment, suite, or unit?</span>
    <input type="text" id="address-2" placeholder="Apt, Suite, Unit # (Optional)" style="width:100%; padding:8px; border:1px solid var(--border-color); border-radius:6px; background:var(--bg-card); color:var(--text-main);">
  `;
  group1.after(unitPrompt);

  // 2. Input listener for partial matches
  addr1Input.addEventListener("input", (e) => {
    const val = e.target.value.trim().toLowerCase();
    dropdown.innerHTML = "";
    dropdown.style.display = "none";

    if (val.length < 2) return;

    // Search keys in our database
    let matches = [];
    Object.keys(addressDatabase).forEach(key => {
      if (key.includes(val) || val.includes(key)) {
        matches = [...matches, ...addressDatabase[key]];
      }
    });

    if (matches.length > 0) {
      dropdown.style.display = "block";
      
      // Group matches by unique street names to prompt street choice first
      const uniqueStreets = [...new Set(matches.map(m => m.street))];

      uniqueStreets.forEach(street => {
        const item = document.createElement("div");
        item.style.cssText = "padding:10px 15px; cursor:pointer; border-bottom:1px solid var(--border-color); font-weight:500;";
        item.hoverStyle = "background:var(--bg-app);";
        item.textContent = street;
        
        // When user selects a street name
        item.addEventListener("click", () => {
          addr1Input.value = street;
          dropdown.innerHTML = "";
          
          // Filter matching locations for this specific street
          const stateOptions = matches.filter(m => m.street === street);
          
          if (stateOptions.length > 1) {
            // Show Disambiguation Step if multiple states exist
            dropdown.innerHTML = `<div style="padding:8px 15px; font-size:0.8rem; color:var(--text-muted); font-weight:600; background:var(--bg-app);">Multiple locations found. Select your state:</div>`;
            
            stateOptions.forEach(loc => {
              const stateItem = document.createElement("div");
              stateItem.style.cssText = "padding:10px 15px; cursor:pointer; border-bottom:1px solid var(--border-color);";
              stateItem.textContent = `${loc.city}, ${loc.state} ${loc.pincode}`;
              
              stateItem.addEventListener("click", () => {
                populateAddressFields(loc);
              });
              dropdown.appendChild(stateItem);
            });
          } else if (stateOptions.length === 1) {
            populateAddressFields(stateOptions[0]);
          }
        });
        
        // Hover effects
        item.addEventListener("mouseenter", () => item.style.background = "var(--border-color)");
        item.addEventListener("mouseleave", () => item.style.background = "none");
        dropdown.appendChild(item);
      });
    }
  });

  function populateAddressFields(loc) {
    if (cityInput) cityInput.value = loc.city;
    if (stateInput) stateInput.value = loc.state;
    if (pinInput) pinInput.value = loc.pincode;
    
    dropdown.style.display = "none";
    dropdown.innerHTML = "";
    
    // Clear validation warnings
    clearAddressErrors();

    // Trigger Apartment / Line 2 conditional prompt box
    if (unitPrompt) {
      unitPrompt.style.display = "block";
      const aptInput = document.getElementById("address-2");
      if (aptInput) aptInput.focus();
    }
  }

  function clearAddressErrors() {
    ["city", "state", "pincode"].forEach(id => {
      const node = document.getElementById(id);
      if (node) {
        const group = node.closest(".form-group");
        if (group) group.classList.remove("invalid");
        const err = group ? group.querySelector(".error-msg") : null;
        if (err) err.textContent = "";
      }
    });
  }

  // Close dropdown if clicked outside
  document.addEventListener("click", (e) => {
    if (e.target !== addr1Input && e.target !== dropdown) {
      dropdown.style.display = "none";
    }
  });
});
