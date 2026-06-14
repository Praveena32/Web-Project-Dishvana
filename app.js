/* ==========================================================================
   State & Fallback Data
   ========================================================================== */
const STATE = {
    menuItems: [],
    cart: [],
    currentCategory: 'all',
    searchQuery: '',
    theme: 'dark'
};

// Client-side fallback menu database to ensure the demo is robust
// even when run directly without starting the Python backend.
const BACKUP_MENU = [
    {
        "id": "p1",
        "name": "Signature Colombo Spicy Chicken Pizza",
        "category": "pizza",
        "price": 2400,
        "description": "Tender tandoori chicken, red onions, green chilies, thick mozzarella, and a blend of local northern spices on a hand-stretched crust.",
        "spicy_level": 3,
        "is_popular": true,
        "image": "images/spicy_chicken_pizza.png"
    },
    {
        "id": "p2",
        "name": "Devilled Seafood Pizza",
        "category": "pizza",
        "price": 2800,
        "description": "Spicy devilled prawns, cuttlefish, roasted onions, capsicum, and premium melted mozzarella with a rich chili-tomato glaze.",
        "spicy_level": 2,
        "is_popular": true,
        "image": "images/seafood_pizza.png"
    },
    {
        "id": "p3",
        "name": "Double Cheese Margherita Pizza",
        "category": "pizza",
        "price": 1800,
        "description": "Traditional tomato sauce, double mozzarella cheese, fresh garden basil, and a light drizzle of extra virgin olive oil.",
        "spicy_level": 0,
        "is_popular": false,
        "image": "images/margherita_pizza.png"
    },
    {
        "id": "r1",
        "name": "Dishvana Special Fried Rice",
        "category": "rice",
        "price": 1650,
        "description": "Premium wok-fried basmati rice tossed with tender chicken, prawns, eggs, fresh carrots, and spring onions. Served with a side of hot chili paste.",
        "spicy_level": 2,
        "is_popular": true,
        "image": "images/special_fried_rice.png"
    },
    {
        "id": "r2",
        "name": "Spicy Mongolian Veg Rice",
        "category": "rice",
        "price": 1300,
        "description": "Aromatic rice stir-fried with fresh farm vegetables, golden mushrooms, paneer cubes, and authentic Mongolian fusion spices.",
        "spicy_level": 1,
        "is_popular": false,
        "image": "images/mongolian_veg_rice.png"
    },
    {
        "id": "s1",
        "name": "Classic Garlic Bread with Cheese",
        "category": "sides",
        "price": 750,
        "description": "Artisanal baguette slices toasted with rich garlic butter, herbs, and topped with melted bubbly mozzarella.",
        "spicy_level": 0,
        "is_popular": false,
        "image": "images/garlic_bread.png"
    },
    {
        "id": "s2",
        "name": "Spicy Sri Lankan Chicken Wings",
        "category": "sides",
        "price": 1100,
        "description": "Deep-fried crispy chicken wings tossed in a sweet, sour, and fiery Sri Lankan devilled glaze, garnished with spring onions.",
        "spicy_level": 2,
        "is_popular": true,
        "image": "images/devilled_wings.png"
    },
    {
        "id": "d1",
        "name": "Tropical Passion Fruit Mojito",
        "category": "drinks",
        "price": 650,
        "description": "A refreshing blend of fresh passion fruit pulp, crushed mint leaves, lime juice, brown sugar, and bubbly soda over crushed ice.",
        "spicy_level": 0,
        "is_popular": true,
        "image": "images/passion_mojito.png"
    },
    {
        "id": "d2",
        "name": "Cold Brew Iced Coffee",
        "category": "drinks",
        "price": 700,
        "description": "Rich locally-sourced coffee cold-brewed for 12 hours, blended with chilled milk, and topped with a creamy vanilla ice cream float.",
        "spicy_level": 0,
        "is_popular": false,
        "image": "images/iced_coffee.png"
    }
];

/* ==========================================================================
   Helper Functions
   ========================================================================== */
function formatLKR(amount) {
    return `LKR ${amount.toLocaleString()}`;
}

function getSpicyIndicator(level) {
    if (level === 0) return '';
    let chillies = '';
    for (let i = 0; i < level; i++) {
        chillies += '🌶️';
    }
    return `<span class="card-badge-spicy">${chillies} Spicy</span>`;
}

/* ==========================================================================
   Fetch & Load Data
   ========================================================================== */
async function fetchMenuData() {
    const grid = document.getElementById('menu-items-grid');
    try {
        const response = await fetch('/api/menu');
        if (!response.ok) {
            throw new Error(`Server returned status: ${response.status}`);
        }
        STATE.menuItems = await response.json();
        console.log("Menu successfully loaded from API.");
    } catch (error) {
        console.warn("API unavailable, loading local fallback menu database.", error);
        STATE.menuItems = BACKUP_MENU;
    }
    renderMenu();
}

/* ==========================================================================
   Menu Renderer
   ========================================================================== */
function renderMenu() {
    const grid = document.getElementById('menu-items-grid');
    grid.innerHTML = '';
    
    // Filter items based on category and search query
    const filteredItems = STATE.menuItems.filter(item => {
        const matchesCategory = STATE.currentCategory === 'all' || item.category === STATE.currentCategory;
        const matchesSearch = item.name.toLowerCase().includes(STATE.searchQuery.toLowerCase()) || 
                              item.description.toLowerCase().includes(STATE.searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (filteredItems.length === 0) {
        grid.innerHTML = `
            <div class="menu-loading">
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                <p>No dishes found matching your selection.</p>
            </div>
        `;
        return;
    }

    filteredItems.forEach(item => {
        const card = document.createElement('div');
        card.className = 'food-card';
        card.id = `food-card-${item.id}`;
        
        let badgesHtml = '';
        if (item.is_popular) {
            badgesHtml += `<span class="card-badge-popular">Popular</span>`;
        }
        const spicyHtml = getSpicyIndicator(item.spicy_level);
        if (spicyHtml) {
            badgesHtml += spicyHtml;
        }

        card.innerHTML = `
            <div class="card-image-container">
                <div class="card-badges">${badgesHtml}</div>
                <img src="${item.image}" alt="${item.name}" class="food-image" loading="lazy" onerror="this.src='https://placehold.co/400x300/18181b/ffffff?text=${encodeURIComponent(item.name)}'">
            </div>
            <div class="card-details">
                <h3 class="food-title">${item.name}</h3>
                <p class="food-description">${item.description}</p>
                <div class="card-footer">
                    <span class="food-price">${formatLKR(item.price)}</span>
                    <button class="add-to-cart-btn" data-id="${item.id}" aria-label="Add to Order">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        
        grid.appendChild(card);
    });

    // Add event listeners to the new buttons
    const addButtons = grid.querySelectorAll('.add-to-cart-btn');
    addButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const itemId = btn.getAttribute('data-id');
            addToCart(itemId);
        });
    });
}

/* ==========================================================================
   Cart State Manager
   ========================================================================== */
function addToCart(itemId) {
    const item = STATE.menuItems.find(i => i.id === itemId);
    if (!item) return;

    const existingIndex = STATE.cart.findIndex(cartItem => cartItem.id === itemId);
    if (existingIndex > -1) {
        STATE.cart[existingIndex].quantity += 1;
    } else {
        STATE.cart.push({
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: 1
        });
    }
    
    // Animate cart trigger badge
    const badge = document.getElementById('cart-counter');
    badge.classList.remove('pulse-badge');
    void badge.offsetWidth; // Trigger reflow to restart animation
    badge.style.animation = 'none';
    setTimeout(() => {
        badge.style.animation = '';
    }, 10);

    renderCart();
}

function changeQuantity(itemId, delta) {
    const index = STATE.cart.findIndex(i => i.id === itemId);
    if (index === -1) return;

    STATE.cart[index].quantity += delta;
    if (STATE.cart[index].quantity <= 0) {
        STATE.cart.splice(index, 1);
    }
    renderCart();
}

function removeFromCart(itemId) {
    STATE.cart = STATE.cart.filter(i => i.id !== itemId);
    renderCart();
}

function renderCart() {
    const container = document.getElementById('cart-items-container');
    const subtotalText = document.getElementById('cart-subtotal');
    const totalText = document.getElementById('cart-total');
    const badge = document.getElementById('cart-counter');
    const footer = document.getElementById('cart-summary-footer');

    // Update global badge counter
    const totalQuantity = STATE.cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.innerText = totalQuantity;
    
    if (STATE.cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart-message">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <p>Your basket is empty.</p>
                <button class="btn btn-secondary btn-sm" id="cart-empty-browse-inline">Browse Menu</button>
            </div>
        `;
        footer.style.display = 'none';
        
        // Setup empty drawer browse click
        const browseInline = document.getElementById('cart-empty-browse-inline');
        if (browseInline) {
            browseInline.addEventListener('click', () => {
                toggleCartDrawer(false);
                document.getElementById('menu-section').scrollIntoView({ behavior: 'smooth' });
            });
        }
        return;
    }

    footer.style.display = 'block';
    container.innerHTML = '';

    let subtotal = 0;
    
    STATE.cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        const cartItemDiv = document.createElement('div');
        cartItemDiv.className = 'cart-item';
        cartItemDiv.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-image" onerror="this.src='https://placehold.co/100x100/18181b/ffffff?text=${encodeURIComponent(item.name)}'">
            <div class="cart-item-info">
                <div>
                    <h4 class="cart-item-title">${item.name}</h4>
                    <span class="cart-item-price">${formatLKR(item.price)}</span>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-controls">
                        <button class="qty-btn" onclick="changeQuantity('${item.id}', -1)">-</button>
                        <span class="qty-val">${item.quantity}</span>
                        <button class="qty-btn" onclick="changeQuantity('${item.id}', 1)">+</button>
                    </div>
                    <button class="item-remove" onclick="removeFromCart('${item.id}')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        Remove
                    </button>
                </div>
            </div>
        `;
        container.appendChild(cartItemDiv);
    });

    subtotalText.innerText = formatLKR(subtotal);
    totalText.innerText = formatLKR(subtotal); // Delivery is free
}

// Bind local functions globally for HTML click events
window.changeQuantity = changeQuantity;
window.removeFromCart = removeFromCart;

/* ==========================================================================
   UI Event Bindings
   ========================================================================== */
function toggleCartDrawer(isOpen) {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    if (isOpen) {
        drawer.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Lock body scroll
    } else {
        drawer.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = ''; // Release body scroll
    }
}

function toggleTheme() {
    const root = document.documentElement;
    const isLight = root.classList.toggle('light-mode');
    STATE.theme = isLight ? 'light' : 'dark';
    
    // Switch logo sources dynamically based on theme
    const logoImg = document.querySelector('.logo-img');
    const footerLogoImg = document.querySelector('.footer-logo-img');
    
    if (isLight) {
        if (logoImg) logoImg.src = 'images/logo_light.png';
        if (footerLogoImg) footerLogoImg.src = 'images/logo_light.png';
    } else {
        if (logoImg) logoImg.src = 'images/logo_new.png';
        if (footerLogoImg) footerLogoImg.src = 'images/logo_new.png';
    }

    // Update theme toggle icon visually
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (isLight) {
        themeBtn.innerHTML = `
            <svg class="moon-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
        `;
    } else {
        themeBtn.innerHTML = `
            <svg class="sun-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.72" x2="5.64" y2="18.3"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
        `;
    }
}

let currentOrderDetails = null; // store current order for redownload option

function showCheckoutStep(step) {
    document.querySelectorAll('.checkout-step').forEach(el => el.classList.remove('active'));
    if (step === 'form') {
        document.getElementById('checkout-step-form').classList.add('active');
    } else if (step === 'loading') {
        document.getElementById('checkout-step-loading').classList.add('active');
    } else if (step === 'success') {
        document.getElementById('checkout-step-success').classList.add('active');
    }
}

function triggerCheckoutModal() {
    if (STATE.cart.length === 0) return;
    
    // Clear billing inputs
    document.getElementById('cust-name').value = '';
    document.getElementById('cust-phone').value = '';
    document.getElementById('cust-email').value = '';
    document.getElementById('cust-address').value = '';
    
    // Set default payment method to payhere
    document.getElementById('method-payhere').checked = true;
    document.getElementById('pay-card-payhere').classList.add('active');
    document.getElementById('pay-card-cod').classList.remove('active');
    
    // Calculate total
    const total = STATE.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('checkout-total-amt').innerText = formatLKR(total);
    
    // Switch to step 1 (form)
    showCheckoutStep('form');
    
    // Hide Cart Drawer
    toggleCartDrawer(false);
    
    // Open Modal
    const modal = document.getElementById('checkout-modal-overlay');
    modal.classList.add('active');
}

function submitOrderBackend(orderId, paymentMethod, paymentId = '') {
    const customer = {
        name: document.getElementById('cust-name').value.trim(),
        phone: document.getElementById('cust-phone').value.trim(),
        email: document.getElementById('cust-email').value.trim(),
        address: document.getElementById('cust-address').value.trim()
    };
    
    const totalAmount = STATE.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const payload = {
        orderId,
        cart: STATE.cart,
        customer,
        paymentMethod,
        paymentId
    };

    showCheckoutStep('loading');

    fetch('/api/confirm-order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            // Save current order details for potential PDF re-downloads
            currentOrderDetails = {
                orderId,
                customer,
                cart: [...STATE.cart],
                total: totalAmount,
                paymentMethod
            };

            // Update Success screen details
            document.getElementById('success-order-id').innerText = '#' + orderId;
            document.getElementById('success-order-total').innerText = formatLKR(totalAmount);
            
            // Switch to Success view
            showCheckoutStep('success');
            
            // Trigger PDF Download
            downloadInvoicePDF(orderId, customer, STATE.cart, totalAmount, paymentMethod);
            
            // Clear checkout cart state
            STATE.cart = [];
            renderCart();
        } else {
            alert('Failed to place order: ' + (data.error || 'Unknown error'));
            showCheckoutStep('form');
        }
    })
    .catch(err => {
        console.error('Order submission error:', err);
        alert('Error placing order. Please try again.');
        showCheckoutStep('form');
    });
}

function downloadInvoicePDF(orderId, customer, cartItems, total, paymentMethod) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // 1. Branding Header Bar
    doc.setFillColor(10, 10, 12); // Premium dark background
    doc.rect(0, 0, 210, 45, 'F');
    
    // Title
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(245, 158, 11); // Amber Gold
    doc.setFontSize(24);
    doc.text("DISHVANA COLOMBO", 15, 20);
    
    // Tagline
    doc.setFont("Helvetica", "oblique");
    doc.setTextColor(220, 220, 220);
    doc.setFontSize(9);
    doc.text("Premium Artisanal Pizza & Sri Lankan Fusions", 15, 27);
    
    // Address Info
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(180, 180, 180);
    doc.setFontSize(8);
    doc.text("No.01, Main Street, Colombo, Sri Lanka", 15, 33);
    doc.text("Hotline: +94 11 234 5678 | info@dishvanacolombo.lk", 15, 38);

    // 2. Invoice Meta Details (Right Aligned in Header)
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text("INVOICE RECEIPT", 145, 18);
    
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(220, 220, 220);
    doc.setFontSize(9);
    doc.text(`Ref: #ORD-${orderId}`, 145, 25);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 145, 30);
    doc.text(`Time: ${new Date().toLocaleTimeString()}`, 145, 35);
    doc.text(`Status: Paid (${paymentMethod.toUpperCase()})`, 145, 40);

    // 3. Customer Delivery Information Block
    doc.setFillColor(243, 244, 246); // light grey block
    doc.rect(15, 55, 180, 32, 'F');
    
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(18, 18, 21);
    doc.setFontSize(10);
    doc.text("DELIVER TO:", 20, 62);
    
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(55, 65, 81);
    doc.setFontSize(9);
    doc.text(`Customer Name:   ${customer.name}`, 20, 68);
    doc.text(`Contact Phone:   ${customer.phone}`, 20, 73);
    doc.text(`Email Address:   ${customer.email}`, 20, 78);
    doc.text(`Delivery Place:  ${customer.address}`, 20, 83);

    // 4. Items List Table Header
    doc.setFillColor(18, 18, 21); // Dark grey table header
    doc.rect(15, 95, 180, 8, 'F');
    
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text("Description", 18, 100);
    doc.text("Qty", 110, 100);
    doc.text("Unit Price", 135, 100);
    doc.text("Total (LKR)", 165, 100);

    // 5. Populate Items
    doc.setTextColor(31, 41, 55);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    
    let y = 110;
    cartItems.forEach((item, index) => {
        // Draw light horizontal separator line for every row except the first
        if (index > 0) {
            doc.setDrawColor(229, 231, 235);
            doc.line(15, y - 5, 195, y - 5);
        }
        
        doc.text(item.name, 18, y);
        doc.text(item.quantity.toString(), 112, y);
        doc.text(formatLKR(item.price), 135, y);
        doc.text(formatLKR(item.price * item.quantity), 165, y);
        y += 10;
    });

    // 6. Summary Totals Box
    doc.setDrawColor(18, 18, 21);
    doc.setLineWidth(0.5);
    doc.line(15, y - 2, 195, y - 2);
    
    y += 8;
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Subtotal:", 130, y);
    doc.text(formatLKR(total), 195, y, { align: "right" });
    
    y += 6;
    doc.text("Delivery Service fee:", 130, y);
    doc.text("LKR 0 (FREE)", 195, y, { align: "right" });
    
    y += 8;
    doc.setFillColor(245, 158, 11);
    doc.rect(125, y - 5, 70, 8, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.text("Total Paid:", 130, y);
    doc.text(formatLKR(total), 192, y, { align: "right" });

    // 7. Footer Greetings
    doc.setTextColor(156, 163, 175);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Thank you for ordering with Dishvana Colombo!", 70, 275);
    doc.text("This receipt was generated dynamically and constitutes proof of payment.", 54, 280);

    // 8. Save/Download File
    doc.save(`Dishvana-Order-${orderId}.pdf`);
}


/* ==========================================================================
   Initialization & Listeners
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Fetch Menu Items
    fetchMenuData();
    
    // 2. Sticky Header Scroll Effect
    const header = document.getElementById('main-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 3. Category Filter Tabs
    const tabsContainer = document.getElementById('menu-category-tabs');
    tabsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('tab-btn')) {
            // Manage Active Class
            tabsContainer.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            
            // Set category state and re-render
            STATE.currentCategory = e.target.getAttribute('data-category');
            renderMenu();
        }
    });

    // 4. Live Search Input
    const searchInput = document.getElementById('menu-search');
    searchInput.addEventListener('input', (e) => {
        STATE.searchQuery = e.target.value;
        renderMenu();
    });

    // 5. Cart Drawer Handlers
    document.getElementById('cart-trigger').addEventListener('click', () => toggleCartDrawer(true));
    document.getElementById('cart-close-btn').addEventListener('click', () => toggleCartDrawer(false));
    document.getElementById('cart-overlay').addEventListener('click', () => toggleCartDrawer(false));
    
    const inlineBrowse = document.getElementById('cart-empty-browse');
    if (inlineBrowse) {
        inlineBrowse.addEventListener('click', () => {
            toggleCartDrawer(false);
        });
    }

    // 6. Theme Toggle Handler
    document.getElementById('theme-toggle-btn').addEventListener('click', toggleTheme);

    // 7. Checkout Trigger Handlers
    document.getElementById('checkout-trigger').addEventListener('click', triggerCheckoutModal);
    
    // 8. Close Modal Handler (Success Confirmation Done button)
    document.getElementById('modal-close-btn').addEventListener('click', () => {
        // Hide Modal
        document.getElementById('checkout-modal-overlay').classList.remove('active');
        // Clear Cart
        STATE.cart = [];
        renderCart();
    });

    // 8.1. Cancel Checkout (Close Form without clearing cart)
    const cancelBtn = document.getElementById('checkout-cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            document.getElementById('checkout-modal-overlay').classList.remove('active');
        });
    }

    // 8.2. Payment Method Selector Cards
    const payCardPayHere = document.getElementById('pay-card-payhere');
    const payCardCOD = document.getElementById('pay-card-cod');
    if (payCardPayHere && payCardCOD) {
        payCardPayHere.addEventListener('click', () => {
            document.getElementById('method-payhere').checked = true;
            payCardPayHere.classList.add('active');
            payCardCOD.classList.remove('active');
        });
        payCardCOD.addEventListener('click', () => {
            document.getElementById('method-cod').checked = true;
            payCardCOD.classList.add('active');
            payCardPayHere.classList.remove('active');
        });
    }

    // 8.3. Checkout Form Submit Handler
    const billingForm = document.getElementById('checkout-billing-form');
    if (billingForm) {
        billingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('cust-name').value.trim();
            const phone = document.getElementById('cust-phone').value.trim();
            const email = document.getElementById('cust-email').value.trim();
            const address = document.getElementById('cust-address').value.trim();
            
            if (!name || !phone || !email || !address) {
                alert('Please fill in all required fields.');
                return;
            }

            const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
            const totalAmount = STATE.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;

            if (paymentMethod === 'payhere') {
                showCheckoutStep('loading');
                
                // Fetch MD5 secure signature hash from Node backend
                fetch('/api/payhere-hash', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        order_id: orderId,
                        amount: totalAmount,
                        currency: 'LKR'
                    })
                })
                .then(res => res.json())
                .then(hashData => {
                    // Define event handlers
                    window.payhere.onCompleted = function(completedOrderId) {
                        console.log("PayHere Checkout completed successfully:", completedOrderId);
                        submitOrderBackend(orderId, 'payhere', 'PAYHERE-' + Date.now());
                    };
                    
                    window.payhere.onDismissed = function() {
                        console.log("PayHere checkout dismissed by user");
                        showCheckoutStep('form');
                    };
                    
                    window.payhere.onError = function(error) {
                        console.error("PayHere processing error:", error);
                        alert("Payment Failed: " + error);
                        showCheckoutStep('form');
                    };

                    // Populate PayHere payment object details (Sandbox mode)
                    const payment = {
                        "sandbox": true,
                        "merchant_id": hashData.merchant_id,
                        "return_url": window.location.href,
                        "cancel_url": window.location.href,
                        "notify_url": window.location.origin + "/api/payhere-notify",
                        "order_id": orderId,
                        "items": "Dishvana Colombo Pizza Order",
                        "amount": totalAmount.toFixed(2),
                        "currency": "LKR",
                        "hash": hashData.hash,
                        "first_name": name,
                        "last_name": "",
                        "email": email,
                        "phone": phone,
                        "address": address,
                        "city": "Colombo",
                        "country": "Sri Lanka"
                    };
                    
                    // Start payment gateway popup
                    window.payhere.startPayment(payment);
                })
                .catch(err => {
                    console.error("PayHere signature backend failure:", err);
                    alert("Unable to generate secure signature. Reverting.");
                    showCheckoutStep('form');
                });
            } else {
                // Cash On Delivery Flow
                submitOrderBackend(orderId, 'cod');
            }
        });
    }

    // 8.4. Invoice Receipt Re-download
    const reDownloadBtn = document.getElementById('success-pdf-re-download');
    if (reDownloadBtn) {
        reDownloadBtn.addEventListener('click', () => {
            if (currentOrderDetails) {
                downloadInvoicePDF(
                    currentOrderDetails.orderId,
                    currentOrderDetails.customer,
                    currentOrderDetails.cart,
                    currentOrderDetails.total,
                    currentOrderDetails.paymentMethod
                );
            }
        });
    }

    // 8.5. Atmosphere Gallery & Lightbox Logic
    const galleryCards = Array.from(document.querySelectorAll('.gallery-card'));
    const atmosphereTabs = document.querySelectorAll('.atmosphere-tab-btn');
    const lightbox = document.getElementById('lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-active-img');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxDesc = document.getElementById('lightbox-desc');
    const lightboxCounter = document.getElementById('lightbox-counter');
    const zoomWrapper = document.getElementById('lightbox-zoom-wrapper');
    
    let activeImages = [...galleryCards]; // keeps track of currently filtered/visible images
    let currentIndex = 0;
    
    // Zoom state
    let currentScale = 1;
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let translateX = 0;
    let translateY = 0;
    
    // Filter Gallery
    atmosphereTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active tab button
            atmosphereTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const filterValue = tab.getAttribute('data-filter');
            
            // Filter cards
            galleryCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filterValue === 'all' || category === filterValue) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
            
            // Re-populate active images list for lightbox navigation
            activeImages = galleryCards.filter(card => !card.classList.contains('hidden'));
        });
    });
    
    // Open Lightbox
    galleryCards.forEach(card => {
        card.addEventListener('click', () => {
            // Find its index in the active list
            currentIndex = activeImages.indexOf(card);
            if (currentIndex === -1) currentIndex = 0;
            
            updateLightbox();
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden'; // lock scroll
        });
    });
    
    // Update Lightbox Display
    function updateLightbox() {
        if (activeImages.length === 0) return;
        const card = activeImages[currentIndex];
        const img = card.querySelector('.gallery-img');
        const title = card.querySelector('h3').innerText;
        const desc = card.querySelector('p').innerText;
        
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightboxTitle.innerText = title;
        lightboxDesc.innerText = desc;
        
        lightboxCounter.innerText = `${currentIndex + 1} / ${activeImages.length}`;
        
        resetZoom();
    }
    
    // Navigation
    function prevImage() {
        currentIndex = (currentIndex - 1 + activeImages.length) % activeImages.length;
        updateLightbox();
    }
    
    function nextImage() {
        currentIndex = (currentIndex + 1) % activeImages.length;
        updateLightbox();
    }
    
    document.getElementById('lightbox-prev').addEventListener('click', (e) => {
        e.stopPropagation();
        prevImage();
    });
    document.getElementById('lightbox-next').addEventListener('click', (e) => {
        e.stopPropagation();
        nextImage();
    });
    
    // Zoom Logic
    const zoomInBtn = document.getElementById('zoom-in-btn');
    const zoomOutBtn = document.getElementById('zoom-out-btn');
    const zoomResetBtn = document.getElementById('zoom-reset-btn');
    
    function zoom(factor) {
        currentScale = Math.min(Math.max(currentScale * factor, 0.5), 4);
        applyTransform();
    }
    
    function resetZoom() {
        currentScale = 1;
        translateX = 0;
        translateY = 0;
        applyTransform();
    }
    
    function applyTransform() {
        zoomWrapper.style.transform = `scale(${currentScale}) translate(${translateX / currentScale}px, ${translateY / currentScale}px)`;
    }
    
    zoomInBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        zoom(1.25);
    });
    
    zoomOutBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        zoom(0.8);
    });
    
    zoomResetBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        resetZoom();
    });
    
    // Drag/Pan Logic when zoomed in
    zoomWrapper.addEventListener('mousedown', (e) => {
        if (currentScale <= 1) return; // only pan when zoomed
        isDragging = true;
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
        zoomWrapper.style.transition = 'none'; // smooth tracking
    });
    
    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
        applyTransform();
    });
    
    window.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        zoomWrapper.style.transition = 'transform 0.1s ease-out';
    });
    
    // Touch support for dragging/panning
    zoomWrapper.addEventListener('touchstart', (e) => {
        if (currentScale <= 1 || e.touches.length !== 1) return;
        isDragging = true;
        startX = e.touches[0].clientX - translateX;
        startY = e.touches[0].clientY - translateY;
        zoomWrapper.style.transition = 'none';
    });
    
    zoomWrapper.addEventListener('touchmove', (e) => {
        if (!isDragging || e.touches.length !== 1) return;
        translateX = e.touches[0].clientX - startX;
        translateY = e.touches[0].clientY - startY;
        applyTransform();
    });
    
    zoomWrapper.addEventListener('touchend', () => {
        isDragging = false;
        zoomWrapper.style.transition = 'transform 0.1s ease-out';
    });
    
    // Scroll Wheel to Zoom
    lightbox.addEventListener('wheel', (e) => {
        if (!lightbox.classList.contains('active')) return;
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.1 : 0.9;
        zoom(factor);
    }, { passive: false });
    
    // Close Lightbox
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = ''; // release scroll lock
    }
    
    document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
    document.getElementById('lightbox-overlay').addEventListener('click', closeLightbox);
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') prevImage();
        if (e.key === 'ArrowRight') nextImage();
    });

    // 9. Add Navigation Highlight Scroll Spy
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');
    
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= (sectionTop - 120)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // 10. Hero Interactive Pizza Fan Stack
    const stackContainer = document.getElementById('hero-stack-container');
    const stackItems = document.querySelectorAll('.stack-item');
    const heroName = document.getElementById('hero-item-name');
    const heroPrice = document.getElementById('hero-item-price');

    if (stackContainer && stackItems.length && heroName && heroPrice) {
        // Find default active item
        const defaultItem = document.querySelector('.stack-item.stack-center');
        const defaultName = defaultItem ? defaultItem.getAttribute('data-name') : 'Signature Spicy Chicken';
        const defaultPrice = defaultItem ? defaultItem.getAttribute('data-price') : 'LKR 2,400';

        stackItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                const name = item.getAttribute('data-name');
                const price = item.getAttribute('data-price');
                heroName.textContent = name;
                heroPrice.textContent = price;
            });
        });

        stackContainer.addEventListener('mouseleave', () => {
            heroName.textContent = defaultName;
            heroPrice.textContent = defaultPrice;
        });
    }

    // 11. Premium Custom Spoon Cursor, Follower & Steam Trails
    const cursor = document.getElementById('custom-cursor');
    const follower = document.getElementById('cursor-follower');
    
    if (cursor && follower) {
        let mouseX = 0, mouseY = 0; // Mouse position
        let followerX = 0, followerY = 0; // Follower position
        let lastSpawnX = 0, lastSpawnY = 0; // Last steam particle position
        let isMoving = false;
        
        // Track Mouse Movement
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            isMoving = true;
            
            // Show custom cursors when mouse moves inside window
            cursor.style.opacity = '1';
            follower.style.opacity = '1';

            // Food Smell (Steam) Particle Spawning logic
            const dist = Math.hypot(mouseX - lastSpawnX, mouseY - lastSpawnY);
            if (dist > 25) { // Spawn every 25px of cursor movement
                createSteamParticle(mouseX, mouseY);
                lastSpawnX = mouseX;
                lastSpawnY = mouseY;
            }
        });
        
        // Create floaty steam particles
        function createSteamParticle(x, y) {
            const particle = document.createElement('div');
            particle.className = 'steam-particle';
            
            // Add slight random offsets for organic look
            const offset = 8;
            const px = x + (Math.random() * offset - offset / 2);
            const py = y + (Math.random() * offset - offset / 2);
            
            particle.style.left = `${px}px`;
            particle.style.top = `${py}px`;
            
            // Randomize particle size slightly
            const size = Math.random() * 5 + 4; // 4px to 9px
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            document.body.appendChild(particle);
            
            // Remove after animation completes
            setTimeout(() => {
                particle.remove();
            }, 800);
        }
        
        // Smooth Cursor Follower Lerp (Linear Interpolation)
        function animateCursors() {
            // Lerp follower: 0.15 creates a smooth lag/elastic trail effect
            followerX += (mouseX - followerX) * 0.15;
            followerY += (mouseY - followerY) * 0.15;
            
            // Position spoon cursor
            cursor.style.left = `${mouseX}px`;
            cursor.style.top = `${mouseY}px`;
            
            // Position circular follower
            follower.style.left = `${followerX}px`;
            follower.style.top = `${followerY}px`;
            
            requestAnimationFrame(animateCursors);
        }
        
        // Start animation loop
        requestAnimationFrame(animateCursors);

        // Hover Effect on Interactive Elements
        const hoverTargets = 'a, button, select, input, textarea, .stack-item, .food-card, .gallery-card, .tab-btn, #logo';
        
        document.body.addEventListener('mouseover', (e) => {
            if (e.target.closest(hoverTargets)) {
                document.body.classList.add('cursor-hovering');
            }
        });
        
        document.body.addEventListener('mouseout', (e) => {
            if (e.target.closest(hoverTargets)) {
                // Check if we didn't just move to another nested hover item
                const relatedTarget = e.relatedTarget;
                if (!relatedTarget || !relatedTarget.closest(hoverTargets)) {
                    document.body.classList.remove('cursor-hovering');
                }
            }
        });

        // Click Scale Effect
        window.addEventListener('mousedown', () => {
            document.body.classList.add('cursor-clicking');
        });
        
        window.addEventListener('mouseup', () => {
            document.body.classList.remove('cursor-clicking');
        });
        
        // Hide custom cursor when leaving window
        document.addEventListener('mouseleave', () => {
            cursor.style.opacity = '0';
            follower.style.opacity = '0';
        });
        
        document.addEventListener('mouseenter', () => {
            cursor.style.opacity = '1';
            follower.style.opacity = '1';
        });
    }

    // 11.5. Comments & Reviews Section Logic
    const INITIAL_REVIEWS = [
        {
            id: "rev1",
            author: "Kanishka Bandara",
            rating: 5,
            content: "Absolutely phenomenal! The Colombo Spicy Chicken Pizza is a masterpiece—perfect level of heat and the crust is so soft and crispy at the same time. Will definitely order again!",
            date: "2026-06-10T19:30:00Z"
        },
        {
            id: "rev2",
            author: "Dilani Perera",
            rating: 5,
            content: "Dishvana has the best customer service in town. Ordering was smooth, and the food arrived piping hot. The Passion Fruit Mojito was so fresh and perfectly sweetened.",
            date: "2026-06-12T14:15:00Z"
        },
        {
            id: "rev3",
            author: "Mohamed Rizan",
            rating: 4,
            content: "Loved the Special Fried Rice! It has an authentic wok-fried flavor and generous portion size. Docking one star only because the delivery took about 5 minutes longer than expected, but the food made up for it!",
            date: "2026-06-13T21:05:00Z"
        }
    ];

    function generateStarsSVG(rating, size = 16) {
        let html = '';
        for (let i = 1; i <= 5; i++) {
            const fillClass = i <= rating ? 'filled' : 'empty';
            html += `
                <svg class="star-icon ${fillClass}" xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
            `;
        }
        return html;
    }

    function getInitials(name) {
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return parts[0][0].toUpperCase();
    }

    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }

    function sanitizeInput(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    }

    function renderReviews() {
        const container = document.getElementById('reviews-list-container');
        const avgRatingVal = document.getElementById('avg-rating-value');
        const avgStarsDisp = document.getElementById('avg-rating-stars');
        const totalReviewsCnt = document.getElementById('total-reviews-count');
        
        if (!container) return; // Guard clause if elements are missing
        
        const reviews = JSON.parse(localStorage.getItem('dishvana_reviews') || '[]');
        
        container.innerHTML = '';
        
        if (reviews.length === 0) {
            container.innerHTML = `<div class="empty-reviews">Be the first to write a review!</div>`;
            avgRatingVal.innerText = '0.0';
            avgStarsDisp.innerHTML = generateStarsSVG(0, 20);
            totalReviewsCnt.innerText = '0 Reviews';
            return;
        }
        
        let sum = 0;
        reviews.forEach(r => {
            sum += r.rating;
            
            const card = document.createElement('div');
            card.className = 'review-card';
            card.innerHTML = `
                <div class="review-card-header">
                    <div class="review-avatar">${getInitials(r.author)}</div>
                    <div class="review-author-meta">
                        <h4>${r.author}</h4>
                        <span class="review-date">${formatDate(r.date)}</span>
                    </div>
                    <div class="review-stars">
                        ${generateStarsSVG(r.rating, 14)}
                    </div>
                </div>
                <p class="review-text">${r.content}</p>
            `;
            container.appendChild(card);
        });
        
        const avg = (sum / reviews.length).toFixed(1);
        avgRatingVal.innerText = avg;
        avgStarsDisp.innerHTML = generateStarsSVG(Math.round(avg), 20);
        totalReviewsCnt.innerText = `${reviews.length} ${reviews.length === 1 ? 'Review' : 'Reviews'}`;
    }

    // Initialize reviews storage
    if (!localStorage.getItem('dishvana_reviews')) {
        localStorage.setItem('dishvana_reviews', JSON.stringify(INITIAL_REVIEWS));
    }
    renderReviews();

    // Star Selector Interactive logic
    const starSelector = document.getElementById('rating-star-selector');
    let selectedRating = 0;

    if (starSelector) {
        const starButtons = starSelector.querySelectorAll('.star-select-btn');
        
        starButtons.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                const rating = parseInt(btn.getAttribute('data-rating'));
                highlightStars(rating);
            });
            
            btn.addEventListener('mouseleave', () => {
                highlightStars(selectedRating);
            });
            
            btn.addEventListener('click', () => {
                selectedRating = parseInt(btn.getAttribute('data-rating'));
                highlightStars(selectedRating);
                document.getElementById('rating-error').classList.remove('active');
            });
        });

        function highlightStars(rating) {
            starButtons.forEach(btn => {
                const btnRating = parseInt(btn.getAttribute('data-rating'));
                if (btnRating <= rating) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        }
    }

    // Input handlers to clear error messages
    const nameInput = document.getElementById('review-author-name');
    const contentInput = document.getElementById('review-content');

    if (nameInput) {
        nameInput.addEventListener('input', () => {
            document.getElementById('name-error').classList.remove('active');
        });
    }

    if (contentInput) {
        contentInput.addEventListener('input', () => {
            document.getElementById('content-error').classList.remove('active');
        });
    }

    // Form submit listener
    const reviewForm = document.getElementById('add-review-form');
    if (reviewForm) {
        reviewForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const nameVal = nameInput.value.trim();
            const contentVal = contentInput.value.trim();
            let hasError = false;
            
            if (!nameVal) {
                document.getElementById('name-error').classList.add('active');
                hasError = true;
            }
            
            if (selectedRating === 0) {
                document.getElementById('rating-error').classList.add('active');
                hasError = true;
            }
            
            if (!contentVal) {
                document.getElementById('content-error').classList.add('active');
                hasError = true;
            }
            
            if (hasError) return;
            
            const newReview = {
                id: 'rev_' + Date.now(),
                author: sanitizeInput(nameVal),
                rating: selectedRating,
                content: sanitizeInput(contentVal),
                date: new Date().toISOString()
            };
            
            const savedReviews = JSON.parse(localStorage.getItem('dishvana_reviews') || '[]');
            savedReviews.unshift(newReview);
            localStorage.setItem('dishvana_reviews', JSON.stringify(savedReviews));
            
            // Re-render
            renderReviews();
            
            // Reset fields
            reviewForm.reset();
            selectedRating = 0;
            if (starSelector) {
                const starButtons = starSelector.querySelectorAll('.star-select-btn');
                starButtons.forEach(btn => btn.classList.remove('active'));
            }
        });
    }

    // 11.6. Realistic 3D Menu Book View Logic
    const viewGridBtn = document.getElementById('view-grid-btn');
    const viewBookBtn = document.getElementById('view-book-btn');
    const menuGrid = document.getElementById('menu-items-grid');
    const menuBookWrapper = document.getElementById('menu-book-wrapper');
    const menuTabsWrapper = document.getElementById('menu-tabs-wrapper');
    const menuSearchWrapper = document.getElementById('menu-search-wrapper');

    if (viewGridBtn && viewBookBtn && menuGrid && menuBookWrapper) {
        viewGridBtn.addEventListener('click', () => {
            viewGridBtn.classList.add('active');
            viewBookBtn.classList.remove('active');
            menuGrid.style.display = 'grid';
            if (menuTabsWrapper) menuTabsWrapper.style.display = 'block';
            if (menuSearchWrapper) menuSearchWrapper.style.display = 'flex';
            menuBookWrapper.style.display = 'none';
        });

        viewBookBtn.addEventListener('click', () => {
            viewBookBtn.classList.add('active');
            viewGridBtn.classList.remove('active');
            menuGrid.style.display = 'none';
            if (menuTabsWrapper) menuTabsWrapper.style.display = 'none';
            if (menuSearchWrapper) menuSearchWrapper.style.display = 'none';
            menuBookWrapper.style.display = 'block';
            
            // Re-run z-index positioning when book view is opened
            updatePageZIndices();
        });
    }

    const bookPages = document.querySelectorAll('.book-page');
    if (bookPages.length > 0) {
        bookPages.forEach((page, index) => {
            page.addEventListener('click', (e) => {
                // Ignore clicks on buttons/inputs inside the page
                if (e.target.closest('.book-add-cart-btn') || e.target.closest('a') || e.target.closest('button')) {
                    return;
                }
                
                if (page.classList.contains('flipped')) {
                    // Check if it's the topmost flipped page
                    const flipped = Array.from(bookPages).filter(p => p.classList.contains('flipped'));
                    if (flipped.length > 0) {
                        const maxFlippedIndex = Math.max(...flipped.map(p => parseInt(p.getAttribute('data-index'))));
                        if (index === maxFlippedIndex) {
                            page.classList.remove('flipped');
                            updatePageZIndices();
                        }
                    }
                } else {
                    // Check if it's the topmost non-flipped page
                    const nonFlipped = Array.from(bookPages).filter(p => !p.classList.contains('flipped'));
                    if (nonFlipped.length > 0) {
                        const minNonFlippedIndex = Math.min(...nonFlipped.map(p => parseInt(p.getAttribute('data-index'))));
                        if (index === minNonFlippedIndex) {
                            page.classList.add('flipped');
                            updatePageZIndices();
                        }
                    }
                }
            });
        });

        function updatePageZIndices() {
            const total = bookPages.length;
            let maxFlipped = -1;
            let minNonFlipped = total;
            let numFlipped = 0;

            // Find current bounds
            bookPages.forEach((page, index) => {
                const isFlipped = page.classList.contains('flipped');
                if (isFlipped) {
                    numFlipped++;
                    if (index > maxFlipped) maxFlipped = index;
                } else {
                    if (index < minNonFlipped) minNonFlipped = index;
                }
            });

            // Dynamically translate the book to keep the visible page layout centered
            const bookEl = document.getElementById('menu-book-3d');
            if (bookEl) {
                const bookWidth = bookEl.offsetWidth || 500;
                if (numFlipped === 0) {
                    // Closed cover centers on screen by default
                    bookEl.style.transform = 'translateX(0)';
                } else if (numFlipped === total) {
                    // Fully closed back cover shifts right by full page width to center
                    bookEl.style.transform = `translateX(${bookWidth}px)`;
                } else {
                    // Open booklet double spread centers by shifting spine to middle
                    bookEl.style.transform = `translateX(${bookWidth / 2}px)`;
                }
            }

            bookPages.forEach((page, index) => {
                const isFlipped = page.classList.contains('flipped');
                
                // Remove flip hint classes
                page.classList.remove('can-flip', 'can-unflip');

                if (isFlipped) {
                    page.style.zIndex = 2 + index;
                    // Only the topmost flipped page can be turned back
                    if (index === maxFlipped) {
                        page.classList.add('can-unflip');
                    }
                } else {
                    page.style.zIndex = 2 + total - index;
                    // Only the topmost non-flipped page can be turned forward
                    if (index === minNonFlipped) {
                        page.classList.add('can-flip');
                    }
                }
            });
        }

        // Run initially
        updatePageZIndices();

        // Bind add to basket buttons inside 3D book
        const bookCartBtns = document.querySelectorAll('.book-add-cart-btn');
        bookCartBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent page flip
                const itemId = btn.getAttribute('data-id');
                if (typeof addToCart === 'function') {
                    addToCart(itemId);
                }
            });
        });
    }

    // 12. Hero Background Slideshow Carousel Controller
    const bgSlides = document.querySelectorAll('.hero-bg-slide');
    if (bgSlides.length > 1) {
        let currentSlideIndex = 0;
        const slideInterval = 7000; // Cycle every 7 seconds

        setInterval(() => {
            // Remove active class from current slide
            bgSlides[currentSlideIndex].classList.remove('active');
            
            // Increment to next index, wrapping around
            currentSlideIndex = (currentSlideIndex + 1) % bgSlides.length;
            
            // Add active class to next slide
            bgSlides[currentSlideIndex].classList.add('active');
        }, slideInterval);
    }
});
