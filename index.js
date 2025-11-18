
(() => {
  // CURRENCY: ZAR (South African Rand)
  const CURRENCY = {
    code: 'ZAR',
    symbol: 'R',
    position: 'before'
  };

  function formatPrice(amount) {
    const formatted = amount.toLocaleString('en-ZA');
    return CURRENCY.position === 'after'
      ? `${formatted}${CURRENCY.symbol}`
      : `${CURRENCY.symbol}${formatted}`;
  }

  // PRODUCT DATA
  const products = [
    {
      id: 1,
      name: "Nike Airforce 1",
      price: 1799,
      size: "9",
      color: "white",
      img: "images/sneaker_pic_6.jpg",
      fallback: "images/sneaker_pic_6.jpg",
      url: "Exclusives.html"
    },
    {
      id: 2,
      name: "Jordan 1",
      price: 2190,
      size: "10",
      color: "red",
      img: "images/sneaker_pic_12.avif",
      fallback: "images/sneaker_pic_12.jpg",
      url: "Sales.html"
    },
    {
      id: 3,
      name: "Trail Blaze X",
      price: 1290,
      size: "8",
      color: "white",
      img: "images/sneaker_pic_3.avif",
      fallback: "images/sneaker_pic_3.jpg",
      url: "Exclusives.html"
    },
    {
      id: 4,
      name: "Classic Eco",
      price: 890,
      size: "7",
      color: "black",
      img: "images/sneaker_pic_7.jpg",
      fallback: "images/sneaker_pic_7.jpg",
      url: "Sales.html"
    },
    {
      id: 5,
      name: "Cloud Walker",
      price: 1499,
      size: "11",
      color: "blue",
      img: "images/sneaker_pic_1.avif",
      fallback: "images/sneaker_pic_1.jpg",
      url: "Exclusives.html"
    }
  ];

  // DOM Elements
  const container    = document.getElementById('productsGrid') || document.getElementById('carousel');
  const modal        = document.getElementById('quickView');
  const modalContent = document.getElementById('modalContent');
  const closeBtn     = document.querySelector('.close-modal');
  const schemaEl     = document.getElementById('productSchema');
  const sizeSel      = document.getElementById('sizeFilter');
  const colorSel     = document.getElementById('colorFilter');
  const priceSel     = document.getElementById('priceFilter');

  // Create Product Card — FIXED IMAGE LOGIC
  function createCard(p) {
    const card = document.createElement('article');
    card.className = 'sneaker-card';
    card.dataset.size  = p.size;
    card.dataset.color = p.color;
    card.dataset.price = p.price;

    // SAFE: Only convert .avif → .webp, leave .jpg alone
    const webpSrc = p.img.endsWith('.avif')
      ? p.img.replace(/\.avif$/i, '.webp')
      : p.img;

    card.innerHTML = `
      <a href="${p.url}" class="product-link" aria-label="View ${p.name}">
        <picture>
          <source srcset="${p.img}" type="image/avif">
          <source srcset="${webpSrc}" type="image/webp">
          <img loading="lazy" src="${p.fallback}" alt="${p.name}" width="300" height="300">
        </picture>
        <h3>${p.name}</h3>
        <p class="price">${formatPrice(p.price)}</p>
        <button class="quick-view-btn" data-id="${p.id}" aria-label="Quick view ${p.name}">Quick View</button>
      </a>
    `;

    card.querySelector('.quick-view-btn').addEventListener('click', e => {
      e.preventDefault();
      showQuickView(p);
    });

    return card;
  }

  // Render
  function render(items) {
    carousel.innerHTML = '';
    items.forEach(p => carousel.appendChild(createCard(p)));
    initCarousel();
    generateSchema(items);
  }

  // Carousel
  function initCarousel() {
    const cards = carousel.querySelectorAll('.sneaker-card');
    if (!cards.length) return;

    if (!carousel.querySelector('.carousel-prev')) {
      const prev = document.createElement('button');
      prev.className = 'carousel-prev';
      prev.innerHTML = 'Previous';
      prev.setAttribute('aria-label', 'Previous');
      const next = document.createElement('button');
      next.className = 'carousel-next';
      next.innerHTML = 'Next';
      next.setAttribute('aria-label', 'Next');
      carousel.append(prev, next);
    }

    let index = 0;
    const slide = () => carousel.style.transform = `translateX(-${index * 320}px)`;

    carousel.querySelector('.carousel-prev').onclick = () => {
      index = index <= 0 ? cards.length - 1 : index - 1;
      slide();
    };
    carousel.querySelector('.carousel-next').onclick = () => {
      index = index >= cards.length - 1 ? 0 : index + 1;
      slide();
    };

    let auto = setInterval(() => {
      index = (index + 1) % cards.length;
      slide();
    }, 4000);

    carousel.addEventListener('mouseenter', () => clearInterval(auto));
    carousel.addEventListener('mouseleave', () => {
      auto = setInterval(() => { index = (index + 1) % cards.length; slide(); }, 4000);
    });
  }

  // Quick View
  function showQuickView(p) {
    modalContent.innerHTML = `
      <h2>${p.name}</h2>
      <img src="${p.fallback}" alt="${p.name}" loading="lazy" style="max-width:100%;height:auto;">
      <p><strong>Price:</strong> ${formatPrice(p.price)}</p>
      <p><strong>Size:</strong> ${p.size} US</p>
      <p><strong>Color:</strong> ${p.color}</p>
      <button class="add-to-cart" data-id="${p.id}">Add to Cart</button>
      <a href="${p.url}" class="full-details">View Full Details</a>
    `;

    modalContent.querySelector('.add-to-cart').onclick = () => {
      let cart = JSON.parse(localStorage.getItem('cart') || '[]');
      if (!cart.some(i => i.id === p.id)) {
        cart.push({ id: p.id, name: p.name, price: p.price, qty: 1 });
        localStorage.setItem('cart', JSON.stringify(cart));
        alert(`${p.name} added to cart!`);
      } else {
        alert('Already in cart');
      }
    };

    modal.showModal();
  }

  closeBtn.onclick = () => modal.close();
  modal.addEventListener('click', e => { if (e.target === modal) modal.close(); });

  // Filters
  function applyFilters() {
    const size = sizeSel.value;
    const color = colorSel.value;
    const [min, max] = priceSel.value ? priceSel.value.split('-').map(Number) : [];

    const filtered = products.filter(p => {
      if (size && p.size !== size) return false;
      if (color && p.color !== color) return false;
      if (min !== undefined && p.price < min) return false;
      if (max && p.price > max) return false;
      return true;
    });

    render(filtered);

    const params = new URLSearchParams();
    if (size) params.set('size', size);
    if (color) params.set('color', color);
    if (priceSel.value) params.set('price', priceSel.value);
    history.replaceState(null, '', `${location.pathname}?${params}`);
  }

  [sizeSel, colorSel, priceSel].forEach(s => s.addEventListener('change', applyFilters));

  // Schema.org
  function generateSchema(items) {
    const schema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "itemListElement": items.map((p, i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "item": {
          "@type": "Product",
          "name": p.name,
          "image": new URL(p.fallback, location.href).href,
          "url": new URL(p.url, location.href).href,
          "offers": {
            "@type": "Offer",
            "priceCurrency": CURRENCY.code,
            "price": p.price,
            "availability": "https://schema.org/InStock"
          }
        }
      }))
    };
    schemaEl.textContent = JSON.stringify(schema, null, 2);
  }

  // Init
  function init() {
    const params = new URLSearchParams(location.search);
    if (params.get('size')) sizeSel.value = params.get('size');
    if (params.get('color')) colorSel.value = params.get('color');
    if (params.get('price')) priceSel.value = params.get('price');
    applyFilters();
  }

  document.addEventListener('DOMContentLoaded', init);
})();


const sneakers = [
  {
    id: 1,
    name: "Nike Airforce 1",
    price: 1799,
    image: "images/nike-airforce-1.jpg",
    size: [7, 8, 9, 10, 11],
    color: ["white", "black"]
  },
  {
    id: 2,
    name: "Jordan 1",
    price: 2190,
    image: "images/jordan-1.jpg",
    size: [8, 9, 10],
    color: ["red", "black"]
  },
  {
    id: 3,
    name: "Adidas Runner X",
    price: 1290,
    image: "images/trail-blaze-x.jpg",
    size: [7, 9, 11],
    color: ["blue"]
  },
  {
    id: 4,
    name: "Classic Eco",
    price: 890,
    image: "images/classic-eco.jpg",
    size: [7, 8, 9, 10],
    color: ["white"]
  }
];

/* -------------------------------------------------
   RENDER ONE CARD
   ------------------------------------------------- */
function createCard(s) {
  const card = document.createElement('article');
  card.className = 'product-card';
  card.dataset.id = s.id;
  card.dataset.price = s.price;
  card.dataset.sizes = s.size.join(' ');
  card.dataset.colors = s.color.join(' ');

  card.innerHTML = `
    <img src="${s.image}" alt="${s.name}" class="product-img" loading="lazy">
    <h3>${s.name}</h3>
    <p class="price">R${s.price.toLocaleString()}</p>
    <button class="quick-view" data-id="${s.id}">Quick View</button>
  `;

  return card;
}

/* -------------------------------------------------
   RENDER ALL (or filtered) sneakers
   ------------------------------------------------- */
function renderSneakers(list) {
  const grid = document.getElementById('productsGrid');
  grid.innerHTML = '';                 // clear
  list.forEach(s => grid.appendChild(createCard(s)));
}

/* -------------------------------------------------
   FILTER LOGIC
   ------------------------------------------------- */
function applyFilters() {
  const sizeSel   = document.getElementById('sizeFilter').value;
  const colorSel  = document.getElementById('colorFilter').value;
  const priceSel  = document.getElementById('priceFilter').value;

  let filtered = sneakers;

  if (sizeSel) {
    filtered = filtered.filter(s => s.size.includes(parseInt(sizeSel)));
  }
  if (colorSel) {
    filtered = filtered.filter(s => s.color.includes(colorSel));
  }
  if (priceSel) {
    const [min, max] = priceSel.split('-').map(Number);
    filtered = filtered.filter(s => s.price >= min && (isNaN(max) || s.price <= max));
  }

  renderSneakers(filtered);
}

/* -------------------------------------------------
   QUICK-VIEW MODAL 
   ------------------------------------------------- */
function openModal(id) {
  const s = sneakers.find(x => x.id === id);
  if (!s) return;

  const modal = document.getElementById('quickView');
  const content = document.getElementById('modalContent');

  content.innerHTML = `
    <img src="${s.image}" alt="${s.name}" style="max-width:100%;border-radius:8px;">
    <h3>${s.name}</h3>
    <p><strong>Price:</strong> R${s.price.toLocaleString()}</p>
    <p><strong>Sizes:</strong> ${s.size.join(', ')}</p>
    <p><strong>Colors:</strong> ${s.color.join(', ')}</p>
  `;

  modal.showModal();
}

/* -------------------------------------------------
   EVENT LISTENERS
   ------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  // Initial render
  renderSneakers(sneakers);

  // Filters
  ['sizeFilter', 'colorFilter', 'priceFilter'].forEach(id => {
    document.getElementById(id).addEventListener('change', applyFilters);
  });

  // Quick-view buttons (delegated)
  document.getElementById('productsGrid').addEventListener('click', e => {
    const btn = e.target.closest('.quick-view');
    if (btn) openModal(parseInt(btn.dataset.id));
  });

  // Close modal
  document.querySelector('.close-modal').addEventListener('click', () => {
    document.getElementById('quickView').close();
  });
});

// Enquiry Form
document.getElementById('enquiryForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const form = e.target;
  const res = document.getElementById('enquiryResponse');

  const data = {
    name: form.ename.value.trim(),
    email: form.eemail.value.trim(),
    product: form.eproduct.value,
    interest: form.einterest.value,
    message: form.emessage.value.trim()
  };

  // Client-side validation
  if (!data.name || !data.email || !data.product || !data.interest || !data.message) {
    showMsg(res, 'Please fill all fields.', 'error');
    return;
  }


  try {
    // const response = await fetch('https://api.example.com/enquiry', { method: 'POST', body: JSON.stringify(data) });
    showMsg(res, getEnquiryResponse(data), 'success');
    form.reset();
  } catch {
    showMsg(res, 'Failed to send. Try again.', 'error');
  }
});

// Contact Form
document.getElementById('contactForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const res = document.getElementById('contactResponse');
  showMsg(res, 'Message sent! We’ll reply within 24 hours.', 'success');
  e.target.reset();
});

function showMsg(el, msg, type) {
  el.textContent = msg;
  el.style.color = type === 'error' ? 'red' : 'green';
}

function getEnquiryResponse(d) {
  if (d.interest === 'buy') return `Thanks, ${d.name}! The ${d.product} is R${products.find(p => p.name.includes(d.product.split(' ')[0]))?.price || '???'} and in stock.`;
  if (d.interest === 'sponsor') return 'Sponsorship info sent to your email!';
  return 'Thanks for your interest! We’ll contact you soon.';
}

