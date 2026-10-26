/**
 * ZEP PEN – Store App (Frontend)
 * WhatsApp: +91 99220 91507  |  Pay to: 99220 91507
 * Flat Delivery: ₹1
 * Boss: samarthraje  |  CEO: samyak
 */

const DELIVERY_CHARGE = 10;
const WHATSAPP_NUMBER = "919922091507";
const STORE_NAME      = "Zep Pen";

// ─── Product Catalog ──────────────────────────────────────────────────────────
const products = [
  { id:"erasable_pen",          name:"Erasable pen",            price:25, category:"Special", icon:"fa-solid fa-eraser",              description:"Write, erase & rewrite cleanly without paper wear." },
  { id:"liquid_gt_bear",        name:"Liguid gt bear",          price:11, category:"Gel",     icon:"fa-solid fa-water",               description:"Ultra-smooth Japanese style liquid roller ink." },
  { id:"xo_blue_black",         name:"Xo blue/black",           price:10, category:"Ball",    icon:"fa-solid fa-pen-clip",            description:"High-density waterproof ink for exam & rapid notes.",  variants:["Blue","Black"], selectedVariant:"Blue" },
  { id:"butterflow_black_blue", name:"Butterflow black/blue",   price:10, category:"Ball",    icon:"fa-solid fa-feather",             description:"Iconic ultra-low friction butter-smooth writing.",      variants:["Blue","Black"], selectedVariant:"Blue" },
  { id:"linc_black",            name:"Linc black",              price:15, category:"Ball",    icon:"fa-solid fa-pen-fancy",           description:"Darkest executive black smudge-free ink flow." },
  { id:"doms_everyday",         name:"Doms everyday",           price:10, category:"Ball",    icon:"fa-solid fa-pencil",              description:"Student-favourite reliable everyday pen." },
  { id:"xo_glowing_black_blue", name:"Xo glowing black/blue",  price:10, category:"Ball",    icon:"fa-solid fa-wand-magic-sparkles", description:"Vibrant glowing neon barrel with fine tip.",            variants:["Blue","Black"], selectedVariant:"Blue" },
  { id:"goldex_blue",           name:"Goldex blue",             price:10, category:"Ball",    icon:"fa-solid fa-pen-nib",             description:"Classic fine-point pen trusted for handwriting." }
];

// ─── App State ────────────────────────────────────────────────────────────────
const cart = {};
let activeCategory = "all";
let searchQuery    = "";
let deferredPrompt = null;

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", function() {
  renderProducts();
  updateCartUI();
  renderSavedReceipts();
  setupPwaInstallPrompt();
});

// ─── PWA Install ──────────────────────────────────────────────────────────────
function setupPwaInstallPrompt() {
  window.addEventListener("beforeinstallprompt", function(e) {
    e.preventDefault();
    deferredPrompt = e;
  });
  window.addEventListener("appinstalled", function() {
    deferredPrompt = null;
    showToast("Zep Pen App installed!", "success");
  });
}

function triggerNativeInstall() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(function(r) {
      if (r.outcome === "accepted") showToast("Installing…", "success");
      deferredPrompt = null;
      closeApkModal();
    });
  } else {
    alert("To install:\n1. Open in Google Chrome\n2. Tap three-dots menu\n3. Select 'Install app'");
  }
}

// ─── Tab Navigation ───────────────────────────────────────────────────────────
var tabMobileMap = { store:"mNavStore", about:"mNavAbout", receipts:"mNavReceipts" };

function switchTab(tabId) {
  document.querySelectorAll(".tab-view").forEach(function(el) { el.classList.remove("active"); });
  document.querySelectorAll(".desktop-nav .nav-btn").forEach(function(el) { el.classList.remove("active"); });
  document.querySelectorAll(".mobile-bottom-nav .m-nav-item").forEach(function(el) { el.classList.remove("active"); });

  var panel = document.getElementById("tab-" + tabId);
  if (panel) panel.classList.add("active");

  var dBtn = document.getElementById("nav-" + tabId);
  if (dBtn) dBtn.classList.add("active");

  var mBtnId = tabMobileMap[tabId];
  if (mBtnId) {
    var mBtn = document.getElementById(mBtnId);
    if (mBtn) mBtn.classList.add("active");
  }

  if (tabId === "receipts") renderSavedReceipts();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ─── Product Filters ──────────────────────────────────────────────────────────
function filterCategory(cat, el) {
  activeCategory = cat;
  document.querySelectorAll(".cat-pill").forEach(function(p) { p.classList.remove("active"); });
  if (el) el.classList.add("active");
  renderProducts();
}

function filterProducts() {
  var inp = document.getElementById("searchInput");
  searchQuery = inp ? inp.value.toLowerCase().trim() : "";
  renderProducts();
}

// ─── Render Products ──────────────────────────────────────────────────────────
function renderProducts() {
  var grid  = document.getElementById("productsGrid");
  var badge = document.getElementById("productCountBadge");
  if (!grid) return;

  var list = products.filter(function(p) {
    var catOk  = activeCategory === "all" || p.category.toLowerCase() === activeCategory.toLowerCase();
    var srchOk = !searchQuery || p.name.toLowerCase().indexOf(searchQuery) !== -1 || p.description.toLowerCase().indexOf(searchQuery) !== -1;
    return catOk && srchOk;
  });

  if (badge) badge.innerText = list.length + " items";

  if (list.length === 0) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px 10px;color:#64748b;">' +
      '<i class="fa-solid fa-pen-slash" style="font-size:2rem;margin-bottom:8px;display:block;"></i>' +
      'No pens found for "' + searchQuery + '".</div>';
    return;
  }

  var html = "";
  for (var k = 0; k < list.length; k++) {
    var prod   = list[k];
    var inCart  = cart[prod.id];
    var qty    = inCart ? inCart.qty : 0;
    var hasVar = prod.variants && prod.variants.length > 0;
    var curVar = (inCart && inCart.variant) || prod.selectedVariant || (hasVar ? prod.variants[0] : null);

    html += '<div class="m-product-card ' + (qty > 0 ? "in-cart" : "") + '" id="pcard-' + prod.id + '">';
    html += '<span class="card-delivery-tag"><i class="fa-solid fa-truck-fast"></i> ₹10 Delivery</span>';
    html += '<div class="m-product-visual"><i class="' + prod.icon + ' m-pen-icon"></i></div>';
    html += '<div class="m-product-content">';
    html += '<span class="m-category-name">' + prod.category + '</span>';
    html += '<h3 class="m-product-title">' + prod.name + '</h3>';
    html += '<p class="m-product-desc">' + prod.description + '</p>';

    if (hasVar) {
      html += '<div class="m-variant-bar" id="varbar-' + prod.id + '">';
      for (var v = 0; v < prod.variants.length; v++) {
        var vn = prod.variants[v];
        html += '<button type="button" class="m-variant-btn ' + (curVar === vn ? "active" : "") + '" onclick="selectProductVariant(\'' + prod.id + '\',\'' + vn + '\')">' + vn + '</button>';
      }
      html += '</div>';
    }

    html += '<div class="m-product-action-row">';
    html += '<div class="m-price-box"><span class="m-price-text">₹' + prod.price + '</span></div>';
    html += '<div class="m-action-target" id="actiontarget-' + prod.id + '">';
    if (qty > 0) {
      html += '<div class="m-qty-controls">';
      html += '<button type="button" class="m-qty-btn" onclick="updateItemQuantity(\'' + prod.id + '\',-1)">&minus;</button>';
      html += '<span class="m-qty-val">' + qty + '</span>';
      html += '<button type="button" class="m-qty-btn" onclick="updateItemQuantity(\'' + prod.id + '\',1)">&plus;</button>';
      html += '</div>';
    } else {
      html += '<button type="button" class="btn-m-add" onclick="updateItemQuantity(\'' + prod.id + '\',1)"><i class="fa-solid fa-plus"></i> Add</button>';
    }
    html += '</div></div></div></div>';
  }

  grid.innerHTML = html;
}

// ─── Variant Selection ────────────────────────────────────────────────────────
function selectProductVariant(productId, variant) {
  var prod = products.find(function(p) { return p.id === productId; });
  if (!prod) return;
  prod.selectedVariant = variant;
  if (cart[productId]) cart[productId].variant = variant;

  var bar = document.getElementById("varbar-" + productId);
  if (bar) {
    var btns = bar.querySelectorAll(".m-variant-btn");
    for (var i = 0; i < btns.length; i++) {
      if (btns[i].innerText.trim() === variant) btns[i].classList.add("active");
      else btns[i].classList.remove("active");
    }
  }
  showToast(variant + " ink chosen for " + prod.name);
  updateCartUI();
}

// ─── Quantity ─────────────────────────────────────────────────────────────────
function updateItemQuantity(productId, change) {
  var prod = products.find(function(p) { return p.id === productId; });
  if (!prod) return;

  if (!cart[productId]) {
    cart[productId] = {
      id: prod.id, name: prod.name, price: prod.price, category: prod.category,
      icon: prod.icon, description: prod.description,
      qty: 0,
      variant: prod.selectedVariant || (prod.variants ? prod.variants[0] : null)
    };
  }
  cart[productId].qty += change;

  if (cart[productId].qty <= 0) {
    delete cart[productId];
    showToast("Removed " + prod.name + " from bag");
  } else {
    showToast(prod.name + " (Qty: " + cart[productId].qty + ")");
  }

  updateSingleCardDOM(productId);
  updateCartUI();
}

function updateSingleCardDOM(productId) {
  var card   = document.getElementById("pcard-" + productId);
  var target = document.getElementById("actiontarget-" + productId);
  if (!card || !target) return;

  var qty = cart[productId] ? cart[productId].qty : 0;
  if (qty > 0) {
    card.classList.add("in-cart");
    target.innerHTML =
      '<div class="m-qty-controls">' +
      '<button type="button" class="m-qty-btn" onclick="updateItemQuantity(\'' + productId + '\',-1)">&minus;</button>' +
      '<span class="m-qty-val">' + qty + '</span>' +
      '<button type="button" class="m-qty-btn" onclick="updateItemQuantity(\'' + productId + '\',1)">&plus;</button>' +
      '</div>';
  } else {
    card.classList.remove("in-cart");
    target.innerHTML =
      '<button type="button" class="btn-m-add" onclick="updateItemQuantity(\'' + productId + '\',1)">' +
      '<i class="fa-solid fa-plus"></i> Add</button>';
  }
}

// ─── Cart UI ──────────────────────────────────────────────────────────────────
function updateCartUI() {
  var items    = Object.values(cart);
  var totalQty = 0, subtotal = 0;
  for (var i = 0; i < items.length; i++) { totalQty += items[i].qty; subtotal += items[i].price * items[i].qty; }
  var grand = totalQty > 0 ? subtotal + DELIVERY_CHARGE : 0;

  var hBadge = document.getElementById("headerCartCount");
  var mBadge = document.getElementById("mCartBadge");
  if (hBadge) hBadge.innerText = totalQty;
  if (mBadge) mBadge.innerText = totalQty;

  var bar = document.getElementById("stickyCheckoutBar");
  if (bar) {
    if (totalQty > 0) {
      bar.classList.add("active");
      var qEl = document.getElementById("stickyQtyCount");
      var tEl = document.getElementById("stickyTotalVal");
      if (qEl) qEl.innerText = totalQty;
      if (tEl) tEl.innerText = "₹" + grand;
    } else {
      bar.classList.remove("active");
    }
  }

  updateSheetSummary(items, subtotal, grand);
}

function updateSheetSummary(items, subtotal, grand) {
  var listEl   = document.getElementById("sheetItemsList");
  var subtotEl = document.getElementById("sheetSubtotal");
  var grandEl  = document.getElementById("sheetGrandTotal");
  var amountEl = document.getElementById("payInstructionAmount");

  if (!listEl || !subtotEl || !grandEl) return;

  if (items.length === 0) {
    listEl.innerHTML = '<div style="text-align:center;padding:20px;color:#94a3b8;">Your bag is empty.</div>';
    subtotEl.innerText = "₹0";
    grandEl.innerText  = "₹0";
    if (amountEl) amountEl.innerText = "₹1";
    return;
  }

  var html = "";
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    html += '<div class="sheet-item-row"><div>';
    html += '<div class="sheet-item-title">' + item.name + '</div>';
    html += '<div class="sheet-item-sub">';
    if (item.variant) html += '<span style="color:#0056b3;font-weight:700;">' + item.variant + ' Ink</span> &bull; ';
    html += 'Qty: ' + item.qty + ' &times; ₹' + item.price;
    html += '</div></div>';
    html += '<div class="sheet-item-price">₹' + (item.price * item.qty) + '</div></div>';
  }

  listEl.innerHTML   = html;
  subtotEl.innerText = "₹" + subtotal;
  grandEl.innerText  = "₹" + grand;
  if (amountEl) amountEl.innerText = "₹" + grand;
}

// ─── Copy Number ──────────────────────────────────────────────────────────────
function copyPayNumber() {
  var num = "9922091507";
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(num)
      .then(function() { showToast("Number 99220 91507 copied!", "success"); })
      .catch(function() { fallbackCopy(num); });
  } else {
    fallbackCopy(num);
  }
}

function fallbackCopy(text) {
  var inp = document.createElement("input");
  inp.value = text;
  document.body.appendChild(inp);
  inp.select();
  try { document.execCommand("copy"); showToast("Number copied!", "success"); } catch(e) {}
  document.body.removeChild(inp);
}

// ─── Modals ───────────────────────────────────────────────────────────────────
function openCartModal() {
  if (Object.keys(cart).length === 0) { showToast("Pick at least 1 pen first!", "info"); return; }
  var m = document.getElementById("checkoutModal");
  if (m) { m.classList.add("open"); document.body.style.overflow = "hidden"; }
  updateCartUI();
}
function closeCartModal() {
  var m = document.getElementById("checkoutModal");
  if (m) { m.classList.remove("open"); document.body.style.overflow = ""; }
}
function openReceiptModal() {
  var m = document.getElementById("receiptModal");
  if (m) { m.classList.add("open"); document.body.style.overflow = "hidden"; }
}
function closeReceiptModal() {
  var m = document.getElementById("receiptModal");
  if (m) { m.classList.remove("open"); document.body.style.overflow = ""; }
}
function openApkModal() {
  var m = document.getElementById("apkModal");
  if (m) { m.classList.add("open"); document.body.style.overflow = "hidden"; }
}
function closeApkModal() {
  var m = document.getElementById("apkModal");
  if (m) { m.classList.remove("open"); document.body.style.overflow = ""; }
}

// ─── Confirm Order (Direct WhatsApp Routing to 99220 91507) ─────────────────
function proceedToConfirmOrder() {
  var items = Object.values(cart);
  if (items.length === 0) { alert("Please select items first."); return; }

  var nameEl  = document.getElementById("inputName");
  var phoneEl = document.getElementById("inputPhone");
  var addrEl  = document.getElementById("inputAddress");
  var notesEl = document.getElementById("inputNotes");
  var txnEl   = document.getElementById("inputTransactionId");

  var name  = nameEl  ? nameEl.value.trim()  : "";
  var phone = phoneEl ? phoneEl.value.trim()  : "";
  var addr  = addrEl  ? addrEl.value.trim()   : "";
  var notes = notesEl ? notesEl.value.trim()  : "";
  var txnId = txnEl   ? txnEl.value.trim()    : "";

  if (!name || !phone || !addr) {
    alert("Please fill in Name, Mobile Number, and Delivery Address.");
    return;
  }
  if (phone.replace(/\D/g, "").length < 10) {
    alert("Please enter a valid 10-digit mobile number.");
    return;
  }
  if (!txnId) {
    alert("Please enter your Transaction ID / UTR Number after paying to 99220 91507.");
    if (txnEl) txnEl.focus();
    return;
  }

  var subtotal  = 0;
  for (var i = 0; i < items.length; i++) subtotal += items[i].price * items[i].qty;
  var grand     = subtotal + DELIVERY_CHARGE;
  var orderId   = "ZEP-" + Math.floor(100000 + Math.random() * 900000);
  var orderDate = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  var cleanItems = [];
  for (var j = 0; j < items.length; j++) {
    cleanItems.push({ name: items[j].name, price: items[j].price, qty: items[j].qty, variant: items[j].variant || null });
  }

  var order = {
    orderId: orderId,
    date: orderDate,
    name: name,
    phone: phone,
    address: addr,
    notes: notes,
    transactionId: txnId,
    items: cleanItems,
    subtotal: subtotal,
    deliveryCharge: DELIVERY_CHARGE,
    grandTotal: grand
  };

  // 1. Save locally for digital receipt & history
  localStorage.setItem("zeppen_last_order", JSON.stringify(order));

  // 2. Open WhatsApp chat with pre-filled order details to 99220 91507
  sendOrderViaWhatsApp(order);

  // 3. Display digital receipt modal on the webpage
  showToast("Order booked! Opening WhatsApp…", "success");
  renderReceiptInModal(order);
  closeCartModal();
  openReceiptModal();

  // 4. Clear cart & reset form
  for (var key in cart) { delete cart[key]; }
  updateCartUI();
  renderProducts();

  if (nameEl)  nameEl.value  = "";
  if (phoneEl) phoneEl.value = "";
  if (addrEl)  addrEl.value  = "";
  if (notesEl) notesEl.value = "";
  if (txnEl)   txnEl.value   = "";
}

/** Format and trigger WhatsApp link to store +91 99220 91507 */
function sendOrderViaWhatsApp(order) {
  var line = "━━━━━━━━━━━━━━━━━━━━━━";
  var m = "";
  m += "✒️ *ZEP PEN – NEW ORDER*\n";
  m += line + "\n";
  m += "🧾 *Order ID:* #" + order.orderId + "\n";
  m += "📅 *Date:* " + order.date + "\n";
  m += line + "\n";
  m += "👤 *CUSTOMER DETAILS:*\n";
  m += "• *Name:* " + order.name + "\n";
  m += "• *Mobile:* " + order.phone + "\n";
  m += "• *Address:* " + order.address + "\n";
  if (order.notes) m += "• *Note:* " + order.notes + "\n";
  m += line + "\n";
  m += "📦 *ITEMS ORDERED:*\n";
  var items = order.items || [];
  for (var i = 0; i < items.length; i++) {
    var it = items[i];
    var v = it.variant ? " [" + it.variant + " Ink]" : "";
    m += (i + 1) + ". *" + it.name + "*" + v + "\n";
    m += "   " + it.qty + " × ₹" + it.price + " = *₹" + (it.qty * it.price) + "*\n";
  }
  m += line + "\n";
  m += "💵 Items Subtotal: *₹" + order.subtotal + "*\n";
  m += "🚚 Express Delivery: *₹" + order.deliveryCharge + "*\n";
  m += "💰 *GRAND TOTAL: ₹" + order.grandTotal + "*\n";
  m += line + "\n";
  m += "📲 *Paid To:* 99220 91507\n";
  m += "🔖 *Transaction ID:* *" + order.transactionId + "*\n";
  m += line + "\n";
  m += "👔 *Leadership:* Boss samarthraje | CEO samyak\n";
  m += "Please verify payment and confirm delivery dispatch!";

  var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(m);
  window.open(url, "_blank");
}

function reSendWhatsAppOrder() {
  var raw = localStorage.getItem("zeppen_last_order");
  if (raw) sendOrderViaWhatsApp(JSON.parse(raw));
  else window.open("https://wa.me/" + WHATSAPP_NUMBER, "_blank");
}

function openWhatsAppChat() {
  window.open("https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent("Hello Zep Pen! I have a query."), "_blank");
}

// ─── Receipt in Modal ─────────────────────────────────────────────────────────
function renderReceiptInModal(order) {
  var container = document.getElementById("dynamicReceiptBody");
  if (!container) return;

  var itemsHtml = "";
  var items = order.items || [];
  for (var i = 0; i < items.length; i++) {
    var it = items[i];
    itemsHtml += '<tr><td><strong>' + it.name + '</strong>';
    if (it.variant) itemsHtml += '<br><small style="color:#0056b3;">' + it.variant + ' Ink</small>';
    itemsHtml += '</td><td style="text-align:center;">' + it.qty + ' &times; ₹' + it.price + '</td>';
    itemsHtml += '<td style="text-align:right;"><strong>₹' + (it.qty * it.price) + '</strong></td></tr>';
  }

  container.innerHTML =
    '<div class="digital-receipt">' +
      '<div class="rec-header-row">' +
        '<div class="rec-logo-name">' +
          '<img src="logo.png" alt="Zep Pen" class="rec-logo-img">' +
          '<div><div class="rec-store-name">ZEP PEN</div>' +
          '<div class="rec-leadership-sub">Boss samarthraje &bull; CEO samyak</div></div>' +
        '</div>' +
        '<div class="rec-meta-box">' +
          '<div class="rec-id-tag">#' + order.orderId + '</div>' +
          '<div class="rec-date-tag">' + order.date + '</div>' +
          '<span class="rec-status-chip">CONFIRMED</span>' +
        '</div>' +
      '</div>' +
      '<div class="rec-cust-box">' +
        '<div class="rec-cust-line"><strong>Customer:</strong> ' + order.name + ' &bull; ' + order.phone + '</div>' +
        '<div class="rec-cust-line"><strong>Address:</strong> ' + order.address + '</div>' +
        '<div class="rec-cust-line"><strong>Paid To:</strong> 99220 91507</div>' +
        '<div class="rec-cust-line"><strong>Transaction ID:</strong> <span style="color:#0056b3;font-weight:800;">' + order.transactionId + '</span></div>' +
        (order.notes ? '<div class="rec-cust-line"><strong>Note:</strong> ' + order.notes + '</div>' : '') +
      '</div>' +
      '<table class="rec-table"><thead><tr><th>Item</th><th style="text-align:center;">Qty</th><th style="text-align:right;">Amount</th></tr></thead><tbody>' +
      itemsHtml +
      '</tbody></table>' +
      '<div class="rec-totals">' +
        '<div class="rec-total-row"><span>Subtotal</span><span>₹' + order.subtotal + '</span></div>' +
        '<div class="rec-total-row" style="color:#15803d;font-weight:700;"><span><i class="fa-solid fa-truck-fast"></i> Delivery</span><span class="fee-badge">₹' + order.deliveryCharge + '</span></div>' +
        '<div class="rec-total-row grand"><span>Total Paid</span><span class="amount">₹' + order.grandTotal + '</span></div>' +
      '</div>' +
      '<div class="rec-footer-seal">' +
        '<p style="color:#15803d;font-weight:700;"><i class="fa-solid fa-circle-check"></i> Order sent to store WhatsApp (99220 91507) automatically!</p>' +
        '<p>The store team will confirm & dispatch soon.</p>' +
      '</div>' +
    '</div>';
}

function printReceiptFromModal() {
  window.open("receipt.html", "_blank");
}

// ─── Saved Receipts Tab ───────────────────────────────────────────────────────
function renderSavedReceipts() {
  var container = document.getElementById("receiptContentContainer");
  if (!container) return;

  var raw = localStorage.getItem("zeppen_last_order");
  if (!raw) {
    container.innerHTML =
      '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:30px 16px;text-align:center;color:#64748b;">' +
        '<i class="fa-solid fa-folder-open" style="font-size:2rem;margin-bottom:10px;display:block;color:#94a3b8;"></i>' +
        '<h3>No Orders Yet</h3>' +
        '<p style="font-size:0.85rem;margin-top:4px;">Place an order and your receipt will appear here.</p>' +
        '<button class="btn-m-add" onclick="switchTab(\'store\')" style="margin:16px auto 0;padding:10px 20px;">' +
        '<i class="fa-solid fa-bag-shopping"></i> Browse Pens</button>' +
      '</div>';
    return;
  }

  var order = JSON.parse(raw);
  var itemsHtml = "";
  var items = order.items || [];
  for (var i = 0; i < items.length; i++) {
    var it = items[i];
    itemsHtml += '<tr><td><strong>' + it.name + '</strong>';
    if (it.variant) itemsHtml += '<br><small style="color:#0056b3;">' + it.variant + ' Ink</small>';
    itemsHtml += '</td><td style="text-align:center;">' + it.qty + ' &times; ₹' + it.price + '</td>';
    itemsHtml += '<td style="text-align:right;"><strong>₹' + (it.qty * it.price) + '</strong></td></tr>';
  }

  container.innerHTML =
    '<div class="digital-receipt" style="box-shadow:0 4px 18px rgba(0,0,0,.06);">' +
      '<div class="rec-header-row">' +
        '<div class="rec-logo-name"><img src="logo.png" alt="Zep Pen" class="rec-logo-img">' +
        '<div><div class="rec-store-name">ZEP PEN</div><div class="rec-leadership-sub">Boss samarthraje &bull; CEO samyak</div></div></div>' +
        '<div class="rec-meta-box"><div class="rec-id-tag">#' + order.orderId + '</div>' +
        '<div class="rec-date-tag">' + order.date + '</div><span class="rec-status-chip">CONFIRMED</span></div>' +
      '</div>' +
      '<div class="rec-cust-box">' +
        '<div class="rec-cust-line"><strong>Customer:</strong> ' + order.name + ' (' + order.phone + ')</div>' +
        '<div class="rec-cust-line"><strong>Address:</strong> ' + order.address + '</div>' +
        '<div class="rec-cust-line"><strong>Paid To:</strong> 99220 91507</div>' +
        '<div class="rec-cust-line"><strong>Txn ID:</strong> <span style="color:#0056b3;font-weight:800;">' + (order.transactionId || "—") + '</span></div>' +
      '</div>' +
      '<table class="rec-table"><thead><tr><th>Item</th><th style="text-align:center;">Qty</th><th style="text-align:right;">Amount</th></tr></thead><tbody>' +
      itemsHtml +
      '</tbody></table>' +
      '<div class="rec-totals">' +
        '<div class="rec-total-row"><span>Subtotal</span><span>₹' + order.subtotal + '</span></div>' +
        '<div class="rec-total-row" style="color:#15803d;font-weight:700;"><span>Delivery</span><span>₹' + order.deliveryCharge + '</span></div>' +
        '<div class="rec-total-row grand"><span>Grand Total</span><span class="amount">₹' + order.grandTotal + '</span></div>' +
      '</div>' +
      '<div style="display:flex;gap:10px;margin-top:14px;">' +
        '<a href="receipt.html" target="_blank" class="btn-secondary" style="flex:1;text-decoration:none;"><i class="fa-solid fa-print"></i> Invoice</a>' +
        '<button onclick="reSendWhatsAppOrder()" class="btn-confirm-wa" style="flex:1;"><i class="fa-brands fa-whatsapp"></i> Re-send to Store</button>' +
      '</div>' +
    '</div>';
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function showToast(text, type) {
  type = type || "info";
  var wrapper = document.getElementById("toastWrapper");
  if (!wrapper) return;
  var t = document.createElement("div");
  t.className = "toast " + type;
  var icon = type === "success" ? "fa-solid fa-circle-check" : "fa-solid fa-circle-info";
  t.innerHTML = '<i class="' + icon + '"></i> <span>' + text + '</span>';
  wrapper.appendChild(t);
  setTimeout(function() {
    t.style.transition = "all .25s ease";
    t.style.opacity = "0";
    t.style.transform = "translateY(-8px)";
    setTimeout(function() { t.remove(); }, 260);
  }, 2500);
}

// ─── Keyboard dismiss ─────────────────────────────────────────────────────────
document.addEventListener("keydown", function(e) {
  if (e.key === "Escape") { closeCartModal(); closeReceiptModal(); closeApkModal(); }
});
