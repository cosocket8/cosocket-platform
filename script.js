// ============================================================
// script.js — COSOCKET  (robust, fault-tolerant rewrite)
// ============================================================

// ===== MACHINE DATA (fallback when Supabase is empty / offline) =====
const DEFAULT_MACHINES = [
    { id: 1,  name: 'CNC Milling Machine',          category: 'metal',   price: 2800, description: '3-axis precision milling for metal parts, moulds & components', icon: '⚙️' },
    { id: 2,  name: 'Hydraulic Press Brake',         category: 'metal',   price: 3200, description: '200T capacity for sheet metal bending up to 3m length', icon: '🔧' },
    { id: 3,  name: 'CNC Laser Cutting Machine',     category: 'metal',   price: 5500, description: 'Fiber laser for precision cutting of steel, aluminium, brass', icon: '✨' },
    { id: 4,  name: 'Power Loom',                    category: 'textile', price: 1500, description: 'Industrial weaving machine for fabric production', icon: '🧵' },
    { id: 5,  name: 'Embroidery Machine',            category: 'textile', price: 2000, description: 'Multi-head computerized embroidery, 12 heads', icon: '🪡' },
    { id: 6,  name: 'Flour Mill',                    category: 'food',    price: 1500, description: 'Commercial flour milling, 500 kg/hr capacity', icon: '🌾' },
    { id: 7,  name: 'Oil Expeller',                  category: 'food',    price: 2000, description: 'Cold press oil extraction — groundnut, mustard, coconut', icon: '🫒' },
    { id: 8,  name: 'Offset Printing Press',         category: 'print',   price: 5000, description: 'High-volume commercial printing, A1 format', icon: '📰' },
    { id: 9,  name: 'Surface Grinding Machine',      category: 'metal',   price: 1600, description: 'Precision surface finishing for metal components', icon: '🔨' },
    { id: 10, name: 'TIG Welding Set',               category: 'metal',   price: 1000, description: 'Precision TIG welding for stainless steel and aluminium', icon: '⚡' },
    { id: 11, name: 'Dyeing Machine',                category: 'textile', price: 2500, description: 'Industrial fabric dyeing, 200 kg capacity per batch', icon: '🎨' },
    { id: 12, name: 'Waterjet Cutting Machine',      category: 'metal',   price: 4800, description: 'Cold cutting for any material — metal, stone, glass, composite', icon: '💧' },
    { id: 13, name: 'Spot Welding Machine',          category: 'metal',   price: 1200, description: 'Resistance spot welding for sheet metal, auto body panels', icon: '🔵' },
    { id: 14, name: 'Snack Extruder',                category: 'food',    price: 5000, description: 'For namkeen, corn puffs, pasta and extruded snacks', icon: '🍟' },
    { id: 15, name: 'Bottle Filling Machine',        category: 'food',    price: 2500, description: 'Automatic filling for bottles and jars, 20–2000 ml', icon: '🍾' },
    { id: 16, name: 'Die Cutting Machine',           category: 'print',   price: 2200, description: 'Custom shape cutting for packaging, labels, stickers', icon: '✂️' },
    { id: 17, name: 'Laminator',                     category: 'print',   price: 1800, description: 'Thermal lamination for prints up to A0 size', icon: '✨' },
    { id: 18, name: 'Flexographic Printing Machine', category: 'print',   price: 4500, description: 'Flexible packaging printing for pouches, labels, films', icon: '🖨️' },
];

// ===== STATE =====
let allMachines   = [];
let currentFilter = 'all';
let lastBookingData = null;
let currentUser   = null;

// ============================================================
// AUTH HELPERS
// ============================================================
function isLoggedIn() {
    const raw = localStorage.getItem('user');
    if (!raw) return false;
    try { currentUser = JSON.parse(raw); return !!currentUser; } catch { return false; }
}

function requireLogin(action) {
    if (isLoggedIn()) return true;
    sessionStorage.setItem('pendingAction', action || '');
    showLoginModal('Please log in to continue.');
    return false;
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
    // Restore session from Supabase (handles page refreshes)
    await restoreSupabaseSession();

    updateNavForAuthState();
    loadMachines();
    setupDateInputs();
    setupAddressAutocomplete();

    if (isLoggedIn()) {
        const pending = sessionStorage.getItem('pendingAction');
        if (pending) {
            sessionStorage.removeItem('pendingAction');
            setTimeout(() => resumePendingAction(pending), 300);
        }
    }
});

async function restoreSupabaseSession() {
    try {
        const supabase = getSupabase();
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
            const meta = session.user.user_metadata || {};
            currentUser = {
                id:    session.user.id,
                email: session.user.email,
                name:  meta.full_name || session.user.email,
                phone: meta.phone || '',
            };
            localStorage.setItem('user', JSON.stringify(currentUser));
        }
        // Listen for auth changes (login/logout in another tab)
        supabase.auth.onAuthStateChange((_event, session) => {
            if (session && session.user) {
                const meta = session.user.user_metadata || {};
                currentUser = {
                    id:    session.user.id,
                    email: session.user.email,
                    name:  meta.full_name || session.user.email,
                    phone: meta.phone || '',
                };
                localStorage.setItem('user', JSON.stringify(currentUser));
            } else {
                currentUser = null;
                localStorage.removeItem('user');
            }
            updateNavForAuthState();
            displayMachines(allMachines);
        });
    } catch (err) {
        console.warn('Could not restore Supabase session:', err);
    }
}

function resumePendingAction(action) {
    if (action === 'provider') showProviderModal();
    else if (action === 'search') document.getElementById('searchInput')?.focus();
    else if (action.startsWith('book:')) {
        const parts = action.split(':');
        const name  = parts[1];
        const price = parseInt(parts[2]) || 2000;
        const id    = parseInt(parts[3]) || null;
        if (name) openBookingModal(name, price, id);
    }
}

// ============================================================
// NAV AUTH STATE
// ============================================================
function updateNavForAuthState() {
    const btn = document.getElementById('loginBtn');
    if (btn) {
        if (isLoggedIn()) {
            btn.textContent = 'Dashboard';
            btn.onclick = () => window.location.href = 'dashboard.html';
        } else {
            btn.textContent = 'Login / Sign Up';
            btn.onclick = () => showLoginModal();
        }
    }

    const banner = document.getElementById('loginWallBanner');
    if (banner) banner.style.display = isLoggedIn() ? 'none' : 'flex';

    const listBtn = document.querySelector('.btn-provider');
    if (listBtn) {
        listBtn.onclick = isLoggedIn()
            ? () => showProviderModal()
            : () => requireLogin('provider');
    }
}

// ============================================================
// DATE SETUP
// ============================================================
function setupDateInputs() {
    const today = new Date().toISOString().split('T')[0];
    ['startDate', 'endDate'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.min = today;
    });
}

// ============================================================
// LOAD MACHINES FROM SUPABASE (with localStorage fallback)
// ============================================================
async function loadMachines() {
    const grid = document.getElementById('machinesGrid');
    if (grid) grid.innerHTML = `<div class="loading-state"><div class="spinner"></div>Loading machines…</div>`;

    try {
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('machines')
            .select('*')
            .eq('status', 'available')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
            // Merge Supabase data with defaults (avoid duplicates by name)
            const supabaseNames = data.map(m => m.name.toLowerCase());
            const extras = DEFAULT_MACHINES.filter(m => !supabaseNames.includes(m.name.toLowerCase()));
            allMachines = [...data.map(m => ({ ...m, icon: m.icon || '🔧' })), ...extras];
        } else {
            allMachines = DEFAULT_MACHINES;
        }
    } catch (err) {
        console.warn('Supabase unavailable, using defaults:', err);
        allMachines = DEFAULT_MACHINES;
    }

    displayMachines(allMachines);
}

// ============================================================
// DISPLAY MACHINES
// ============================================================
function displayMachines(machines) {
    const grid = document.getElementById('machinesGrid');
    if (!grid) return;

    if (!machines || machines.length === 0) {
        grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
            <div class="empty-icon">🔍</div><p>No machines found. Try a different search.</p>
        </div>`;
        return;
    }

    const loggedIn = isLoggedIn();

    grid.innerHTML = machines.map(machine => {
        const safeId    = machine.id || 0;
        const safeName  = escHtml(machine.name);
        const safeDesc  = escHtml(machine.description || '');
        const safePrice = Number(machine.price).toLocaleString('en-IN');
        const safeCat   = getCategoryName(machine.category);
        const icon      = machine.icon || '🔧';

        if (loggedIn) {
            return `
            <div class="machine-card" onclick="openBookingModal('${safeName}', ${machine.price}, ${safeId})">
                <div class="machine-icon">${icon}</div>
                <div class="machine-info">
                    <div class="machine-category">${safeCat}</div>
                    <h3>${safeName}</h3>
                    <p class="machine-desc">${safeDesc}</p>
                    <div class="machine-footer">
                        <div class="machine-price">₹${safePrice}<small>/day</small></div>
                        <button class="book-now"
                            onclick="event.stopPropagation();openBookingModal('${safeName}', ${machine.price}, ${safeId})">
                            Book Now
                        </button>
                    </div>
                </div>
            </div>`;
        } else {
            return `
            <div class="machine-card machine-card--locked"
                onclick="requireLogin('book:${safeName}:${machine.price}:${safeId}')">
                <div class="machine-icon">${icon}</div>
                <div class="machine-info">
                    <div class="machine-category">${safeCat}</div>
                    <h3>${safeName}</h3>
                    <p class="machine-desc">${safeDesc}</p>
                    <div class="machine-footer">
                        <div class="machine-price">₹${safePrice}<small>/day</small></div>
                        <button class="book-now book-now--locked"
                            onclick="event.stopPropagation();requireLogin('book:${safeName}:${machine.price}:${safeId}')">
                            🔒 Login to Book
                        </button>
                    </div>
                </div>
            </div>`;
        }
    }).join('');
}

function getCategoryName(cat) {
    return { metal: 'Fabrication & Metalworking', textile: 'Textile Processing', food: 'Food & Agro Processing', print: 'Printing & Packaging' }[cat] || cat;
}

function escHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ============================================================
// FILTER & SEARCH
// ============================================================
function filterMachines(category, btn) {
    currentFilter = category;
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    const filtered = category === 'all' ? allMachines : allMachines.filter(m => m.category === category);
    displayMachines(filtered);
}

function searchMachines() {
    const q = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();
    if (!q) { filterMachines(currentFilter, null); return; }
    const filtered = allMachines.filter(m =>
        m.name.toLowerCase().includes(q) || (m.description || '').toLowerCase().includes(q)
    );
    displayMachines(filtered);
    document.getElementById('machines')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ============================================================
// ADDRESS AUTOCOMPLETE (Nominatim — Pune-biased)
// ============================================================
let _addrDebounce = null;
let _addrCache    = {};

function setupAddressAutocomplete() {
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#address') && !e.target.closest('#addressSuggestions')) {
            hideSuggestions();
        }
    });
}

function handleAddressInput(input) {
    clearTimeout(_addrDebounce);
    const query = input.value.trim();
    if (query.length < 3) { hideSuggestions(); return; }
    _addrDebounce = setTimeout(() => fetchAddressSuggestions(query), 350);
}

async function fetchAddressSuggestions(query) {
    if (_addrCache[query]) { showSuggestions(_addrCache[query]); return; }

    try {
        const url = `https://nominatim.openstreetmap.org/search?` +
            `q=${encodeURIComponent(query + ', Pune, Maharashtra')}&` +
            `format=json&addressdetails=1&limit=5&countrycodes=in`;

        const res  = await fetch(url, {
            headers: { 'Accept-Language': 'en', 'User-Agent': 'COSOCKET/1.0' }
        });
        const data = await res.json();
        _addrCache[query] = data;
        showSuggestions(data);
    } catch (err) {
        console.warn('Address lookup failed:', err);
    }
}

function showSuggestions(results) {
    const box = document.getElementById('addressSuggestions');
    if (!box) return;
    if (!results || results.length === 0) { box.style.display = 'none'; return; }

    box.innerHTML = results.map(r => {
        const label = r.display_name.split(',').slice(0, 4).join(', ');
        return `<div class="address-suggestion-item" onclick="selectAddress('${escHtml(r.display_name)}')">
            <span class="suggestion-icon">📍</span><span>${escHtml(label)}</span>
        </div>`;
    }).join('');
    box.style.display = 'block';
}

function hideSuggestions() {
    const box = document.getElementById('addressSuggestions');
    if (box) box.style.display = 'none';
}

function selectAddress(fullAddress) {
    const clean = fullAddress.split(',').slice(0, 5).join(', ');
    const input = document.getElementById('address');
    if (input) input.value = clean;
    hideSuggestions();
}

// ============================================================
// BOOKING MODAL
// ============================================================
function openBookingModal(machineName, price, machineId) {
    if (!requireLogin(`book:${machineName}:${price}:${machineId || 0}`)) return;

    document.getElementById('bookingMachineName').value  = machineName;
    document.getElementById('bookingMachinePrice').value = price;
    // Store machine ID in a hidden field if it exists
    const midEl = document.getElementById('bookingMachineId');
    if (midEl) midEl.value = machineId || '';

    document.getElementById('bookingModalTitle').textContent    = `Book: ${machineName}`;
    document.getElementById('bookingFormWrapper').style.display = 'block';
    document.getElementById('bookingSuccess').style.display     = 'none';
    document.getElementById('bookingForm').reset();
    hideSuggestions();

    const today = new Date().toISOString().split('T')[0];
    document.getElementById('startDate').min = today;
    document.getElementById('endDate').min   = today;
    document.getElementById('bookingSummary').style.display = 'none';

    // Pre-fill customer name & phone from logged-in user
    if (currentUser) {
        const nameEl  = document.getElementById('customerName');
        const phoneEl = document.getElementById('customerPhone');
        if (nameEl && !nameEl.value && currentUser.name)  nameEl.value  = currentUser.name;
        if (phoneEl && !phoneEl.value && currentUser.phone) phoneEl.value = currentUser.phone;
    }

    document.getElementById('bookingModal').classList.add('show');
}

function updateBookingSummary() {
    const price       = parseInt(document.getElementById('bookingMachinePrice').value) || 0;
    const start       = document.getElementById('startDate').value;
    const end         = document.getElementById('endDate').value;
    const machineName = document.getElementById('bookingMachineName').value;
    const summary     = document.getElementById('bookingSummary');

    if (!start || !end || !price) { summary.style.display = 'none'; return; }
    const days = Math.ceil((new Date(end) - new Date(start)) / 86400000) + 1;
    if (days <= 0) { summary.style.display = 'none'; return; }

    const total   = days * price;
    const advance = Math.ceil(total * 0.3);

    document.getElementById('summaryMachine').textContent = machineName;
    document.getElementById('summaryDays').textContent    = `${days} day${days > 1 ? 's' : ''}`;
    document.getElementById('summaryRate').textContent    = `₹${price.toLocaleString('en-IN')}/day`;
    document.getElementById('summaryTotal').textContent   = `₹${total.toLocaleString('en-IN')}`;
    document.getElementById('summaryAdvance').textContent = `₹${advance.toLocaleString('en-IN')}`;
    summary.style.display = 'block';
}

// ============================================================
// SUBMIT BOOKING — saves to Supabase + WhatsApp notification
// ============================================================
async function submitBooking(event) {
    event.preventDefault();
    if (!requireLogin()) return;

    const machineName   = document.getElementById('bookingMachineName').value;
    const machineId     = parseInt(document.getElementById('bookingMachineId')?.value) || null;
    const dailyRate     = parseInt(document.getElementById('bookingMachinePrice').value) || 2000;
    const customerName  = document.getElementById('customerName').value.trim();
    const customerPhone = document.getElementById('customerPhone').value.trim();
    const startDate     = document.getElementById('startDate').value;
    const endDate       = document.getElementById('endDate').value;
    const address       = document.getElementById('address').value.trim();

    // Validations
    if (!customerName)                         { showToast('Please enter your name', 'error'); return; }
    if (!/^\d{10}$/.test(customerPhone))       { showToast('Enter a valid 10-digit WhatsApp number', 'error'); return; }
    if (!startDate || !endDate)                { showToast('Please select both dates', 'error'); return; }
    if (new Date(endDate) < new Date(startDate)) { showToast('End date must be after start date', 'error'); return; }

    const days          = Math.ceil((new Date(endDate) - new Date(startDate)) / 86400000) + 1;
    const totalAmount   = days * dailyRate;
    const advanceAmount = Math.ceil(totalAmount * 0.3);

    const bookingRow = {
        machine_id:       machineId,
        machine_name:     machineName,
        customer_name:    customerName,
        customer_phone:   customerPhone,
        customer_user_id: currentUser?.id || null,
        start_date:       startDate,
        end_date:         endDate,
        address:          address || null,
        daily_rate:       dailyRate,
        days,
        total_amount:     totalAmount,
        advance_amount:   advanceAmount,
        status:           'pending',
    };

    // ── Save to Supabase ──────────────────────────────────
    let savedToSupabase = false;
    try {
        const { error } = await getSupabase().from('bookings').insert([bookingRow]);
        if (error) throw error;
        savedToSupabase = true;
    } catch (err) {
        console.warn('Supabase booking insert failed, using localStorage fallback:', err);
        // Fallback: localStorage
        const local = JSON.parse(localStorage.getItem('bookings') || '[]');
        local.push({ ...bookingRow, id: Date.now() });
        localStorage.setItem('bookings', JSON.stringify(local));
    }

    lastBookingData = { ...bookingRow, savedToSupabase };

    // ── WhatsApp Notifications ────────────────────────────
    sendBookingWhatsApp(lastBookingData);

    // ── Update UI ─────────────────────────────────────────
    document.getElementById('bookingFormWrapper').style.display = 'none';
    document.getElementById('successText').textContent =
        `Booking request sent for ${machineName}! WhatsApp has opened — send the message and pay ₹${advanceAmount.toLocaleString('en-IN')} (30% advance) to confirm.`;
    document.getElementById('bookingSuccess').style.display = 'block';
}

// ============================================================
// WHATSAPP NOTIFICATION
// Build message → open wa.me link (works on mobile & desktop)
// ============================================================
function sendBookingWhatsApp(booking) {
    const {
        machine_name: machineName, customer_name: customerName,
        customer_phone: customerPhone, start_date: startDate,
        end_date: endDate, address, days, daily_rate: dailyRate,
        total_amount: totalAmount, advance_amount: advanceAmount
    } = booking;

    // Message to CUSTOMER
    const customerMsg =
`🏭 *COSOCKET – Booking Request Received* 🏭

Hello ${customerName}! Here are your booking details:

📌 *Machine:* ${machineName}
📅 *From:* ${formatDate(startDate)}
📅 *To:* ${formatDate(endDate)}
⏱ *Duration:* ${days} day${days > 1 ? 's' : ''}
💰 *Daily Rate:* ₹${Number(dailyRate).toLocaleString('en-IN')}
💵 *Total Amount:* ₹${Number(totalAmount).toLocaleString('en-IN')}
💳 *Advance (30%):* ₹${Number(advanceAmount).toLocaleString('en-IN')}
📍 *Delivery:* ${address || 'To be confirmed'}

━━━━━━━━━━━━━━━━
Please pay ₹${Number(advanceAmount).toLocaleString('en-IN')} advance to confirm.
Our team will call you within 2 hours.

📞 *COSOCKET:* +91 93224 51995
Thank you for choosing COSOCKET! 🚀`;

    // Message to ADMIN
    const adminMsg =
`🔔 *NEW BOOKING ALERT* 🔔

Machine: ${machineName}
Customer: ${customerName}
Phone: ${customerPhone}
Dates: ${formatDate(startDate)} → ${formatDate(endDate)} (${days} days)
Total: ₹${Number(totalAmount).toLocaleString('en-IN')} | Advance: ₹${Number(advanceAmount).toLocaleString('en-IN')}
Address: ${address || '—'}

Please follow up within 2 hours.`;

    // Open customer WhatsApp link
    const customerLink = `https://wa.me/91${customerPhone}?text=${encodeURIComponent(customerMsg)}`;
    window.open(customerLink, '_blank');

    // Admin WhatsApp — delayed 1s to avoid double-popup block
    setTimeout(() => {
        const adminLink = `https://wa.me/919322451995?text=${encodeURIComponent(adminMsg)}`;
        window.open(adminLink, '_blank');
    }, 1000);
}

function resendWhatsApp() {
    if (lastBookingData) sendBookingWhatsApp(lastBookingData);
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
    });
}

// ============================================================
// PROVIDER LISTING
// ============================================================
function showProviderModal() {
    if (!requireLogin('provider')) return;
    document.getElementById('providerModal').classList.add('show');
}

async function submitProviderListing(event) {
    event.preventDefault();
    if (!requireLogin()) return;

    const ownerName   = document.getElementById('ownerName').value.trim();
    const ownerPhone  = document.getElementById('ownerPhone').value.trim();
    const machineName = document.getElementById('machineName').value.trim();
    const category    = document.getElementById('machineCategory').value;
    const dailyRate   = parseInt(document.getElementById('dailyRent').value);
    const description = document.getElementById('machineDesc').value.trim();

    if (!ownerName)                          { showToast('Please enter your name', 'error'); return; }
    if (!/^\d{10}$/.test(ownerPhone))        { showToast('Enter a valid 10-digit number', 'error'); return; }
    if (!machineName)                        { showToast('Please enter machine name', 'error'); return; }

    const listing = {
        owner_name:  ownerName,
        owner_phone: ownerPhone,
        owner_id:    currentUser?.id || null,
        machine_name: machineName,
        category,
        daily_rate:  dailyRate,
        description: description || null,
        status:      'pending_approval',
    };

    try {
        const { error } = await getSupabase().from('provider_listings').insert([listing]);
        if (error) console.warn('Provider listing insert error:', error);
    } catch (e) { console.warn('Supabase unreachable for listing:', e); }

    const thankYouMsg =
`🙏 *Thank you for listing with COSOCKET!* 🙏

Hello ${ownerName}, we've received your listing:

🔧 *Machine:* ${machineName}
🏷 *Category:* ${getCategoryName(category)}
💰 *Daily Rate:* ₹${dailyRate.toLocaleString('en-IN')}

Our team will review and approve within 24 hours.
📞 Questions? Call: +91 93224 51995

Welcome to COSOCKET! 🚀`;

    const adminMsg =
`🆕 *NEW MACHINE LISTING*

Owner: ${ownerName} | ${ownerPhone}
Machine: ${machineName}
Category: ${getCategoryName(category)}
Rate: ₹${dailyRate.toLocaleString('en-IN')}/day
Description: ${description || '—'}

Please review and approve.`;

    window.open(`https://wa.me/91${ownerPhone}?text=${encodeURIComponent(thankYouMsg)}`, '_blank');
    setTimeout(() => {
        window.open(`https://wa.me/919322451995?text=${encodeURIComponent(adminMsg)}`, '_blank');
    }, 1000);

    closeModal('providerModal');
    document.getElementById('providerForm').reset();
    showToast('Listing submitted! Check WhatsApp ✅');
}

// ============================================================
// AUTH — Email + Password via Supabase
// ============================================================
let loginPurposeText = '';

function showLoginModal(message) {
    loginPurposeText = message || '';
    const hint = document.getElementById('loginHint');
    if (hint) hint.textContent = loginPurposeText;
    switchAuthTab('login');
    document.getElementById('loginModal').classList.add('show');
}

function switchAuthTab(tab) {
    const loginPane  = document.getElementById('loginPane');
    const signupPane = document.getElementById('signupPane');
    const tabLogin   = document.getElementById('tabLogin');
    const tabSignup  = document.getElementById('tabSignup');
    if (!loginPane) return;

    if (tab === 'login') {
        loginPane.style.display  = 'block';
        signupPane.style.display = 'none';
        tabLogin.classList.add('auth-tab--active');
        tabSignup.classList.remove('auth-tab--active');
    } else {
        loginPane.style.display  = 'none';
        signupPane.style.display = 'block';
        tabLogin.classList.remove('auth-tab--active');
        tabSignup.classList.add('auth-tab--active');
    }
    ['loginError', 'signupError'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.textContent = ''; el.style.color = '#ef4444'; }
    });
}

async function handleLogin(event) {
    event.preventDefault();
    const email    = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errEl    = document.getElementById('loginError');
    const btn      = document.getElementById('loginSubmitBtn');

    errEl.textContent = '';
    btn.textContent   = 'Signing in…';
    btn.disabled      = true;

    try {
        const { data, error } = await getSupabase().auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuthSuccess(data.user);
    } catch (err) {
        errEl.textContent = friendlyAuthError(err.message);
    } finally {
        btn.textContent = 'Sign In';
        btn.disabled    = false;
    }
}

async function handleSignup(event) {
    event.preventDefault();
    const name     = document.getElementById('signupName').value.trim();
    const email    = document.getElementById('signupEmail').value.trim();
    const phone    = document.getElementById('signupPhone').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirm  = document.getElementById('signupConfirm').value;
    const errEl    = document.getElementById('signupError');
    const btn      = document.getElementById('signupSubmitBtn');

    errEl.textContent = '';
    errEl.style.color = '#ef4444';

    if (!name)                               { errEl.textContent = 'Please enter your name.'; return; }
    if (phone && !/^\d{10}$/.test(phone))    { errEl.textContent = 'Enter a valid 10-digit WhatsApp number.'; return; }
    if (password.length < 6)                 { errEl.textContent = 'Password must be at least 6 characters.'; return; }
    if (password !== confirm)                { errEl.textContent = 'Passwords do not match.'; return; }

    btn.textContent = 'Creating account…';
    btn.disabled    = true;

    try {
        const { data, error } = await getSupabase().auth.signUp({
            email,
            password,
            options: { data: { full_name: name, phone: phone || '' } }
        });
        if (error) throw error;

        if (data.user && data.session) {
            onAuthSuccess(data.user);
        } else {
            // Email confirmation is ON in Supabase settings
            errEl.style.color = '#22c55e';
            errEl.textContent = '✅ Account created! Check your email to confirm, then sign in.';
            setTimeout(() => switchAuthTab('login'), 3500);
        }
    } catch (err) {
        errEl.textContent = friendlyAuthError(err.message);
    } finally {
        btn.textContent = 'Create Account';
        btn.disabled    = false;
    }
}

function friendlyAuthError(msg) {
    if (!msg) return 'Something went wrong. Please try again.';
    if (msg.includes('Invalid login credentials'))  return 'Wrong email or password.';
    if (msg.includes('Email not confirmed'))         return 'Please confirm your email first, then sign in.';
    if (msg.includes('User already registered'))     return 'An account with this email already exists. Try signing in.';
    if (msg.includes('Password should be'))          return 'Password must be at least 6 characters.';
    return msg;
}

function onAuthSuccess(supabaseUser) {
    const meta = supabaseUser.user_metadata || {};
    currentUser = {
        id:    supabaseUser.id,
        email: supabaseUser.email,
        name:  meta.full_name || supabaseUser.email,
        phone: meta.phone || '',
    };
    localStorage.setItem('user', JSON.stringify(currentUser));

    closeModal('loginModal');
    updateNavForAuthState();
    showToast(`Welcome, ${currentUser.name}! ✅`);
    displayMachines(allMachines);

    const pending = sessionStorage.getItem('pendingAction');
    if (pending) {
        sessionStorage.removeItem('pendingAction');
        setTimeout(() => resumePendingAction(pending), 300);
    }
}

async function handleLogout() {
    try { await getSupabase().auth.signOut(); } catch (_) {}
    localStorage.removeItem('user');
    currentUser = null;
    updateNavForAuthState();
    displayMachines(allMachines);
    showToast('Logged out.');
}

// ============================================================
// UTILS
// ============================================================
function scrollToSection(id) {
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
}

function closeModal(id) {
    document.getElementById(id)?.classList.remove('show');
}

function showToast(message, type = 'success') {
    document.querySelectorAll('.toast').forEach(t => t.remove());
    const t = document.createElement('div');
    t.className = `toast${type === 'error' ? ' error' : ''}`;
    t.textContent = message;
    document.body.appendChild(t);
    setTimeout(() => t?.remove(), 4000);
}

function handleLoginBtn() {
    if (isLoggedIn()) window.location.href = 'dashboard.html';
    else showLoginModal();
}

window.onclick = function(e) {
    if (e.target.classList && e.target.classList.contains('modal')) {
        e.target.classList.remove('show');
        hideSuggestions();
    }
};