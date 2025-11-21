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
        subCategory: "National", // Default data
        destinations: ["Goa", "South Goa"],
        accommodations: ["Taj Exotica (5 Star)", "Private Villa"],
        inclusions: ["Premium sea-view suite", "Daily breakfast", "Private sunset cruise"],
        itinerary: [
            {day: 1, title: "Arrival", desc: "Arrival & Welcome Drinks at Sunset Lounge. Check in to your private villa."}, 
            {day: 2, title: "Relaxation", desc: "Full day access to Beach Cabana with private butler service."}
        ]
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
        subCategory: "International", // Default data
        destinations: ["Dubai", "Yas Island"],
        accommodations: ["Atlantis The Palm", "Yas Viceroy"],
        inclusions: ["Family suite", "Kids’ activity pass", "Theme-park day"],
        itinerary: [
            {day: 1, title: "Welcome", desc: "Kids Club Orientation and Welcome Ice Cream."}, 
            {day: 2, title: "Adventure", desc: "Full Day Access to Theme Park with Fast Pass."}
        ]
    }
];

// Load Data from LocalStorage
let appData = [];
try {
    const storedData = localStorage.getItem('tgf_packages');
    appData = storedData ? JSON.parse(storedData) : [];
} catch (e) {
    console.error("Error loading data", e);
}

if (appData.length === 0) {
    appData = DEFAULT_PACKAGES;
    // Try saving default data
    try {
        localStorage.setItem('tgf_packages', JSON.stringify(appData));
    } catch (e) {
        console.warn("Could not save default data to storage.");
    }
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
                offerManager.renderAdminForm();
                
                const builder = document.getElementById('itinerary-builder-container');
                if(builder) {
                    builder.innerHTML = '';
                    dataManager.itineraryCount = 0;
                    dataManager.addItineraryDay();
                }
            }
        } else {
            nav.classList.remove('text-white', 'bg-transparent', 'hidden');
            nav.classList.add('bg-white', 'text-brand-charcoal', 'shadow-lg');

            if (page === 'detail') {
                renderDetail(data);
                document.getElementById('view-detail').classList.remove('hidden');
            } else if (page === 'contact') {
                document.getElementById('view-contact').classList.remove('hidden');
            } else if (page === 'about') {
                document.getElementById('view-about').classList.remove('hidden');
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

// --- OFFER MANAGER ---
const offerManager = {
    data: JSON.parse(localStorage.getItem('tgf_offer')) || { active: false, text: '', code: '' },

    saveOffer: (e) => {
        e.preventDefault();
        const text = document.getElementById('offer-text-input').value;
        const code = document.getElementById('offer-code-input').value;
        const active = document.getElementById('offer-active-input').checked;

        offerManager.data = { text, code, active };
        localStorage.setItem('tgf_offer', JSON.stringify(offerManager.data));
        alert('Offer Updated!');
        offerManager.renderBar();
    },

    renderAdminForm: () => {
        const textInput = document.getElementById('offer-text-input');
        if(textInput) {
            textInput.value = offerManager.data.text || '';
            document.getElementById('offer-code-input').value = offerManager.data.code || '';
            document.getElementById('offer-active-input').checked = offerManager.data.active;
        }
    },

    renderBar: () => {
        const bar = document.getElementById('top-offer-bar');
        const nav = document.getElementById('navbar');
        if (offerManager.data.active && offerManager.data.text) {
            document.getElementById('offer-display-text').innerText = offerManager.data.text;
            const codeEl = document.getElementById('offer-display-code');
            if(offerManager.data.code) {
                codeEl.innerText = offerManager.data.code;
                codeEl.classList.remove('hidden');
            } else {
                codeEl.classList.add('hidden');
            }
            bar.classList.remove('hidden');
            nav.classList.add('offer-active');
        } else {
            bar.classList.add('hidden');
            nav.classList.remove('offer-active');
        }
    }
};

// --- DATA MANAGER ---
const dataManager = {
    itineraryCount: 0,

    addItineraryDay: () => {
        dataManager.itineraryCount++;
        const container = document.getElementById('itinerary-builder-container');
        const dayId = dataManager.itineraryCount;
        
        const dayHtml = `
            <div class="p-3 border border-gray-200 rounded bg-gray-50" id="day-row-${dayId}">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-xs font-bold uppercase text-brand-gold">Day ${dayId}</span>
                    ${dayId > 1 ? `<button type="button" onclick="document.getElementById('day-row-${dayId}').remove()" class="text-red-500 text-xs hover:underline">Remove</button>` : ''}
                </div>
                <input type="text" class="w-full p-2 mb-2 text-sm border rounded" placeholder="Title (e.g. Arrival)" name="day-title-${dayId}">
                <textarea class="w-full p-2 text-sm border rounded" rows="2" placeholder="Detailed description of activities..." name="day-desc-${dayId}"></textarea>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', dayHtml);
    },

    addPackage: (e) => {
        e.preventDefault();
        
        const fileInput = document.getElementById('pkg-img');
        const file = fileInput.files[0];

        if (!file) {
            alert("Please upload an image.");
            return;
        }

        if (file.size > 2000000) {
            alert("Image is too large! Please upload an image smaller than 2MB to prevent storage errors.");
            return;
        }

        const reader = new FileReader();

        reader.onload = function(event) {
            try {
                const imageBase64 = event.target.result;

                const rawPrice = document.getElementById('pkg-price').value;
                const formattedPrice = '₹' + new Intl.NumberFormat('en-IN').format(rawPrice);
                
                const inclusionsRaw = document.getElementById('pkg-inclusions').value;
                const inclusionsList = inclusionsRaw.split(',').map(item => item.trim()).filter(i => i);
                
                const destinationsRaw = document.getElementById('pkg-destinations').value;
                const destinationsList = destinationsRaw.split(',').map(item => item.trim()).filter(i => i);

                const accommodationsRaw = document.getElementById('pkg-accommodations').value;
                const accommodationsList = accommodationsRaw.split(',').map(item => item.trim()).filter(i => i);

                const itineraryList = [];
                const container = document.getElementById('itinerary-builder-container');
                const dayRows = container.querySelectorAll('div[id^="day-row-"]');
                
                dayRows.forEach((row, index) => {
                    const titleInput = row.querySelector('input');
                    const descInput = row.querySelector('textarea');
                    if(titleInput && descInput && titleInput.value && descInput.value) {
                        itineraryList.push({
                            day: index + 1,
                            title: titleInput.value,
                            desc: descInput.value
                        });
                    }
                });

                if(itineraryList.length === 0) {
                    alert("Please add at least one itinerary day with Title and Description.");
                    return;
                }

                const newPkg = {
                    id: Date.now(), 
                    title: document.getElementById('pkg-title').value,
                    tagline: document.getElementById('pkg-tagline').value,
                    price: formattedPrice,
                    priceUnit: document.getElementById('pkg-unit').value,
                    duration: document.getElementById('pkg-duration').value,
                    pax: document.getElementById('pkg-pax').value,
                    category: document.getElementById('pkg-cat').value,
                    subCategory: document.getElementById('pkg-subcategory').value, // Correctly Capture Sub Category
                    image: imageBase64, 
                    inclusions: inclusionsList,
                    destinations: destinationsList,
                    accommodations: accommodationsList,
                    itinerary: itineraryList
                };

                appData.push(newPkg);
                localStorage.setItem('tgf_packages', JSON.stringify(appData));

                alert('Package Published Successfully!');
                e.target.reset();
                document.getElementById('itinerary-builder-container').innerHTML = '';
                dataManager.itineraryCount = 0;
                dataManager.addItineraryDay();
                
                dataManager.renderAdminList();
                renderGrid(); 

            } catch (error) {
                console.error(error);
                if (error.name === 'QuotaExceededError') {
                    alert("Storage Limit Reached! The image you tried to upload is too large for the browser's local storage. Please try a much smaller image or a low-quality screenshot.");
                } else {
                    alert("An error occurred while saving: " + error.message);
                }
            }
        };

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
        list.innerHTML = appData.map(pkg => {
            // Visual check for admin list
            const isInt = pkg.subCategory === 'International';
            const icon = isInt ? 'plane' : 'flag';
            const badgeColor = isInt ? 'text-blue-600 bg-blue-50' : 'text-orange-600 bg-orange-50';

            return `
            <div class="admin-pkg-card">
                <img src="${pkg.image}" class="admin-pkg-img" alt="thumb">
                <div class="flex-1">
                    <h4 class="font-bold text-brand-charcoal">${pkg.title}</h4>
                    <div class="flex gap-2 mt-1 items-center">
                        <span class="text-xs ${badgeColor} px-2 py-0.5 rounded flex items-center gap-1 font-medium">
                            <i data-lucide="${icon}" class="w-3 h-3"></i> ${pkg.subCategory || 'National'}
                        </span>
                        <span class="text-xs text-gray-500">${pkg.price} · ${pkg.duration}</span>
                    </div>
                </div>
                <button onclick="dataManager.deletePackage(${pkg.id})" class="text-red-500 hover:bg-red-50 p-2 rounded">
                    <i data-lucide="trash-2" class="w-5 h-5"></i>
                </button>
            </div>
        `}).join('');
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
    grid.innerHTML = appData.map(pkg => {
        // Dynamic Icons for Grid
        const isInternational = pkg.subCategory === 'International';
        const locIcon = isInternational ? 'plane' : 'flag';
        const locBadgeClass = isInternational ? 'bg-blue-600' : 'bg-orange-500';

        return `
        <div class="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer" onclick="router.navigate('detail', ${pkg.id})">
            <div class="relative h-64 overflow-hidden">
                <img src="${pkg.image}" onerror="this.src='https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
                <div class="absolute top-4 right-4 flex gap-2">
                    <span class="${locBadgeClass} backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1 shadow-md">
                        <i data-lucide="${locIcon}" class="w-3 h-3"></i> ${pkg.subCategory || 'National'}
                    </span>
                    <span class="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-brand-charcoal shadow-md">
                        ${pkg.category}
                    </span>
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
    `}).join('');
    lucide.createIcons();
}

function renderDetail(id) {
    const pkg = appData.find(p => p.id === id);
    if(!pkg) return;

    const isInternational = pkg.subCategory === 'International';
    const locIcon = isInternational ? 'plane' : 'flag';
    const locBadgeClass = isInternational ? 'bg-blue-600 text-white' : 'bg-orange-500 text-white';

    const container = document.getElementById('view-detail');
    container.innerHTML = `
        <div class="relative h-[60vh] w-full">
            <img src="${pkg.image}" onerror="this.src='https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'" class="w-full h-full object-cover">
            <div class="absolute inset-0 bg-black/40 flex items-end">
                <div class="container mx-auto px-6 pb-12 text-white">
                    <button onclick="router.navigate('home')" class="mb-6 flex items-center gap-2 hover:text-brand-gold transition-colors">
                        <i data-lucide="arrow-left" class="w-4 h-4"></i> Back to collections
                    </button>
                    <div class="flex gap-2 mb-4">
                        <div class="bg-brand-gold text-xs font-bold px-3 py-1 inline-block rounded">${pkg.category} Collection</div>
                        <div class="${locBadgeClass} text-xs font-bold px-3 py-1 inline-block rounded flex items-center gap-1">
                            <i data-lucide="${locIcon}" class="w-3 h-3"></i> ${pkg.subCategory || 'National'}
                        </div>
                    </div>
                    <h1 class="text-4xl md:text-6xl font-serif font-bold mb-4">${pkg.title}</h1>
                </div>
            </div>
        </div>
        <div class="container mx-auto px-6 -mt-10 relative z-10">
            <div class="grid lg:grid-cols-3 gap-8">
                <div class="lg:col-span-2 space-y-8">
                    
                    <!-- Overview Block -->
                    <div class="bg-white p-8 rounded-xl shadow-sm">
                        <h3 class="text-2xl font-serif font-bold mb-4">Experience Overview</h3>
                        <p class="text-gray-600 leading-relaxed mb-6">${pkg.tagline} A curated experience designed for memory making.</p>
                        
                        <!-- Destinations Section -->
                        ${pkg.destinations && pkg.destinations.length > 0 ? `
                        <div class="mb-6">
                            <h4 class="font-bold text-lg mb-3 flex items-center gap-2"><i data-lucide="map" class="text-brand-teal w-5 h-5"></i> Destinations Covered</h4>
                            <div class="flex flex-wrap gap-2">
                                ${pkg.destinations.map(d => `<span class="px-3 py-1 bg-blue-50 text-blue-800 rounded-full text-sm font-medium border border-blue-100">${d}</span>`).join('')}
                            </div>
                        </div>
                        ` : ''}

                        <!-- Accommodations Section -->
                        ${pkg.accommodations && pkg.accommodations.length > 0 ? `
                        <div class="mb-6">
                            <h4 class="font-bold text-lg mb-3 flex items-center gap-2"><i data-lucide="home" class="text-brand-teal w-5 h-5"></i> Stays & Accommodations</h4>
                            <ul class="grid md:grid-cols-2 gap-3">
                                ${pkg.accommodations.map(acc => `<li class="flex items-start gap-2 text-gray-600 text-sm"><i data-lucide="bed" class="w-4 h-4 text-brand-gold mt-0.5"></i> ${acc}</li>`).join('')}
                            </ul>
                        </div>
                        ` : ''}

                        <h4 class="font-bold text-lg mb-3 flex items-center gap-2"><i data-lucide="check-circle" class="text-brand-teal w-5 h-5"></i> Inclusions</h4>
                        <ul class="grid md:grid-cols-2 gap-3">${pkg.inclusions.map(i => `<li class="flex items-start gap-2 text-gray-600 text-sm"><span class="w-1.5 h-1.5 rounded-full bg-brand-gold mt-2"></span>${i}</li>`).join('')}</ul>
                    </div>
                    
                    <!-- Enhanced Itinerary -->
                    <div class="bg-white p-8 rounded-xl shadow-sm">
                        <h3 class="text-2xl font-serif font-bold mb-6">Itinerary</h3>
                        <div class="space-y-0">
                            ${pkg.itinerary.map(d => `
                                <div class="itinerary-timeline-item">
                                    <div class="itinerary-timeline-marker"></div>
                                    <div class="mb-1">
                                        <span class="text-xs font-bold uppercase text-brand-gold tracking-wide">Day ${d.day}</span>
                                    </div>
                                    <h4 class="font-bold text-brand-charcoal text-lg mb-2">${d.title || d.act}</h4>
                                    <p class="text-gray-600 text-sm leading-relaxed">${d.desc || 'Activities as scheduled.'}</p>
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
offerManager.renderBar(); // Check active offer on load
lucide.createIcons();
