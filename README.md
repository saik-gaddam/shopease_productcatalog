# 🛍️ ShopEase — E-commerce Product Catalog

A fully functional e-commerce front-end built with **plain HTML, CSS, and JavaScript** — no frameworks, no backend. Built as a fresher-friendly portfolio project to demonstrate core front-end fundamentals: DOM manipulation, state management, localStorage persistence, and responsive design.

## Live Features

- **Product catalog** — 12 products across 4 categories, rendered dynamically from a JS data array
- **Search, filter & sort** — live search by name/description, filter by category, sort by price or rating
- **Shopping cart** — add/remove items, increase/decrease quantity, running subtotal — all persisted to `localStorage` so the cart survives a page refresh
- **Checkout flow** — a real form with client-side validation (required fields, email format, 10-digit phone number) and an order confirmation screen with a generated order ID
- **Dark mode** — toggle persisted across sessions via `localStorage`
- **Fully responsive** — adapts from desktop grid down to a single-column mobile layout
- **Toast notifications** — lightweight feedback when items are added/removed

## Tech Stack

Pure **HTML5, CSS3 (custom properties, Grid, Flexbox), and vanilla JavaScript (ES6+)** — no libraries, no build step. Open `index.html` and it just works.

## Project Structure

```
shopease-product-catalog/
├── index.html          # Page structure & markup
├── css/
│   └── style.css       # All styling, including dark mode theme
└── js/
    ├── data.js          # Static product data (acts as a mock API)
    ├── cart.js          # Cart logic + localStorage persistence (IIFE module)
    └── app.js           # Rendering, event handling, filters, checkout
```

## How to Run

No installation needed — it's a static site.

1. Download/clone the folder
2. Open `index.html` directly in your browser, **or** serve it locally for the best experience:
   ```bash
   # Using Python
   python3 -m http.server 8000

   # Or using VS Code's "Live Server" extension
   ```
3. Visit `http://localhost:8000`

## What This Project Demonstrates

- **DOM manipulation** without a framework — dynamically building product cards, cart rows, and toggling UI states
- **State management patterns** — using a small IIFE module (`Cart`) to encapsulate cart logic, similar to how you'd structure a Redux slice or React context, just in vanilla JS
- **Form validation** — regex-based email/phone validation with inline error messages, no library
- **`localStorage` for persistence** — cart and theme preference survive page reloads
- **Responsive CSS** — CSS Grid for the product layout, custom properties for theming (light/dark mode)
- **Event delegation** — a single listener on the product grid and cart container handles clicks for any number of dynamically rendered items

## Possible Future Enhancements

- Replace the static `data.js` array with a real API (e.g., fetch from a Node/Express backend — pairs well with the TaskFlow MERN project)
- Add product detail pages with routing
- Add pagination for large catalogs
- Persist cart to a backend instead of localStorage once a user is logged in

---
Feel free to fork, modify, and extend this project for your own portfolio.
