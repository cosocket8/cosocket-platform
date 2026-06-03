// ========== MACHINE DATA ==========
let allMachines = [
    { id: 1, name: 'CNC Milling Machine', category: 'metal', price: 2800, description: '3-axis precision milling for metal parts, moulds & components', icon: '⚙️' },
    { id: 2, name: 'Hydraulic Press Brake', category: 'metal', price: 3200, description: '200T capacity for sheet metal bending', icon: '🔧' },
    { id: 3, name: 'CNC Laser Cutting Machine', category: 'metal', price: 5500, description: 'Fiber laser for precision cutting', icon: '✨' },
    { id: 4, name: 'Power Loom', category: 'textile', price: 1500, description: 'Industrial weaving machine', icon: '🧵' },
    { id: 5, name: 'Embroidery Machine', category: 'textile', price: 2000, description: 'Multi-head computerized embroidery', icon: '🪡' },
    { id: 6, name: 'Flour Mill', category: 'food', price: 1500, description: 'Commercial flour milling', icon: '🌾' },
    { id: 7, name: 'Oil Expeller', category: 'food', price: 2000, description: 'Cold press oil extraction', icon: '🫒' },
    { id: 8, name: 'Offset Printing Press', category: 'print', price: 5000, description: 'High-volume commercial printing', icon: '📰' },
    { id: 9, name: 'Surface Grinding Machine', category: 'metal', price: 1600, description: 'Precision surface finishing', icon: '🔨' },
    { id: 10, name: 'TIG Welding Set', category: 'metal', price: 1000, description: 'Precision TIG welding', icon: '⚡' },
    { id: 11, name: 'Dyeing Machine', category: 'textile', price: 2500, description: 'Industrial fabric dyeing', icon: '🎨' },
    { id: 12, name: 'Waterjet Cutting Machine', category: 'metal', price: 4800, description: 'Cold cutting for any material', icon: '💧' },
    { id: 13, name: 'Spot Welding Machine', category: 'metal', price: 1200, description: 'Resistance spot welding for sheet metal', icon: '🔵' },
    { id: 14, name: 'Snack Extruder', category: 'food', price: 5000, description: 'For namkeen, corn puffs and pasta', icon: '🍟' },
    { id: 15, name: 'Bottle Filling Machine', category: 'food', price: 2500, description: 'Automatic filling for bottles and jars', icon: '🍾' },
    { id: 16, name: 'Die Cutting Machine', category: 'print', price: 2200, description: 'Custom shape cutting for packaging', icon: '✂️' },
    { id: 17, name: 'Laminator', category: 'print', price: 1800, description: 'Thermal lamination for prints', icon: '✨' },
    { id: 18, name: 'Flexographic Printing Machine', category: 'print', price: 4500, description: 'Flexible packaging printing', icon: '🖨️' }
];

let currentFilter = 'all';

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', function() {
    displayMachines(allMachines);
    setupDateInputs();
    loadUserLoginStatus();
    console.log('COSOCKET Website Loaded Successfully!');
});

function setupDateInputs() {
    const today = new Date().toISOString().split('T')[0];
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    if (startDate) startDate.min = today;
    if (endDate) endDate.min = today;
}

function loadUserLoginStatus() {
    const user = localStorage.getItem('user');
    if (user) {
        const loginBtn = document.querySelector('.btn-login');
        if (loginBtn) {
            loginBtn.textContent = 'Dashboard';
            loginBtn.setAttribute('onclick', 'goToDashboard()');
        }
    }
}

function goToDashboard() {
    window.location.href = 'dashboard.html';
}

// ========== DISPLAY MACHINES ==========
function displayMachines(machines) {
    const grid = document.getElementById('machinesGrid');
    if (!grid) return;
    
    if (machines.length === 0) {
        grid.innerHTML = '<p style="text-align:center; grid-column:1/-1;">No machines found. Check back soon!</p>';
        return;
    }
    
    grid.innerHTML = machines.map(machine => `
        <div class="machine-card">
            <div class="machine-icon">${machine.icon || '🔧'}</div>
            <div class="machine-info">
                <h3>${machine.name}</h3>
                <div class="machine-category">${getCategoryName(machine.category)}</div>
                <p class="machine-desc">${machine.description}</p>
                <div class="machine-price">₹${machine.price} <small>/day</small></div>
                <button class="book-now" onclick="openBookingModal('${machine.name}', ${machine.price})">Book Now</button>
            </div>
        </div>
    `).join('');
}

function getCategoryName(category) {
    const names = {
        metal: 'Fabrication & Metalworking',
        textile: 'Textile Processing',
        food: 'Food & Agro Processing',
        print: 'Printing & Packaging'
    };
    return names[category] || category;
}

function filterMachines(category, btn) {
    currentFilter = category;
    document.querySelectorAll('.cat-btn').forEach(button => button.classList.remove('active'));
    if (btn) btn.classList.add('active');
    
    const filtered = category === 'all' ? allMachines : allMachines.filter(m => m.category === category);
    displayMachines(filtered);
}

function searchMachines() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filtered = allMachines.filter(m => 
        m.name.toLowerCase().includes(searchTerm) || 
        m.description.toLowerCase().includes(searchTerm)
    );
    displayMachines(filtered);
}

// ========== BOOKING FUNCTIONS ==========
function openBookingModal(machineName, price) {
    document.getElementById('bookingMachineName').value = machineName;
    document.getElementById('bookingModal').classList.add('show');
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('startDate').min = today;
    document.getElementById('endDate').min = today;
}

function submitBooking(event) {
    event.preventDefault();
    
    const machineName = document.getElementById('bookingMachineName').value;
    const customerName = document.getElementById('customerName').value;
    const customerPhone = document.getElementById('customerPhone').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const address = document.getElementById('address').value;
    
    // Validation
    if (!customerName) {
        showToast('Please enter your name', 'error');
        return;
    }
    
    if (!/^\d{10}$/.test(customerPhone)) {
        showToast('Please enter a valid 10-digit phone number', 'error');
        return;
    }
    
    if (!startDate || !endDate) {
        showToast('Please select both start and end dates', 'error');
        return;
    }
    
    // Calculate days and amount
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const machine = allMachines.find(m => m.name === machineName);
    const dailyRate = machine ? machine.price : 2000;
    const totalAmount = days * dailyRate;
    const advanceAmount = Math.ceil(totalAmount * 0.3);
    
    // Save booking to localStorage
    const booking = {
        id: Date.now(),
        machine_name: machineName,
        customer_name: customerName,
        customer_phone: customerPhone,
        start_date: startDate,
        end_date: endDate,
        address: address,
        days: days,
        daily_rate: dailyRate,
        total_amount: totalAmount,
        advance_amount: advanceAmount,
        status: 'pending',
        created_at: new Date().toISOString()
    };
    
    let bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    bookings.push(booking);
    localStorage.setItem('bookings', JSON.stringify(bookings));
    
    // Send WhatsApp message to customer
    const customerMessage = `🏭 *COSOCKET - Booking Confirmed* 🏭

✅ *Booking Details:*
━━━━━━━━━━━━━━━━━━━
📌 *Machine:* ${machineName}
👤 *Customer:* ${customerName}
📅 *Start Date:* ${startDate}
📅 *End Date:* ${endDate}
⏱️ *Duration:* ${days} days
💰 *Daily Rate:* ₹${dailyRate}
💵 *Total Amount:* ₹${totalAmount}
💳 *Advance (30%):* ₹${advanceAmount}
📍 *Address:* ${address || 'To be confirmed'}

━━━━━━━━━━━━━━━━━━━
📞 *Need help?* Call us: +91 93224 51995

Thank you for choosing COSOCKET! 🚀`;
    
    // Send WhatsApp to admin
    const adminMessage = `🔔 *NEW BOOKING ALERT* 🔔
    
Machine: ${machineName}
Customer: ${customerName}
Phone: ${customerPhone}
Dates: ${startDate} to ${endDate}
Amount: ₹${advanceAmount} (advance)`;
    
    // Open WhatsApp chats
    window.open(`https://wa.me/${customerPhone}?text=${encodeURIComponent(customerMessage)}`, '_blank');
    setTimeout(() => {
        window.open(`https://wa.me/919322451995?text=${encodeURIComponent(adminMessage)}`, '_blank');
    }, 500);
    
    // Close modal and reset form
    closeModal('bookingModal');
    document.getElementById('bookingForm').reset();
    showToast('Booking confirmed! Check WhatsApp for details', 'success');
}

// ========== PROVIDER FUNCTIONS ==========
function showProviderModal() {
    document.getElementById('providerModal').classList.add('show');
}

function submitProviderListing(event) {
    event.preventDefault();
    
    const listing = {
        id: Date.now(),
        owner_name: document.getElementById('ownerName').value,
        owner_phone: document.getElementById('ownerPhone').value,
        machine_name: document.getElementById('machineName').value,
        category: document.getElementById('machineCategory').value,
        daily_rate: parseInt(document.getElementById('dailyRent').value),
        description: document.getElementById('machineDesc').value,
        status: 'pending',
        created_at: new Date().toISOString()
    };
    
    // Validation
    if (!listing.owner_name) {
        showToast('Please enter your name', 'error');
        return;
    }
    
    if (!/^\d{10}$/.test(listing.owner_phone)) {
        showToast('Please enter a valid 10-digit phone number', 'error');
        return;
    }
    
    if (!listing.machine_name) {
        showToast('Please enter machine name', 'error');
        return;
    }
    
    // Save to localStorage
    let listings = JSON.parse(localStorage.getItem('provider_listings') || '[]');
    listings.push(listing);
    localStorage.setItem('provider_listings', JSON.stringify(listings));
    
    // Send confirmation to provider
    const thankYouMessage = `🙏 *Thank you for listing with COSOCKET!* 🙏

We've received your machine listing request for:
🔧 ${listing.machine_name}
💰 Daily Rate: ₹${listing.daily_rate}

Our team will review and approve within 24 hours.
You'll receive a WhatsApp confirmation once approved.

📞 Questions? Call us: +91 93224 51995

Welcome to the COSOCKET family! 🚀`;
    
    // Send admin notification
    const adminMessage = `🆕 *NEW MACHINE LISTING REQUEST* 🆕
    
Owner: ${listing.owner_name}
Phone: ${listing.owner_phone}
Machine: ${listing.machine_name}
Category: ${listing.category}
Daily Rate: ₹${listing.daily_rate}
Description: ${listing.description}

Please review and approve.`;
    
    window.open(`https://wa.me/${listing.owner_phone}?text=${encodeURIComponent(thankYouMessage)}`, '_blank');
    setTimeout(() => {
        window.open(`https://wa.me/919322451995?text=${encodeURIComponent(adminMessage)}`, '_blank');
    }, 500);
    
    closeModal('providerModal');
    document.getElementById('providerForm').reset();
    showToast('Listing submitted! Check WhatsApp for confirmation', 'success');
}

// ========== LOGIN FUNCTIONS ==========
function showLoginModal() {
    document.getElementById('loginModal').classList.add('show');
}

function sendOTP(event) {
    event.preventDefault();
    const phone = document.getElementById('loginPhone').value;
    
    if (!/^\d{10}$/.test(phone)) {
        showToast('Please enter a valid 10-digit phone number', 'error');
        return;
    }
    
    // Generate random OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    
    // Send OTP via WhatsApp
    const otpMessage = `🔐 *COSOCKET Login OTP* 🔐

Your OTP is: *${otp}*

This OTP is valid for 10 minutes.

If you didn't request this, please ignore.`;
    
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(otpMessage)}`, '_blank');
    
    // Store OTP for verification
    sessionStorage.setItem('login_otp', otp);
    sessionStorage.setItem('login_phone', phone);
    
    // Prompt for OTP
    const userOtp = prompt('Enter the OTP sent to your WhatsApp:');
    
    if (userOtp === String(otp)) {
        const user = { phone: phone, role: 'provider', loginTime: new Date().toISOString() };
        localStorage.setItem('user', JSON.stringify(user));
        showToast('Login successful! Redirecting to dashboard...', 'success');
        closeModal('loginModal');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    } else {
        showToast('Invalid OTP. Please try again.', 'error');
    }
}

// ========== UTILITY FUNCTIONS ==========
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const offset = 80;
        const elementPosition = section.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = 'toast' + (type === 'error' ? ' error' : '');
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 4000);
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList && event.target.classList.contains('modal')) {
        event.target.classList.remove('show');
    }
}