// ============================================
// SUPABASE CONFIGURATION
// ============================================
// IMPORTANT: Replace these with your actual Supabase credentials
const SUPABASE_URL = 'https://ktajpeiiwipmjozwxbkx.supabase.co/rest/v1/';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0YWpwZWlpd2lwbWpvend4Ymt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NjQ0MDgsImV4cCI6MjA5NjA0MDQwOH0.mWfI2_jTQn3o8KUgnem5N0IJgD2qYIJu4dibPhDpj5I';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// GLOBAL VARIABLES
// ============================================
let currentUser = null;
let allMachines = [];

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    loadMachines();
    setupEventListeners();
    checkLoginStatus();
});

function setupEventListeners() {
    // Close modals when clicking outside
    window.onclick = (event) => {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    };
}

// ============================================
// MACHINE MANAGEMENT
// ============================================
async function loadMachines() {
    try {
        // Fetch machines from Supabase
        const { data, error } = await supabase
            .from('machines')
            .select('*')
            .eq('status', 'available');
        
        if (error) throw error;
        
        if (data && data.length > 0) {
            allMachines = data;
            displayMachines(data);
        } else {
            // Load default machines if no data
            loadDefaultMachines();
        }
    } catch (error) {
        console.error('Error loading machines:', error);
        loadDefaultMachines();
    }
}

function loadDefaultMachines() {
    // Default machine catalog
    const defaultMachines = [
        { id: 1, name: 'CNC Milling Machine', category: 'metal', price: 2800, description: '3-axis precision milling for metal parts', owner: 'COSOCKET', available: true },
        { id: 2, name: 'Hydraulic Press Brake', category: 'metal', price: 3200, description: '200T capacity for sheet metal bending', owner: 'COSOCKET', available: true },
        { id: 3, name: 'CNC Laser Cutting Machine', category: 'metal', price: 5500, description: 'Fiber laser for precision cutting', owner: 'COSOCKET', available: true },
        { id: 4, name: 'Power Loom', category: 'textile', price: 1500, description: 'Industrial weaving machine', owner: 'COSOCKET', available: true },
        { id: 5, name: 'Embroidery Machine', category: 'textile', price: 2000, description: 'Multi-head computerized embroidery', owner: 'COSOCKET', available: true },
        { id: 6, name: 'Flour Mill', category: 'food', price: 1500, description: 'Commercial flour milling', owner: 'COSOCKET', available: true },
        { id: 7, name: 'Oil Expeller', category: 'food', price: 2000, description: 'Cold press oil extraction', owner: 'COSOCKET', available: true },
        { id: 8, name: 'Offset Printing Press', category: 'print', price: 5000, description: 'High-volume commercial printing', owner: 'COSOCKET', available: true },
        { id: 9, name: 'Flexographic Printing Machine', category: 'print', price: 4500, description: 'Flexible packaging printing', owner: 'COSOCKET', available: true },
        { id: 10, name: 'Surface Grinding Machine', category: 'metal', price: 1600, description: 'Precision surface finishing', owner: 'COSOCKET', available: true },
        { id: 11, name: 'TIG Welding Set', category: 'metal', price: 1000, description: 'Precision TIG welding', owner: 'COSOCKET', available: true },
        { id: 12, name: 'Dyeing Machine', category: 'textile', price: 2500, description: 'Industrial fabric dyeing', owner: 'COSOCKET', available: true }
    ];
    
    allMachines = defaultMachines;
    displayMachines(defaultMachines);
}

function displayMachines(machines) {
    const grid = document.getElementById('machinesGrid');
    if (!grid) return;
    
    grid.innerHTML = machines.map(machine => `
        <div class="machine-card">
            <div class="machine-icon">
                ${getMachineIcon(machine.category)}
            </div>
            <div class="machine-info">
                <h3>${machine.name}</h3>
                <div class="machine-category">${getCategoryName(machine.category)}</div>
                <p class="machine-desc">${machine.description}</p>
                <div class="machine-price">₹${machine.price} <small>/day</small></div>
                <button class="book-now" onclick="openBookingModal('${machine.name}', ${machine.price})">
                    Book Now
                </button>
            </div>
        </div>
    `).join('');
}

function getMachineIcon(category) {
    const icons = {
        metal: '⚙️',
        textile: '🧵',
        food: '🌾',
        print: '🖨️'
    };
    return icons[category] || '🔧';
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

function filterMachines(category) {
    // Update active button
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Filter machines
    const filtered = category === 'all' 
        ? allMachines 
        : allMachines.filter(m => m.category === category);
    
    displayMachines(filtered);
}

function searchMachines() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filtered = allMachines.filter(machine => 
        machine.name.toLowerCase().includes(searchTerm) ||
        machine.description.toLowerCase().includes(searchTerm)
    );
    displayMachines(filtered);
}

// ============================================
// BOOKING SYSTEM WITH WHATSAPP
// ============================================
function openBookingModal(machineName, price) {
    document.getElementById('bookingMachineName').value = machineName;
    document.getElementById('bookingModal').style.display = 'flex';
    
    // Set min date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('startDate').min = today;
    document.getElementById('endDate').min = today;
}

document.getElementById('bookingForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const bookingData = {
        machine_name: document.getElementById('bookingMachineName').value,
        customer_name: document.getElementById('customerName').value,
        customer_phone: document.getElementById('customerPhone').value,
        start_date: document.getElementById('startDate').value,
        end_date: document.getElementById('endDate').value,
        address: document.getElementById('address').value,
        status: 'pending',
        created_at: new Date().toISOString()
    };
    
    // Validate phone number
    if (!/^\d{10}$/.test(bookingData.customer_phone)) {
        showToast('Please enter a valid 10-digit phone number', 'error');
        return;
    }
    
    try {
        // Save to Supabase
        const { data, error } = await supabase
            .from('bookings')
            .insert([bookingData])
            .select();
        
        if (error) throw error;
        
        // Send WhatsApp notification
        await sendWhatsAppNotification(bookingData);
        
        showToast('Booking confirmed! Check WhatsApp for details', 'success');
        closeModal();
        document.getElementById('bookingForm').reset();
        
    } catch (error) {
        console.error('Booking error:', error);
        showToast('Booking failed. Please try again.', 'error');
    }
});

async function sendWhatsAppNotification(booking) {
    // Calculate total days and amount
    const start = new Date(booking.start_date);
    const end = new Date(booking.end_date);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    // Find machine price
    const machine = allMachines.find(m => m.name === booking.machine_name);
    const dailyRate = machine ? machine.price : 2000;
    const totalAmount = days * dailyRate;
    const advanceAmount = Math.ceil(totalAmount * 0.3);
    
    // WhatsApp message
    const message = `🏭 *COSOCKET - Booking Confirmed* 🏭

✅ *Booking Details:*
━━━━━━━━━━━━━━━━━━━
📌 *Machine:* ${booking.machine_name}
👤 *Customer:* ${booking.customer_name}
📅 *Start Date:* ${booking.start_date}
📅 *End Date:* ${booking.end_date}
⏱️ *Duration:* ${days} days
💰 *Daily Rate:* ₹${dailyRate}
💵 *Total Amount:* ₹${totalAmount}
💳 *Advance (30%):* ₹${advanceAmount}
📍 *Delivery Address:* ${booking.address || 'To be confirmed'}

━━━━━━━━━━━━━━━━━━━
📞 *Need help?* Call us: +91 93224 51995
💬 *Reply to this message for support*

Thank you for choosing COSOCKET! 🚀`;
    
    // Encode for WhatsApp API
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${booking.customer_phone}?text=${encodedMessage}`;
    
    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank');
    
    // Also send to admin
    const adminMessage = `🔔 *NEW BOOKING ALERT* 🔔
    
Machine: ${booking.machine_name}
Customer: ${booking.customer_name}
Phone: ${booking.customer_phone}
Dates: ${booking.start_date} to ${booking.end_date}
Amount: ₹${advanceAmount} (advance)`;
    
    const adminWhatsapp = `https://wa.me/919322451995?text=${encodeURIComponent(adminMessage)}`;
    window.open(adminWhatsapp, '_blank');
}

// ============================================
// PROVIDER REGISTRATION
// ============================================
function showProviderModal() {
    document.getElementById('providerModal').style.display = 'flex';
}

function closeProviderModal() {
    document.getElementById('providerModal').style.display = 'none';
    document.getElementById('providerForm').reset();
}

document.getElementById('providerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const providerData = {
        owner_name: document.getElementById('ownerName').value,
        owner_phone: document.getElementById('ownerPhone').value,
        machine_name: document.getElementById('machineName').value,
        category: document.getElementById('machineCategory').value,
        daily_rate: parseInt(document.getElementById('dailyRent').value),
        description: document.getElementById('machineDesc').value,
        availability: document.getElementById('availability').value,
        status: 'pending_approval',
        created_at: new Date().toISOString()
    };
    
    if (!/^\d{10}$/.test(providerData.owner_phone)) {
        showToast('Please enter a valid 10-digit phone number', 'error');
        return;
    }
    
    try {
        // Save to Supabase
        const { data, error } = await supabase
            .from('provider_listings')
            .insert([providerData])
            .select();
        
        if (error) throw error;
        
        // Notify admin
        const adminMessage = `🆕 *NEW MACHINE LISTING REQUEST* 🆕
        
Owner: ${providerData.owner_name}
Phone: ${providerData.owner_phone}
Machine: ${providerData.machine_name}
Category: ${providerData.category}
Daily Rate: ₹${providerData.daily_rate}
        
Please review and approve.`;
        
        const adminWhatsapp = `https://wa.me/919322451995?text=${encodeURIComponent(adminMessage)}`;
        window.open(adminWhatsapp, '_blank');
        
        // Thank you message to provider
        const thankYouMessage = `🙏 *Thank you for listing with COSOCKET!* 🙏

We've received your machine listing request for:
🔧 ${providerData.machine_name}

Our team will review and approve within 24 hours.
You'll receive a WhatsApp confirmation once approved.

📞 Questions? Call us: +91 93224 51995

Welcome to the COSOCKET family! 🚀`;
        
        const providerWhatsapp = `https://wa.me/${providerData.owner_phone}?text=${encodeURIComponent(thankYouMessage)}`;
        window.open(providerWhatsapp, '_blank');
        
        showToast('Listing submitted! Check WhatsApp for confirmation', 'success');
        closeProviderModal();
        
    } catch (error) {
        console.error('Provider registration error:', error);
        showToast('Submission failed. Please try again.', 'error');
    }
});

// ============================================
// LOGIN SYSTEM
// ============================================
function showLoginModal() {
    document.getElementById('loginModal').style.display = 'flex';
}

function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
}

document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const phone = document.getElementById('loginPhone').value;
    
    if (!/^\d{10}$/.test(phone)) {
        showToast('Please enter a valid 10-digit phone number', 'error');
        return;
    }
    
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    
    // Send OTP via WhatsApp
    const otpMessage = `🔐 *COSOCKET Login OTP* 🔐

Your OTP is: *${otp}*

This OTP is valid for 10 minutes.

If you didn't request this, please ignore.`;
    
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(otpMessage)}`;
    window.open(whatsappUrl, '_blank');
    
    // Store OTP for verification (in production, use Supabase auth)
    sessionStorage.setItem('login_otp', otp);
    sessionStorage.setItem('login_phone', phone);
    
    showToast(`OTP sent to ${phone}. Check WhatsApp`, 'success');
    
    // Show OTP input
    const otpInput = prompt('Enter the OTP sent to your WhatsApp:');
    if (otpInput === String(otp)) {
        currentUser = { phone: phone, role: 'provider' };
        localStorage.setItem('user', JSON.stringify(currentUser));
        showToast('Login successful!', 'success');
        closeLoginModal();
        window.location.href = 'dashboard.html';
    } else {
        showToast('Invalid OTP', 'error');
    }
});

function checkLoginStatus() {
    const user = localStorage.getItem('user');
    if (user) {
        currentUser = JSON.parse(user);
        // Update UI for logged-in user
        const loginBtn = document.querySelector('.btn-login');
        if (loginBtn) {
            loginBtn.textContent = 'Dashboard';
            loginBtn.onclick = () => window.location.href = 'dashboard.html';
        }
    }
}

function logout() {
    localStorage.removeItem('user');
    currentUser = null;
    showToast('Logged out successfully', 'success');
    setTimeout(() => location.reload(), 1000);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

function closeModal() {
    document.getElementById('bookingModal').style.display = 'none';
}

function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
}