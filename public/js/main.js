/**
 * Netsorna E-Commerce Core Functionality
 * Handles Navbar state, Drawer, LocalStorage Cart, Product Details Carousel, Dynamic Totals, and Notifications.
 */

// --- 1. MOCK PRODUCT DATABASE ---
const PRODUCTS_DB = {
  'frome-art': {
    id: 'frome-art',
    name: 'FROME ART',
    price: 1999,
    sku: 'NET-FRM-001',
    description: 'A precision UV printed acrylic wall art piece designed with multi-material contrast and subtle depth. Built for high-end luxury interiors.',
    images: [
      '/images/products/product1.jpg',
      '/images/products/product2.jpg',
      '/images/products/product3.jpg'
    ],
    dimensions: '60cm x 80cm'
  },
  'mono-relief': {
    id: 'mono-relief',
    name: 'MONO RELIEF',
    price: 2499,
    sku: 'NET-MNR-002',
    description: 'Monochromatic textured acrylic piece capturing subtle light reflections and geometric depth.',
    images: [
      '/images/products/product3.jpg',
      '/images/products/product1.jpg'
    ],
    dimensions: '75cm x 100cm'
  },
  'lineage-piece': {
    id: 'lineage-piece',
    name: 'LINEAGE PIECE',
    price: 3100,
    sku: 'NET-LNG-003',
    description: 'Fluid architectural linear art produced using precision UV direct-to-acrylic printing with polished edge finishes.',
    images: [
      '/images/products/product4.jpg',
      '/images/products/product2.jpg'
    ],
    dimensions: '90cm x 120cm'
  }
};

const SHIPPING_FEE = 250;

// --- 2. CART STATE MANAGEMENT (LocalStorage) ---
function getCart() {
  const storedCart = localStorage.getItem('netsorna_cart');
  return storedCart ? JSON.parse(storedCart) : [];
}

function saveCart(cart) {
  localStorage.setItem('netsorna_cart', JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(productId, selectedFinish = 'Floating Mount', quantity = 1) {
  const product = PRODUCTS_DB[productId] || PRODUCTS_DB['frome-art'];
  const cart = getCart();

  const existingIndex = cart.findIndex(
    item => item.id === product.id && item.finish === selectedFinish
  );

  if (existingIndex > -1) {
    cart[existingIndex].quantity += quantity;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      finish: selectedFinish,
      dimensions: product.dimensions,
      image: product.images[0],
      quantity: quantity
    });
  }

  saveCart(cart);
  showToast(`Added ${product.name} to your cart.`);
}

function updateCartBadge() {
  const cart = getCart();
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badgeElements = document.querySelectorAll('.cart-badge, #cartBadge');

  badgeElements.forEach(badge => {
    badge.textContent = totalCount;
    badge.style.display = totalCount > 0 ? 'flex' : 'none';
  });
}

// --- 3. NAVBAR SCROLL & DRAWER TOGGLE ---
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const menuToggle = document.getElementById('menuToggle');
  const navDrawer = document.getElementById('navDrawer');

  // Handle glass transparency transformation on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  });

  // Toggle drawer menu
  if (menuToggle && navDrawer) {
    menuToggle.addEventListener('click', () => {
      navDrawer.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
      if (navbar && !navbar.contains(e.target) && navDrawer && !navDrawer.contains(e.target)) {
        navDrawer.classList.remove('active');
      }
    });
  }
}

// --- 4. PRODUCT PAGE INTERACTIONS ---
function initProductPage() {
  const addToCartBtn = document.getElementById('addToCartBtn');
  const heroSlider = document.getElementById('heroSlider');
  const imageCounter = document.getElementById('imageCounter');
  const chipBtns = document.querySelectorAll('.option-chips .chip');

  // Check URL parameters to see which product to display
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id') || 'frome-art';
  const productData = PRODUCTS_DB[productId] || PRODUCTS_DB['frome-art'];

  // Dynamically update content if elements exist
  const titleEl = document.querySelector('.product-title-lg');
  const priceEl = document.querySelector('.product-price-lg');
  const descEl = document.querySelector('.product-description');

  if (titleEl) titleEl.textContent = productData.name;
  if (priceEl) priceEl.textContent = `R ${productData.price.toLocaleString()}`;
  if (descEl) descEl.textContent = productData.description;

  // Render full-width hero slider images
  if (heroSlider && productData.images.length > 0) {
    heroSlider.innerHTML = productData.images
      .map(
        (imgSrc, index) => `
        <div class="slide-item ${index === 0 ? 'active' : ''}">
          <img src="${imgSrc}" alt="${productData.name} view ${index + 1}" class="hero-img" onerror="this.outerHTML='<div class=\\'placeholder-hero\\'></div>'">
        </div>
      `
      )
      .join('');

    let currentSlide = 0;
    const slides = heroSlider.querySelectorAll('.slide-item');

    const updateSlider = () => {
      slides.forEach((slide, idx) => {
        slide.classList.toggle('active', idx === currentSlide);
      });
      if (imageCounter) {
        imageCounter.textContent = `${currentSlide + 1} / ${slides.length}`;
      }
    };

    // Cycle slides on click for full-width carousel
    heroSlider.addEventListener('click', () => {
      currentSlide = (currentSlide + 1) % slides.length;
      updateSlider();
    });

    updateSlider();
  }

  // Chip options selection (Finish choice)
  let selectedFinish = 'Floating Mount';
  chipBtns.forEach(chip => {
    if (chip.classList.contains('active')) {
      selectedFinish = chip.textContent.trim();
    }
    chip.addEventListener('click', () => {
      chipBtns.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      selectedFinish = chip.textContent.trim();
    });
  });

  // Add to Cart Action
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      addToCart(productData.id, selectedFinish, 1);
    });
  }
}

// --- 5. CART PAGE INTERACTIONS & DYNAMIC RENDER ---
function initCartPage() {
  const itemsContainer = document.querySelector('.cart-items-list');
  const cartSummaryCard = document.querySelector('.cart-summary-card');
  const cartCountHeader = document.querySelector('.cart-count');

  if (!itemsContainer) return; // Exit if not on cart page

  function renderCart() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    if (cartCountHeader) {
      cartCountHeader.textContent = `${totalItems} ${totalItems === 1 ? 'Item' : 'Items'}`;
    }

    if (cart.length === 0) {
      itemsContainer.innerHTML = `
        <div style="padding: 40px 0; text-align: left;">
          <h3>Your cart is empty.</h3>
          <p style="color: var(--text-muted, #777); margin: 12px 0 20px;">Explore our curated collection to find custom UV print artwork for your space.</p>
          <a href="/shop.html" class="btn btn-solid" style="display: inline-block; padding: 10px 24px;">Explore Collection</a>
        </div>
      `;
      if (cartSummaryCard) cartSummaryCard.style.display = 'none';
      return;
    }

    if (cartSummaryCard) cartSummaryCard.style.display = 'flex';

    let html = '';
    let subtotal = 0;

    cart.forEach((item, index) => {
      const itemSubtotal = item.price * item.quantity;
      subtotal += itemSubtotal;

      html += `
        <article class="cart-item" data-index="${index}">
          <div class="cart-item-img">
            <img src="${item.image}" alt="${item.name}" onerror="this.outerHTML='<div class=\\'placeholder-box\\'></div>'">
          </div>

          <div class="cart-item-details">
            <div class="item-title-row">
              <h3 class="item-title">${item.name}</h3>
              <span class="item-price">R ${itemSubtotal.toLocaleString()}</span>
            </div>

            <p class="item-spec">Finish: ${item.finish} • ${item.dimensions}</p>

            <div class="item-controls">
              <div class="quantity-selector">
                <button class="qty-btn minus-btn" data-index="${index}" aria-label="Decrease quantity">-</button>
                <span class="qty-num">${item.quantity}</span>
                <button class="qty-btn plus-btn" data-index="${index}" aria-label="Increase quantity">+</button>
              </div>

              <button class="remove-btn" data-index="${index}">Remove</button>
            </div>
          </div>
        </article>
      `;
    });

    itemsContainer.innerHTML = html;

    // Update Summary totals
    const total = subtotal + SHIPPING_FEE;
    const summaryLines = document.querySelectorAll('.summary-line strong');
    if (summaryLines.length >= 3) {
      summaryLines[0].textContent = `R ${subtotal.toLocaleString()}`;
      summaryLines[1].textContent = `R ${SHIPPING_FEE.toLocaleString()}`;
      summaryLines[2].textContent = `R ${total.toLocaleString()}`;
    }

    attachCartListeners();
  }

  function attachCartListeners() {
    const cart = getCart();

    // Minus Buttons
    document.querySelectorAll('.minus-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = btn.dataset.index;
        if (cart[idx].quantity > 1) {
          cart[idx].quantity -= 1;
        } else {
          cart.splice(idx, 1);
        }
        saveCart(cart);
        renderCart();
      });
    });

    // Plus Buttons
    document.querySelectorAll('.plus-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = btn.dataset.index;
        cart[idx].quantity += 1;
        saveCart(cart);
        renderCart();
      });
    });

    // Remove Buttons
    document.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = btn.dataset.index;
        const removedItem = cart[idx].name;
        cart.splice(idx, 1);
        saveCart(cart);
        renderCart();
        showToast(`Removed ${removedItem} from cart.`);
      });
    });
  }

  renderCart();
}

// --- 6. GLOBAL PRODUCT CARD CLICK HANDLING ---
function initProductCards() {
  const cards = document.querySelectorAll('.product-card');
  cards.forEach(card => {
    const link = card.querySelector('a');
    if (link) {
      card.style.cursor = 'pointer';
      card.addEventListener('click', (e) => {
        // Prevent trigger if clicking directly inside an explicit inner button or link
        if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A') {
          window.location.href = link.getAttribute('href');
        }
      });
    }
  });
}

// --- 7. UX FEEDBACK (Toast Notification) ---
function showToast(message) {
  let toast = document.getElementById('netsorna-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'netsorna-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #000;
      color: #fff;
      padding: 12px 20px;
      border-radius: 4px;
      font-size: 0.82rem;
      z-index: 9999;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: opacity 0.3s ease;
      opacity: 0;
    `;
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.opacity = '1';

  setTimeout(() => {
    toast.style.opacity = '0';
  }, 3000);
}

// --- 8. INITIALIZE ON DOM READY ---
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  updateCartBadge();
  initProductPage();
  initCartPage();
  initProductCards();
});
