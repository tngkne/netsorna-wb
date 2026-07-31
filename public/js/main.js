/**
 * Netsorna E-Commerce Engine
 * Handles Cart State, LocalStorage, Interactivity, and Navigation
 */

document.addEventListener('DOMContentLoaded', () => {
  CartStore.init();
  UIController.init();
});

/* ==========================================================================
   1. CART STORE (State Management & LocalStorage)
   ========================================================================== */
const CartStore = {
  STORAGE_KEY: 'netsorna_cart',

  getCart() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveCart(cart) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cart));
    this.updateBadge();
  },

  addItem(product) {
    const cart = this.getCart();
    const existingIndex = cart.findIndex(
      item => item.id === product.id && item.option === product.option
    );

    if (existingIndex > -1) {
      cart[existingIndex].quantity += product.quantity || 1;
    } else {
      cart.push({
        id: product.id || 'NET-' + Date.now().toString().slice(-4),
        title: product.title,
        price: Number(product.price),
        image: product.image,
        option: product.option || 'Standard',
        size: product.size || 'Default',
        quantity: product.quantity || 1
      });
    }

    this.saveCart(cart);
    UIController.showToast(`Added "${product.title}" to cart`);
  },

  updateQuantity(index, delta) {
    const cart = this.getCart();
    if (!cart[index]) return;

    cart[index].quantity += delta;

    if (cart[index].quantity <= 0) {
      cart.splice(index, 1);
    }

    this.saveCart(cart);
  },

  removeItem(index) {
    const cart = this.getCart();
    if (cart[index]) {
      const name = cart[index].title;
      cart.splice(index, 1);
      this.saveCart(cart);
      UIController.showToast(`Removed "${name}" from cart`);
    }
  },

  getTotalCount() {
    return this.getCart().reduce((sum, item) => sum + item.quantity, 0);
  },

  getSubtotal() {
    return this.getCart().reduce((sum, item) => sum + (item.price * item.quantity), 0);
  },

  updateBadge() {
    const count = this.getTotalCount();
    const badgeElements = document.querySelectorAll('#cartBadge, .cart-badge');
    badgeElements.forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'inline-flex' : 'none';
    });
  },

  init() {
    // Seed sample item if cart is empty on first load (for testing/demo)
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      const demoCart = [
        {
          id: 'NET-FRM-001',
          title: 'FROME ART',
          price: 1999,
          image: 'images/products/product1.jpg',
          option: 'Raw White',
          size: '60cm x 80cm',
          quantity: 1
        }
      ];
      this.saveCart(demoCart);
    } else {
      this.updateBadge();
    }
  }
};

/* ==========================================================================
   2. UI CONTROLLER (Event Listeners & DOM Binding)
   ========================================================================== */
const UIController = {
  init() {
    this.bindNavigation();
    this.bindProductPage();
    this.bindCartPage();
    this.bindProductCards();
  },

  // Navbar Drawer & Header interactions
  bindNavigation() {
    const menuToggle = document.getElementById('menuToggle');
    const navDrawer = document.getElementById('navDrawer');

    if (menuToggle && navDrawer) {
      menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        navDrawer.classList.toggle('active');
      });

      document.addEventListener('click', (e) => {
        if (!navDrawer.contains(e.target) && !menuToggle.contains(e.target)) {
          navDrawer.classList.remove('active');
        }
      });
    }
  },

  // Product Page specific controls
  bindProductPage() {
    const addToCartBtn = document.getElementById('addToCartBtn');
    if (!addToCartBtn) return; // Not on product page

    // Dynamic Option Chips
    let selectedOption = 'Raw White';
    const chips = document.querySelectorAll('.option-chips .chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        selectedOption = chip.textContent.trim();
      });
    });

    // Image Thumbnail Switcher
    const mainImg = document.getElementById('mainProductImg');
    const thumbs = document.querySelectorAll('.thumb-btn');
    thumbs.forEach(thumb => {
      thumb.addEventListener('click', () => {
        thumbs.forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
        const newSrc = thumb.querySelector('img')?.src;
        if (newSrc && mainImg) mainImg.src = newSrc;
      });
    });

    // Add to Cart Action
    addToCartBtn.addEventListener('click', () => {
      const title = document.querySelector('.product-title-lg')?.textContent.trim() || 'Artwork';
      const priceText = document.querySelector('.product-price-lg')?.textContent.replace(/[^0-9]/g, '') || '0';
      const image = mainImg?.src || 'images/products/product1.jpg';

      CartStore.addItem({
        id: 'NET-FRM-001',
        title: title,
        price: parseInt(priceText, 10),
        image: image,
        option: selectedOption,
        size: '60cm x 80cm',
        quantity: 1
      });
    });
  },

  // Cart Page Dynamic Rendering & Quantity Handlers
  bindCartPage() {
    const cartList = document.querySelector('.cart-items-list');
    if (!cartList) return; // Not on cart page

    this.renderCart();
  },

  renderCart() {
    const cartList = document.querySelector('.cart-items-list');
    const summaryBox = document.querySelector('.cart-summary-card');
    const cartHeaderCount = document.querySelector('.cart-count');
    const cart = CartStore.getCart();

    if (!cartList) return;

    if (cartHeaderCount) {
      cartHeaderCount.textContent = `${CartStore.getTotalCount()} Item${CartStore.getTotalCount() === 1 ? '' : 's'}`;
    }

    if (cart.length === 0) {
      cartList.innerHTML = `
        <div class="empty-cart-msg">
          <p>Your cart is currently empty.</p>
          <a href="shop.html" class="btn btn-solid" style="margin-top: 16px; display: inline-block;">Browse Artworks</a>
        </div>
      `;
      if (summaryBox) {
        summaryBox.style.opacity = '0.5';
        summaryBox.style.pointerEvents = 'none';
      }
      return;
    }

    if (summaryBox) {
      summaryBox.style.opacity = '1';
      summaryBox.style.pointerEvents = 'all';
    }

    // Render Items
    cartList.innerHTML = cart.map((item, index) => `
      <article class="cart-item" data-index="${index}">
        <div class="cart-item-img">
          <img src="${item.image}" alt="${item.title}" onerror="this.outerHTML='<div class=\\'placeholder-box\\'></div>'">
        </div>

        <div class="cart-item-details">
          <div class="item-title-row">
            <h3 class="item-title">${item.title}</h3>
            <span class="item-price">R ${item.price * item.quantity}</span>
          </div>

          <p class="item-spec">Finish: ${item.option} • ${item.size}</p>

          <div class="item-controls">
            <div class="quantity-selector">
              <button class="qty-btn dec-btn" onclick="UIController.handleQtyChange(${index}, -1)">-</button>
              <span class="qty-num">${item.quantity}</span>
              <button class="qty-btn inc-btn" onclick="UIController.handleQtyChange(${index}, 1)">+</button>
            </div>

            <button class="remove-btn" onclick="UIController.handleRemove(${index})">Remove</button>
          </div>
        </div>
      </article>
    `).join('');

    // Update Totals
    const subtotal = CartStore.getSubtotal();
    const delivery = subtotal > 0 ? 250 : 0;
    const total = subtotal + delivery;

    const summaryLines = document.querySelectorAll('.summary-line strong');
    if (summaryLines.length >= 3) {
      summaryLines[0].textContent = `R ${subtotal.toLocaleString()}`;
      summaryLines[1].textContent = subtotal > 0 ? `R ${delivery}` : 'Free';
      summaryLines[2].textContent = `R ${total.toLocaleString()}`;
    }
  },

  handleQtyChange(index, delta) {
    CartStore.updateQuantity(index, delta);
    this.renderCart();
  },

  handleRemove(index) {
    CartStore.removeItem(index);
    this.renderCart();
  },

  // Clickable Product Cards on Shop / Related Grids
  bindProductCards() {
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
      card.style.cursor = 'pointer';
      card.addEventListener('click', (e) => {
        // Prevent redirect if clicking an inline button inside the card
        if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A') return;
        window.location.href = 'product.html';
      });
    });
  },

  // Toast Notification System
  showToast(message) {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 8px;
      `;
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.style.cssText = `
      background: #000;
      color: #fff;
      padding: 12px 20px;
      border-radius: 4px;
      font-size: 0.82rem;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: fadeIn 0.2s ease-out;
    `;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }
};
