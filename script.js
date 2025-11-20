// --- DATA INITIALIZATION ---
const DEFAULT_PACKAGES = [
    {
        id: 1,
        title: "Luxury Escape — Palatial Coastal Retreat",
        tagline: "Handpicked villas, private experiences.",
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
        price: "₹49,999",
        priceUnit: "/ person",
        duration: "5 nights",
        pax: "2 Adults",
        category: "Luxury",
        inclusions: ["Premium sea-view suite", "Daily breakfast", "Private sunset cruise"],
        itinerary: [{day: 1, act: "Arrival & Sunset Lounge"}, {day: 2, act: "Beach Cabana"}]
    },
    {
        id: 2,
        title: "Family Getaway — Theme & Comfort",
        tagline: "Kid-friendly amenities, nanny-on-request.",
        image: "https://images.unsplash.com/photo-1571896349842-6e5c48dc52a3?auto=format&fit=crop&w=800&q=80",
        price: "₹24,999",
        priceUnit: "/ family",
        duration: "4 nights",
        pax: "2 Adults, 2 Kids",
        category: "Family",
        inclusions: ["Family suite", "Kids’ activity pass", "Theme-park day"],
        itinerary: [{day: 1, act: "Kids Club Orientation"}, {day: 2, act: "Theme Park Access"}]
    },
    {
        id: 3,
        title: "Romance Retreat — Boutique Honeymoon",
        tagline: "Privacy-first experiences, sunset proposals.",
        image: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80",
        price: "₹34,999",
        priceUnit: "/ couple",
        duration: "3 nights",
        pax: "Couples",
        category: "Romantic",
        inclusions: ["Romantic suite setup", "Candlelight dinner", "Couple’s spa"],
        itinerary: [{day: 1, act: "Champagne Welcome"}, {day: 2, act: "Couples Massage"}]
    }
];

// Load Data from LocalStorage or Use Default
let appData = JSON.parse(localStorage.getItem('tgf_packages'));
if (!appData || appData.length === 0) {
    appData = DEFAULT_PACKAGES;
    localStorage.setItem('tgf_packages', JSON.stringify(appData));
}

// --- ROUTER ---
const router = {
    current: 'home',
    navigate: (page, data = null) => {
        // Hide all views
        document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));
        
        // Mobile Menu Hide
        document.getElementById('mobile-menu').classList.add('hidden');

        // Navbar Logic
        const nav = document.getElementById('navbar');
        const isAuthPage = page === 'admin-login' || page === 'admin-dashboard';

        if (page === 'home') {
            nav.classList.remove('bg-white', 'text-brand-charcoal', 'shadow-lg', 'hidden');
            nav.classList.add('text-white', 'bg-transparent');
            document.getElementById('view-home').classList.remove('hidden');
        } else if (isAuthPage) {
            nav.classList.add('hidden');
            if(page === 'admin-dashboard') nav.classList.remove('hidden'); 
            
            // Render Admin View
            if (page === 'admin-login') {
                document.getElementById('view-admin-login').classList.remove('hidden');
            } else if (page === 'admin-dashboard') {
                if (!adminAuth.isAuthenticated) {
                    router.navigate('admin-login');
                    return;
                }
                nav.classList.remove('text-white', 'bg-transparent');
                nav.classList.add('bg-white', 'text-brand-charcoal', 'shadow-lg');
                document.getElementById('view-admin-dashboard').classList.remove('hidden');
                dataManager.renderAdminList();
            }
        } else {
            nav.classList.remove('text-white', 'bg-transparent', 'hidden');
            nav.classList.add('bg-white', 'text-brand-charcoal', 'shadow-lg');

            if (page === 'detail') {
                renderDetail(data);
                document.getElementById('view-detail').classList.remove('hidden');
            } else if (page === 'contact') {
                document.getElementById('view-contact').classList.remove('hidden');
            }
        }
        window.scrollTo(0, 0);
        lucide.createIcons();
    }
};

// --- ADMIN AUTHENTICATION ---
const adminAuth = {
    isAuthenticated: false,
    login: (e) => {
        e.preventDefault();
        const id = document.getElementById('admin-id').value;
        const pass = document.getElementById('admin-pass').value;
        const errorMsg = document.getElementById('login-error');

        if (id === '12345' && pass === '12345') {
            adminAuth.isAuthenticated = true;
            errorMsg.classList.add('hidden');
            
            // Show Logout buttons
            document.getElementById('nav-logout-btn').classList.remove('hidden');
            document.getElementById('mobile-logout-btn').classList.remove('hidden');
            
            router.navigate('admin-dashboard');
        } else {
            errorMsg.classList.remove('hidden');
        }
    },
    logout: () => {
        adminAuth.isAuthenticated = false;
        document.getElementById('nav-logout-btn').classList.add('hidden');
        document.getElementById('mobile-logout-btn').classList.add('hidden');
        router.navigate('home');
    }
};

// --- DATA MANAGER (Admin Actions) ---
const dataManager = {
    addPackage: (e) => {
        e.preventDefault();
        
        // 1. Get the File
        const fileInput = document.getElementById('pkg-img');
        const file = fileInput.files[0];

        if (!file) {
            alert("Please upload an image.");
            return;
        }

        // 2. Read the file as Base64
        const reader = new FileReader();

        reader.onload = function(event) {
            const imageBase64 = event.target.result;

            // 3. Create Package Object
            const newPkg = {
                id: Date.now(), 
                title: document.getElementById('pkg-title').value,
                tagline: document.getElementById('pkg-tagline').value,
                price: document.getElementById('pkg-price').value,
                priceUnit: document.getElementById('pkg-unit').value,
                duration: document.getElementById('pkg-duration').value,
                category: document.getElementById('pkg-cat').value,
                image: imageBase64, // Store the base64 string
                pax: "2 Adults", 
                inclusions: ["Accommodation", "Breakfast", "Transfers"],
                itinerary: [{day: 1, act: "Check-in"}, {day: 2, act: "Leisure"}]
            };

            // 4. Save
            appData.push(newPkg);
            localStorage.setItem('tgf_packages', JSON.stringify(appData));

            // 5. Refresh UI
            alert('Package Published Successfully!');
            e.target.reset(); // Clear form
            dataManager.renderAdminList();
            renderGrid(); 
        };

        // Trigger the read
        reader.readAsDataURL(file);
    },

    deletePackage: (id) => {
        if(confirm('Are you sure you want to delete this package?')) {
            appData = appData.filter(p => p.id !== id);
            localStorage.setItem('tgf_packages', JSON.stringify(appData));
            dataManager.renderAdminList();
            renderGrid();
        }
    },

    renderAdminList: () => {
        const list = document.getElementById('admin-package-list');
        if(appData.length === 0) {
            list.innerHTML = '<p class="text-gray-500 text-center">No active packages.</p>';
            return;
        }
        list.innerHTML = appData.map(pkg => `
            <div class="admin-pkg-card">
                <img src="${pkg.image}" class="admin-pkg-img" alt="thumb">
                <div class="flex-1">
                    <h4 class="font-bold text-brand-charcoal">${pkg.title}</h4>
                    <p class="text-xs text-gray-500">${pkg.price} · ${pkg.duration}</p>
                </div>
                <button onclick="dataManager.deletePackage(${pkg.id})" class="text-red-500 hover:bg-red-50 p-2 rounded">
                    <i data-lucide="trash-2" class="w-5 h-5"></i>
                </button>
            </div>
        `).join('');
        lucide.createIcons();
    }
};

// --- UI FUNCTIONS ---

function toggleMobileMenu() {
    document.getElementById('mobile-menu').classList.toggle('hidden');
}

function scrollToPackages() {
    router.navigate('home');
    setTimeout(() => {
        document.getElementById('packages-section').scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

function renderGrid() {
    const grid = document.getElementById('packages-grid');
    grid.innerHTML = appData.map(pkg => `
        <div class="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer" onclick="router.navigate('detail', ${pkg.id})">
            <div class="relative h-64 overflow-hidden">
                <img src="${pkg.image}" onerror="this.src='https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
                <div class="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-brand-charcoal">
                    ${pkg.category}
                </div>
            </div>
            <div class="p-6">
                <div class="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <div class="flex items-center gap-1"><i data-lucide="clock" class="w-4 h-4"></i> ${pkg.duration}</div>
                    <span class="mx-1">·</span>
                    <div class="flex items-center gap-1"><i data-lucide="users" class="w-4 h-4"></i> ${pkg.pax}</div>
                </div>
                <h3 class="text-xl font-serif font-bold text-brand-charcoal mb-2 group-hover:text-brand-gold transition-colors">
                    ${pkg.title.split("—")[0]}
                </h3>
                <p class="text-gray-500 text-sm mb-4 line-clamp-2">${pkg.tagline}</p>
                <div class="flex items-end justify-between mt-4 pt-4 border-t border-gray-100">
                    <div>
                        <p class="text-xs text-gray-400 uppercase tracking-wider">Starting from</p>
                        <div class="flex items-baseline gap-1">
                            <span class="text-lg font-bold text-brand-charcoal">${pkg.price}</span>
                            <span class="text-xs text-gray-500">${pkg.priceUnit}</span>
                        </div>
                    </div>
                    <div class="w-10 h-10 rounded-full bg-brand-stone text-brand-charcoal flex items-center justify-center hover:bg-brand-charcoal hover:text-brand-gold transition-colors">
                        <i data-lucide="arrow-right" class="w-5 h-5"></i>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    lucide.createIcons();
}

function renderDetail(id) {
    const pkg = appData.find(p => p.id === id);
    if(!pkg) return;

    const container = document.getElementById('view-detail');
    container.innerHTML = `
        <div class="relative h-[60vh] w-full">
            <img src="${pkg.image}" onerror="this.src='https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'" class="w-full h-full object-cover">
            <div class="absolute inset-0 bg-black/40 flex items-end">
                <div class="container mx-auto px-6 pb-12 text-white">
                    <button onclick="router.navigate('home')" class="mb-6 flex items-center gap-2 hover:text-brand-gold transition-colors">
                        <i data-lucide="arrow-left" class="w-4 h-4"></i> Back to collections
                    </button>
                    <div class="bg-brand-gold text-xs font-bold px-3 py-1 inline-block rounded mb-4">${pkg.category} Collection</div>
                    <h1 class="text-4xl md:text-6xl font-serif font-bold mb-4">${pkg.title}</h1>
                </div>
            </div>
        </div>
        <div class="container mx-auto px-6 -mt-10 relative z-10">
            <div class="grid lg:grid-cols-3 gap-8">
                <div class="lg:col-span-2 space-y-8">
                    <div class="bg-white p-8 rounded-xl shadow-sm">
                        <h3 class="text-2xl font-serif font-bold mb-4">Experience Overview</h3>
                        <p class="text-gray-600 leading-relaxed mb-6">${pkg.tagline} A curated experience designed for memory making.</p>
                        <h4 class="font-bold text-lg mb-3 flex items-center gap-2"><i data-lucide="check-circle" class="text-brand-teal w-5 h-5"></i> Inclusions</h4>
                        <ul class="grid md:grid-cols-2 gap-3">${pkg.inclusions.map(i => `<li class="flex items-start gap-2 text-gray-600 text-sm"><span class="w-1.5 h-1.5 rounded-full bg-brand-gold mt-2"></span>${i}</li>`).join('')}</ul>
                    </div>
                    <div class="bg-white p-8 rounded-xl shadow-sm">
                        <h3 class="text-2xl font-serif font-bold mb-6">Itinerary</h3>
                        <div class="space-y-6">
                            ${pkg.itinerary.map(d => `
                                <div class="flex gap-4">
                                    <div class="flex-shrink-0 w-12 text-center"><span class="block text-xs text-gray-400 uppercase">Day</span><span class="block text-xl font-bold text-brand-gold">${d.day}</span></div>
                                    <div class="pb-6 border-b border-gray-100 w-full last:border-0"><h4 class="font-bold text-brand-charcoal">${d.act}</h4><p class="text-sm text-gray-500 mt-1">Scheduled activity.</p></div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                <div class="lg:col-span-1">
                    <div class="bg-white p-6 rounded-xl shadow-lg sticky top-24">
                        <div class="mb-6"><p class="text-sm text-gray-400 uppercase">Starting Price</p><div class="flex items-baseline gap-1"><span class="text-3xl font-serif font-bold text-brand-charcoal">${pkg.price}</span></div></div>
                        <button class="w-full py-3 bg-brand-gold text-white rounded-full font-medium hover:shadow-xl transition-all" onclick="alert('Booking engine would open here')">Proceed to Book</button>
                        <p class="text-xs text-center text-gray-400 mt-3">No charge until confirmation</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 md:hidden z-30 flex items-center justify-between shadow-[0_-5px_15px_rgba(0,0,0,0.1)]">
            <div><p class="text-xs text-gray-500">Starting from</p><p class="font-bold text-brand-charcoal">${pkg.price}</p></div>
            <button class="px-6 py-2 bg-brand-gold text-white rounded-full font-medium" onclick="alert('Booking...')">Book Now</button>
        </div>
    `;
    lucide.createIcons();
}

// --- TRIP BUILDER ---
const tripBuilder = {
    step: 0,
    data: {},
    open: () => {
        document.getElementById('trip-modal').classList.remove('hidden');
        setTimeout(() => {
            document.getElementById('trip-modal').classList.remove('opacity-0');
            document.getElementById('trip-modal-content').classList.remove('scale-95');
        }, 10);
        tripBuilder.renderStep0();
    },
    close: () => {
        document.getElementById('trip-modal').classList.add('opacity-0');
        document.getElementById('trip-modal-content').classList.add('scale-95');
        setTimeout(() => {
            document.getElementById('trip-modal').classList.add('hidden');
            tripBuilder.step = 0;
        }, 300);
    },
    renderStep0: () => {
        document.getElementById('trip-body').innerHTML = `
            <div class="space-y-6 text-center fade-in">
                <h3 class="text-lg font-bold text-brand-charcoal">What's your vibe?</h3>
                <div class="grid grid-cols-2 gap-4">
                    ${['Relaxation', 'Adventure', 'Romantic', 'Family Fun'].map(v => `
                        <button onclick="tripBuilder.renderStep1('${v}')" class="p-4 border border-gray-200 rounded-xl hover:border-brand-gold hover:bg-brand-gold/5 transition-all font-medium text-gray-600 hover:text-brand-charcoal">${v}</button>
                    `).join('')}
                </div>
            </div>
        `;
    },
    renderStep1: (vibe) => {
        document.getElementById('trip-body').innerHTML = `
             <div class="space-y-6 text-center fade-in">
                <h3 class="text-lg font-bold text-brand-charcoal">How long are you staying?</h3>
                <div class="flex justify-center gap-4 flex-wrap">
                    <button onclick="tripBuilder.renderResult()" class="px-6 py-3 border rounded-lg hover:bg-gray-50">Weekend</button>
                    <button onclick="tripBuilder.renderResult()" class="px-6 py-3 border rounded-lg hover:bg-gray-50">4-6 Days</button>
                    <button onclick="tripBuilder.renderResult()" class="px-6 py-3 border rounded-lg hover:bg-gray-50">1 Week+</button>
                </div>
             </div>
        `;
    },
    renderResult: () => {
        document.getElementById('trip-body').innerHTML = `<div class="animate-pulse text-brand-gold text-center font-bold">AI Engine Processing...</div>`;
        setTimeout(() => {
            const pkg = appData[Math.floor(Math.random() * appData.length)];
            document.getElementById('trip-body').innerHTML = `
                <div class="text-center fade-in">
                    <h3 class="text-xl font-serif font-bold text-brand-charcoal mb-4">We found a match!</h3>
                    <div class="bg-brand-stone p-4 rounded-xl mb-6 text-left flex items-center gap-4">
                        <img src="${pkg.image}" onerror="this.src='https://images.unsplash.com/photo-1566073771259-6a8506099945'" class="w-24 h-24 rounded-lg object-cover">
                        <div>
                            <h4 class="font-bold">${pkg.title.split("—")[0]}</h4>
                            <p class="text-sm text-gray-500">${pkg.duration} · ${pkg.price}</p>
                            <div class="mt-2 text-xs bg-brand-gold text-white inline-block px-2 py-1 rounded">98% Match</div>
                        </div>
                    </div>
                    <div class="flex gap-4 justify-center">
                        <button onclick="tripBuilder.close(); router.navigate('detail', ${pkg.id})" class="px-6 py-2 bg-brand-gold text-white rounded-full">View Details</button>
                        <button onclick="tripBuilder.renderStep0()" class="px-6 py-2 border border-gray-300 rounded-full">Start Over</button>
                    </div>
                </div>
            `;
        }, 1500);
    }
};

// Navbar Scroll Effect
window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    if (router.current === 'home') { // Check logical state if implementing deeper state checks
        // Simplified check: only if we are on Home view visually
        if (!document.getElementById('view-home').classList.contains('hidden')) {
            if (window.scrollY > 50) {
                nav.classList.remove('bg-transparent', 'text-white');
                nav.classList.add('bg-white', 'text-brand-charcoal', 'shadow-lg');
            } else {
                nav.classList.add('bg-transparent', 'text-white');
                nav.classList.remove('bg-white', 'text-brand-charcoal', 'shadow-lg');
            }
        }
    }
});

// INITIALIZE
renderGrid();
lucide.createIcons();
