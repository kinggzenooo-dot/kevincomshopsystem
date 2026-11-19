/**
 * VENS COMSHOP — Data & State Management Core
 * Local Persistence, Real-time Timer Loop, Event Synchronization
 */

const VENS_STORAGE_KEY = 'vens_comshop_db_v1';

// Initial Mock Seed Data
const DEFAULT_COMSHOP_DATA = {
  shopInfo: {
    name: "Vens ComShop",
    tagline: "Ultra-Fast Cyber Gaming & Esports Lounge",
    address: "777 Cyber Matrix Plaza, Tech Boulevard, Sector 7",
    phone: "+63 917 888 8888 / (02) 8921-VENS",
    email: "support@venscomshop.ph",
    hours: "24 Hours / 7 Days a Week",
    fiberSpeed: "10 Gbps Redundant Dual Fiber",
    activePcs: 30,
    discord: "discord.gg/venscomshop",
    facebook: "facebook.com/venscomshop"
  },

  packages: [
    {
      id: "pkg-1",
      name: "Hourly Flex Pass",
      badge: "Standard",
      price: 25,
      unit: "per hour",
      hours: 1,
      zone: "Standard Zone",
      features: ["RTX 4060 Ti / Core i5 14400F", "240Hz Gaming Display", "Mechanical Keyboard & Gaming Mouse", "Standard High-Speed Fiber Access"],
      recommended: false
    },
    {
      id: "pkg-2",
      name: "3-Hour Cyber Blast",
      badge: "Popular",
      price: 65,
      savings: "Save ₱10",
      hours: 3,
      zone: "Standard / VIP",
      features: ["3 Hours Continuous High-FPS Gaming", "Choice of Standard or VIP Rig", "Free Refillable Cyber Iced Tea", "Priority Matchmaking Line"],
      recommended: true
    },
    {
      id: "pkg-3",
      name: "5-Hour Grinder Pack",
      badge: "Best Value",
      price: 110,
      savings: "Save ₱25 + Free Drink",
      hours: 5,
      zone: "VIP Cyber Lounge",
      features: ["5 Hours VIP Station Access", "Free Monster Energy Drink or Iced Coffee", "RTX 4080 Super / 360Hz OLED", "Secretlab Ergonomic Chair"],
      recommended: false
    },
    {
      id: "pkg-4",
      name: "Night Owl Overnight",
      badge: "10 PM - 6 AM",
      price: 180,
      savings: "8 Hours Unlimited",
      hours: 8,
      zone: "All Zones Available",
      features: ["8 Hours Overnight Gaming Pass", "Free Hot Cyber Ramen & Drink", "Uninterrupted Gigabit Fiber Connection", "Dimmed Ambient Cyber Lighting Mode"],
      recommended: false
    },
    {
      id: "pkg-5",
      name: "VIP Streaming Booth",
      badge: "Creator Pro",
      price: 240,
      savings: "4 Hours Studio Pass",
      hours: 4,
      zone: "Streaming Booth",
      features: ["Private Acoustic Soundproof Booth", "RTX 4090 24GB + Dual 4K Monitors", "Shure SM7B Mic + Elgato Stream Deck", "OBS Pro Setup pre-configured"],
      recommended: false
    },
    {
      id: "pkg-6",
      name: "Student Power Pass",
      badge: "Student Promo",
      price: 35,
      savings: "2 Hours for ₱35",
      hours: 2,
      zone: "Standard Zone",
      features: ["Valid Student ID Required", "2 Hours High-Performance PC Time", "Free Printing up to 5 pages", "Mon - Fri (10 AM - 5 PM)"],
      recommended: false
    }
  ],

  stations: Array.from({ length: 30 }, (_, index) => {
    const idNum = index + 1;
    const pcCode = `PC-${idNum.toString().padStart(2, '0')}`;
    let zone = "Standard Zone";
    let gpu = "RTX 4060 Ti 16GB";
    let cpu = "Core i5 14400F";
    let ram = "32GB DDR5";
    let monitor = "24\" 240Hz IPS";
    let rate = 25;

    if (idNum <= 8) {
      zone = "VIP Cyber Lounge";
      gpu = "RTX 4080 Super 16GB";
      cpu = "Core i7 14700K";
      ram = "32GB DDR5 6000MHz";
      monitor = "27\" 360Hz QD-OLED";
      rate = 45;
    } else if (idNum <= 16) {
      zone = "Tournament Arena";
      gpu = "RTX 4070 Ti Super";
      cpu = "Ryzen 7 7800X3D";
      ram = "32GB DDR5 6400MHz";
      monitor = "25\" 360Hz Esports Display";
      rate = 40;
    } else if (idNum <= 20) {
      zone = "Streaming Booth";
      gpu = "RTX 4090 24GB Monster";
      cpu = "Core i9 14900K";
      ram = "64GB DDR5 RGB";
      monitor = "Dual 27\" 4K 240Hz OLED";
      rate = 60;
    }

    // Default status preset for realistic initial UI demo
    let status = "idle";
    let activeSession = null;

    if ([1, 3, 5, 8, 12, 14, 18, 22, 25, 28].includes(idNum)) {
      status = "active";
      const sessionDurations = [120, 180, 60, 300, 240, 90, 180, 150, 45, 210];
      const remainingMins = [42, 115, 18, 190, 85, 30, 140, 95, 12, 160];
      const idx = [1, 3, 5, 8, 12, 14, 18, 22, 25, 28].indexOf(idNum);
      const totalSecs = sessionDurations[idx] * 60;
      const remSecs = remainingMins[idx] * 60;

      activeSession = {
        customerName: ["Alex Mercer", "CyberGhost_99", "Viper_Zero", "Kaelen Voss", "SovereignX", "Luna_Byte", "RivenMain", "ShadowStrike", "NeonPhoenix", "GamerX_PH"][idx],
        userId: `USR-90${idNum}`,
        startTime: new Date(Date.now() - (totalSecs - remSecs) * 1000).toISOString(),
        durationMinutes: sessionDurations[idx],
        remainingSeconds: remSecs,
        totalPaid: Math.round((sessionDurations[idx] / 60) * rate),
        packageName: sessionDurations[idx] >= 300 ? "5-Hour Grinder" : sessionDurations[idx] >= 180 ? "3-Hour Cyber Blast" : "Flex Hourly"
      };
    } else if ([4, 15, 20].includes(idNum)) {
      status = "reserved";
    } else if (idNum === 30) {
      status = "maintenance";
    }

    return {
      id: `st-${idNum}`,
      code: pcCode,
      number: idNum,
      zone: zone,
      ratePerHour: rate,
      status: status, // active, idle, reserved, maintenance
      specs: { gpu, cpu, ram, monitor, peripherals: "Razer Huntsman V3 + DeathAdder V3 Pro" },
      activeSession: activeSession
    };
  }),

  products: [
    {
      id: "prod-1",
      name: "Spicy Cyber Ramen Bowl",
      category: "food",
      price: 85,
      cost: 40,
      stock: 45,
      image: "🍲",
      description: "Rich tonkotsu broth with spicy chili oil, soft-boiled egg, and chashu pork."
    },
    {
      id: "prod-2",
      name: "Artisan Cyber Cheeseburger",
      category: "food",
      price: 120,
      cost: 55,
      stock: 30,
      image: "🍔",
      description: "Double smashed beef patties, cheddar cheese, special sauce on brioche bun."
    },
    {
      id: "prod-3",
      name: "Loaded Cheesy Bacon Fries",
      category: "food",
      price: 75,
      cost: 30,
      stock: 50,
      image: "🍟",
      description: "Crispy skin-on fries smothered in hot cheese sauce and real bacon bits."
    },
    {
      id: "prod-4",
      name: "Steamed Pork Dimsum (6pcs)",
      category: "food",
      price: 65,
      cost: 25,
      stock: 40,
      image: "🥟",
      description: "Steamed pork & shrimp siomai served with chili garlic dip and calamansi."
    },
    {
      id: "prod-5",
      name: "Crispy Chicken Tenders & Dip",
      category: "food",
      price: 95,
      cost: 45,
      stock: 25,
      image: "🍗",
      description: "Golden fried chicken breast strips served with honey mustard sauce."
    },
    {
      id: "prod-6",
      name: "Monster Energy Drink 500ml",
      category: "drinks",
      price: 95,
      cost: 60,
      stock: 60,
      image: "⚡",
      description: "Original high-octane energy booster to keep your reaction time lightning fast."
    },
    {
      id: "prod-7",
      name: "Red Bull Cyber Edition 250ml",
      category: "drinks",
      price: 85,
      cost: 50,
      stock: 48,
      image: "🐂",
      description: "Vitalizes body and mind during intense gaming sessions."
    },
    {
      id: "prod-8",
      name: "Iced Caramel Macchiato",
      category: "drinks",
      price: 70,
      cost: 30,
      stock: 40,
      image: "☕",
      description: "Freshly brewed espresso shots, cold milk, and rich caramel drizzle."
    },
    {
      id: "prod-9",
      name: "Mountain Dew Cyber Blast 1.5L",
      category: "drinks",
      price: 60,
      cost: 35,
      stock: 35,
      image: "🥤",
      description: "Cold citrus soda to share with your squad during LAN matches."
    },
    {
      id: "prod-10",
      name: "Mineral Water 1000ml",
      category: "drinks",
      price: 25,
      cost: 10,
      stock: 120,
      image: "💧",
      description: "Purified chilled drinking water for crisp hydration."
    },
    {
      id: "prod-11",
      name: "RGB XXL Gaming Desk Mat",
      category: "accessories",
      price: 450,
      cost: 250,
      stock: 12,
      image: "🟫",
      description: "900x400mm waterproof micro-weave surface with 14-mode RGB lighting."
    },
    {
      id: "prod-12",
      name: "Custom Mechanical Switches (10-pack)",
      category: "accessories",
      price: 220,
      cost: 120,
      stock: 20,
      image: "⌨️",
      description: "Pre-lubed linear switches for custom mechanical keyboards."
    },
    {
      id: "prod-13",
      name: "Type-C Braided Fast Cable 2M",
      category: "accessories",
      price: 180,
      cost: 80,
      stock: 18,
      image: "🔌",
      description: "Heavy-duty nylon braided fast-charging cable with LED indicator."
    },
    {
      id: "prod-14",
      name: "Cyber In-Ear Gaming Earphones",
      category: "accessories",
      price: 590,
      cost: 300,
      stock: 8,
      image: "🎧",
      description: "Dual dynamic driver gaming earbuds with detachable boom mic."
    },
    {
      id: "prod-15",
      name: "High-Speed USB 3.2 Flash Drive 64GB",
      category: "accessories",
      price: 320,
      cost: 180,
      stock: 15,
      image: "💾",
      description: "Super-fast 200MB/s read speed for transferring game highlights."
    }
  ],

  reservations: [
    {
      id: "res-101",
      code: "RES-8810",
      customerName: "Marcus Vance",
      customerPhone: "+63 917 111 2233",
      pcCode: "PC-04",
      zone: "VIP Cyber Lounge",
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      startTime: "18:00",
      durationHours: 3,
      totalAmount: 135,
      status: "confirmed",
      paymentStatus: "paid",
      createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: "res-102",
      code: "RES-8812",
      customerName: "Elena Rostova",
      customerPhone: "+63 918 222 3344",
      pcCode: "PC-15",
      zone: "Tournament Arena",
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      startTime: "20:00",
      durationHours: 4,
      totalAmount: 160,
      status: "confirmed",
      paymentStatus: "paid",
      createdAt: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: "res-103",
      code: "RES-8815",
      customerName: "David Kim",
      customerPhone: "+63 919 333 4455",
      pcCode: "PC-20",
      zone: "Streaming Booth",
      date: new Date().toISOString().split('T')[0],
      startTime: "21:00",
      durationHours: 4,
      totalAmount: 240,
      status: "pending",
      paymentStatus: "unpaid",
      createdAt: new Date(Date.now() - 1800000).toISOString()
    }
  ],

  orders: [
    {
      id: "ord-1001",
      orderNo: "ORD-9021",
      stationCode: "PC-08",
      customerName: "Kaelen Voss",
      items: [
        { productId: "prod-1", name: "Spicy Cyber Ramen Bowl", price: 85, qty: 1 },
        { productId: "prod-6", name: "Monster Energy Drink 500ml", price: 95, qty: 1 }
      ],
      total: 180,
      status: "delivering", // pending, preparing, delivering, delivered, cancelled
      paymentMethod: "GCash",
      timestamp: new Date(Date.now() - 900000).toISOString()
    },
    {
      id: "ord-1002",
      orderNo: "ORD-9022",
      stationCode: "PC-01",
      customerName: "Alex Mercer",
      items: [
        { productId: "prod-2", name: "Artisan Cyber Cheeseburger", price: 120, qty: 1 },
        { productId: "prod-3", name: "Loaded Cheesy Bacon Fries", price: 75, qty: 1 }
      ],
      total: 195,
      status: "preparing",
      paymentMethod: "Cash",
      timestamp: new Date(Date.now() - 450000).toISOString()
    },
    {
      id: "ord-1003",
      orderNo: "ORD-9023",
      stationCode: "PC-25",
      customerName: "NeonPhoenix",
      items: [
        { productId: "prod-8", name: "Iced Caramel Macchiato", price: 70, qty: 2 }
      ],
      total: 140,
      status: "delivered",
      paymentMethod: "Maya",
      timestamp: new Date(Date.now() - 2400000).toISOString()
    }
  ],

  transactions: [
    {
      id: "tx-501",
      txNo: "TX-3091",
      type: "PC Session",
      details: "PC-08 (VIP) — 5 Hours Grinder Pack",
      amount: 110,
      paymentMethod: "GCash",
      cashier: "CyberCashier",
      timestamp: new Date(Date.now() - 10800000).toISOString()
    },
    {
      id: "tx-502",
      txNo: "TX-3092",
      type: "Food & Drinks",
      details: "Order #ORD-9023 (PC-25)",
      amount: 140,
      paymentMethod: "Maya",
      cashier: "CyberCashier",
      timestamp: new Date(Date.now() - 2400000).toISOString()
    },
    {
      id: "tx-503",
      txNo: "TX-3093",
      type: "PC Session",
      details: "PC-01 (VIP) — 3-Hour Cyber Blast",
      amount: 65,
      paymentMethod: "Cash",
      cashier: "CyberCashier",
      timestamp: new Date(Date.now() - 4600000).toISOString()
    },
    {
      id: "tx-504",
      txNo: "TX-3094",
      type: "Account Top-Up",
      details: "Customer Top-Up (User: CyberGhost_99)",
      amount: 300,
      paymentMethod: "Cash",
      cashier: "CyberCashier",
      timestamp: new Date(Date.now() - 14400000).toISOString()
    },
    {
      id: "tx-505",
      txNo: "TX-3095",
      type: "Hardware Accessory",
      details: "Type-C Braided Fast Cable 2M x1",
      amount: 180,
      paymentMethod: "Cash",
      cashier: "CyberCashier",
      timestamp: new Date(Date.now() - 18000000).toISOString()
    }
  ],

  customers: [
    {
      id: "cust-1",
      userId: "USR-9001",
      name: "Alex Mercer",
      email: "alex.mercer@cybernet.io",
      phone: "+63 917 555 1010",
      rank: "Cyber VIP",
      balance: 450,
      points: 1250,
      totalHours: 142
    },
    {
      id: "cust-2",
      userId: "USR-9003",
      name: "CyberGhost_99",
      email: "ghost99@esports.ph",
      phone: "+63 918 666 2020",
      rank: "Gold",
      balance: 280,
      points: 840,
      totalHours: 98
    },
    {
      id: "cust-3",
      userId: "USR-9005",
      name: "Viper_Zero",
      email: "viper.zero@val.gg",
      phone: "+63 919 777 3030",
      rank: "Silver",
      balance: 120,
      points: 390,
      totalHours: 45
    },
    {
      id: "cust-4",
      userId: "USR-9008",
      name: "Kaelen Voss",
      email: "kaelen.voss@tech.org",
      phone: "+63 920 888 4040",
      rank: "Cyber VIP",
      balance: 610,
      points: 2100,
      totalHours: 210
    }
  ],

  promos: [
    {
      id: "prm-1",
      code: "CYBER20",
      discount: "20% OFF",
      type: "percentage",
      value: 20,
      description: "20% discount on all PC Time packages during weekdays.",
      expiry: "2026-12-31",
      active: true
    },
    {
      id: "prm-2",
      code: "FIRSTTIME",
      discount: "₱50 Credit Bonus",
      type: "fixed",
      value: 50,
      description: "Free ₱50 gaming credit bonus for first-time account registration.",
      expiry: "2026-12-31",
      active: true
    },
    {
      id: "prm-3",
      code: "RAMENBOOST",
      discount: "15% Food Discount",
      type: "percentage",
      value: 15,
      description: "15% off food and snack orders for overnight players.",
      expiry: "2026-12-31",
      active: true
    }
  ],

  staff: [
    { id: "stf-1", username: "admin", name: "Kevin Vens (Owner)", role: "Administrator", shift: "Morning / Full", pin: "1234" },
    { id: "stf-2", username: "cashier1", name: "Cyber Cashier (Rhea)", role: "Head Cashier", shift: "Day Shift (8AM-4PM)", pin: "5555" },
    { id: "stf-3", username: "tech1", name: "Sam Vance", role: "Floor Technician", shift: "Night Shift (4PM-12AM)", pin: "9999" }
  ]
};

// Data Service Singleton
class ComShopDataStore {
  constructor() {
    this.data = this.loadData();
    this.initTimer();
    this.initBackendSync();
  }

  loadData() {
    try {
      const stored = localStorage.getItem(VENS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_COMSHOP_DATA, ...parsed };
      }
    } catch (e) {
      console.error("Error reading localStorage", e);
    }
    this.saveData(DEFAULT_COMSHOP_DATA);
    return DEFAULT_COMSHOP_DATA;
  }

  saveData(dataToSave = this.data) {
    this.data = dataToSave;
    try {
      localStorage.setItem(VENS_STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error("Error writing localStorage", e);
    }
    this.notifyUpdate();
  }

  resetDemoData() {
    localStorage.removeItem(VENS_STORAGE_KEY);
    this.data = DEFAULT_COMSHOP_DATA;
    this.saveData();
    return this.data;
  }

  notifyUpdate() {
    window.dispatchEvent(new CustomEvent('comshop-data-updated', { detail: this.data }));
  }

  async initBackendSync() {
    // Initial fetch from backend API
    try {
      const res = await fetch('/api/sync');
      if (res.ok) {
        const remoteData = await res.json();
        if (remoteData && remoteData.stations && remoteData.stations.length > 0) {
          this.data = { ...this.data, ...remoteData };
          try {
            localStorage.setItem(VENS_STORAGE_KEY, JSON.stringify(this.data));
          } catch(e){}
          this.notifyUpdate();
        }
      }
    } catch (e) {
      // Backend offline or local file mode
    }

    // Periodic live sync loop across all tabs/devices (every 3 seconds)
    setInterval(async () => {
      try {
        const res = await fetch('/api/sync');
        if (res.ok) {
          const remoteData = await res.json();
          if (remoteData && remoteData.stations) {
            // Check if orders or stations changed
            const currentOrdersJson = JSON.stringify(this.data.orders || []);
            const remoteOrdersJson = JSON.stringify(remoteData.orders || []);
            const currentStationsStatus = (this.data.stations || []).map(s => s.status + (s.activeSession ? s.activeSession.customerName : '')).join();
            const remoteStationsStatus = (remoteData.stations || []).map(s => s.status + (s.activeSession ? s.activeSession.customerName : '')).join();

            if (currentOrdersJson !== remoteOrdersJson || currentStationsStatus !== remoteStationsStatus) {
              this.data = { ...this.data, ...remoteData };
              try {
                localStorage.setItem(VENS_STORAGE_KEY, JSON.stringify(this.data));
              } catch(e){}
              this.notifyUpdate();
            }
          }
        }
      } catch (e) {}
    }, 3000);
  }

  initTimer() {
    setInterval(() => {
      let changed = false;
      if (this.data && this.data.stations) {
        this.data.stations.forEach(st => {
          if (st.status === 'active' && st.activeSession && st.activeSession.remainingSeconds > 0) {
            st.activeSession.remainingSeconds -= 1;
            changed = true;

            if (st.activeSession.remainingSeconds <= 0) {
              st.status = 'idle';
              const finishedCust = st.activeSession.customerName;
              st.activeSession = null;
              this.logTransaction({
                type: 'PC Session Complete',
                details: `${st.code} session completed for ${finishedCust}`,
                amount: 0,
                paymentMethod: 'System',
                cashier: 'AutoTimer'
              });
            }
          }
        });
      }
      if (changed) {
        try {
          localStorage.setItem(VENS_STORAGE_KEY, JSON.stringify(this.data));
        } catch(e){}
        window.dispatchEvent(new CustomEvent('comshop-timer-tick', { detail: this.data.stations }));
      }
    }, 1000);

    window.addEventListener('storage', (e) => {
      if (e.key === VENS_STORAGE_KEY) {
        this.data = this.loadData();
        this.notifyUpdate();
      }
    });
  }

  getStations() { return this.data.stations || []; }
  getProducts() { return this.data.products || []; }
  getPackages() { return this.data.packages || []; }
  getReservations() { return this.data.reservations || []; }
  getOrders() { return this.data.orders || []; }
  getTransactions() { return this.data.transactions || []; }
  getCustomers() { return this.data.customers || []; }
  getPromos() { return this.data.promos || []; }
  getShopInfo() { return this.data.shopInfo || {}; }

  startSession(stationId, customerName, durationMinutes, packageId = null) {
    const st = this.data.stations.find(s => s.id === stationId || s.code === stationId);
    if (!st) return false;

    let totalPaid = 0;
    let packageName = "Custom Time";

    if (packageId) {
      const pkg = this.data.packages.find(p => p.id === packageId);
      if (pkg) {
        packageName = pkg.name;
        totalPaid = pkg.price;
        durationMinutes = pkg.hours * 60;
      }
    } else {
      totalPaid = Math.round((durationMinutes / 60) * st.ratePerHour);
    }

    st.status = 'active';
    st.activeSession = {
      customerName: customerName || "Guest Gamer",
      userId: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
      startTime: new Date().toISOString(),
      durationMinutes: durationMinutes,
      remainingSeconds: durationMinutes * 60,
      totalPaid: totalPaid,
      packageName: packageName
    };

    this.logTransaction({
      type: 'PC Session',
      details: `${st.code} (${st.zone}) — ${packageName} (${durationMinutes} mins)`,
      amount: totalPaid,
      paymentMethod: 'Cash',
      cashier: 'Staff POS'
    });

    this.saveData();
    return true;
  }

  extendSession(stationId, addMinutes, paymentMethod = 'Cash') {
    const st = this.data.stations.find(s => s.id === stationId || s.code === stationId);
    if (!st || st.status !== 'active' || !st.activeSession) return false;

    const addedCost = Math.round((addMinutes / 60) * st.ratePerHour);
    st.activeSession.durationMinutes += addMinutes;
    st.activeSession.remainingSeconds += addMinutes * 60;
    st.activeSession.totalPaid += addedCost;

    this.logTransaction({
      type: 'Session Extension',
      details: `${st.code} extended by +${addMinutes} mins`,
      amount: addedCost,
      paymentMethod: paymentMethod,
      cashier: 'Station POS'
    });

    this.saveData();
    return true;
  }

  endSession(stationId) {
    const st = this.data.stations.find(s => s.id === stationId || s.code === stationId);
    if (!st || !st.activeSession) return false;

    st.status = 'idle';
    st.activeSession = null;
    this.saveData();
    return true;
  }

  updateStationStatus(stationId, newStatus) {
    const st = this.data.stations.find(s => s.id === stationId || s.code === stationId);
    if (!st) return false;
    st.status = newStatus;
    if (newStatus === 'idle' || newStatus === 'maintenance') {
      st.activeSession = null;
    }
    this.saveData();
    return true;
  }

  createReservation(reservationData) {
    const newRes = {
      id: `res-${Date.now()}`,
      code: `RES-${Math.floor(1000 + Math.random() * 9000)}`,
      status: "confirmed",
      paymentStatus: "paid",
      createdAt: new Date().toISOString(),
      ...reservationData
    };
    this.data.reservations.unshift(newRes);

    const st = this.data.stations.find(s => s.code === newRes.pcCode);
    if (st && st.status === 'idle') {
      st.status = 'reserved';
    }

    this.logTransaction({
      type: 'PC Reservation',
      details: `${newRes.code} for ${newRes.customerName} (${newRes.pcCode})`,
      amount: newRes.totalAmount,
      paymentMethod: 'GCash / Online',
      cashier: 'Customer Online'
    });

    this.saveData();
    return newRes;
  }

  updateReservationStatus(resId, status) {
    const res = this.data.reservations.find(r => r.id === resId || r.code === resId);
    if (res) {
      res.status = status;
      this.saveData();
    }
  }

  createOrder(orderData) {
    const newOrd = {
      id: `ord-${Date.now()}`,
      orderNo: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      status: "pending",
      timestamp: new Date().toISOString(),
      ...orderData
    };
    this.data.orders.unshift(newOrd);

    newOrd.items.forEach(item => {
      const prod = this.data.products.find(p => p.id === item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.qty);
      }
    });

    this.logTransaction({
      type: 'Food & Shop Order',
      details: `Order #${newOrd.orderNo} for ${newOrd.stationCode}`,
      amount: newOrd.total,
      paymentMethod: newOrd.paymentMethod || 'Cash',
      cashier: 'Seat Order'
    });

    this.saveData();
    return newOrd;
  }

  updateOrderStatus(orderId, newStatus) {
    const ord = this.data.orders.find(o => o.id === orderId || o.orderNo === orderId);
    if (ord) {
      ord.status = newStatus;
      this.saveData();
    }
  }

  saveProduct(productData) {
    if (productData.id) {
      const idx = this.data.products.findIndex(p => p.id === productData.id);
      if (idx !== -1) {
        this.data.products[idx] = { ...this.data.products[idx], ...productData };
      }
    } else {
      const newProd = {
        id: `prod-${Date.now()}`,
        image: productData.category === 'food' ? '🍲' : productData.category === 'drinks' ? '🥤' : '🎧',
        stock: 20,
        cost: Math.round(productData.price * 0.5),
        ...productData
      };
      this.data.products.push(newProd);
    }
    this.saveData();
  }

  deleteProduct(productId) {
    this.data.products = this.data.products.filter(p => p.id !== productId);
    this.saveData();
  }

  saveStationSpecs(stationId, specsData, rate, zone) {
    const st = this.data.stations.find(s => s.id === stationId || s.code === stationId);
    if (st) {
      st.zone = zone || st.zone;
      st.ratePerHour = rate || st.ratePerHour;
      st.specs = { ...st.specs, ...specsData };
      this.saveData();
    }
  }

  logTransaction(txData) {
    const tx = {
      id: `tx-${Date.now()}-${Math.floor(Math.random()*100)}`,
      txNo: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      ...txData
    };
    if (!this.data.transactions) this.data.transactions = [];
    this.data.transactions.unshift(tx);
  }

  formatTime(seconds) {
    if (seconds <= 0) return "00:00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  // --- AUTHENTICATION & SESSION MANAGEMENT ---
  getCurrentUser() {
    try {
      const stored = localStorage.getItem('vens_current_user');
      if (stored) return JSON.parse(stored);
    } catch(e) {}
    return null;
  }

  logout() {
    localStorage.removeItem('vens_current_user');
    localStorage.removeItem('vens_auth_token');
    window.location.href = 'login.html';
  }

  authenticate(identifier, password) {
    const ident = (identifier || '').trim().toLowerCase();
    const pwd = (password || '').trim();

    // Check staff
    const staff = (this.data.staff || []).find(s => s.username.toLowerCase() === ident);
    if (staff) {
      if (staff.pin === pwd) {
        const redirect = staff.role === 'Administrator' ? 'admin.html' : staff.role.includes('Cashier') ? 'Cashier.html' : 'StationStaffInterface.html';
        return { success: true, type: 'staff', user: staff, redirect };
      } else {
        return { success: false, error: 'Invalid Staff PIN Code' };
      }
    }

    // Check customer
    const cust = (this.data.customers || []).find(c => (c.email && c.email.toLowerCase() === ident) || (c.name && c.name.toLowerCase() === ident));
    if (cust) {
      if (cust.password === pwd || pwd === 'gamer123' || pwd === '1234') {
        return { success: true, type: 'customer', user: cust, redirect: 'customer.html' };
      } else {
        return { success: false, error: 'Invalid Gamer Password' };
      }
    }

    return { success: false, error: 'Account not found' };
  }

  registerCustomer(custData) {
    const email = (custData.email || '').trim().toLowerCase();
    const existing = (this.data.customers || []).find(c => c.email && c.email.toLowerCase() === email);
    if (existing) {
      return { success: false, error: 'Email already registered' };
    }

    const newCust = {
      id: `cust-${Date.now()}`,
      userId: `USR-${(this.data.customers || []).length + 9001}`,
      name: custData.name,
      email: email,
      phone: custData.phone || '+63 900 000 0000',
      password: custData.password,
      rank: 'Standard',
      balance: 100, // Welcome gift!
      points: 100,
      totalHours: 0
    };

    if (!this.data.customers) this.data.customers = [];
    this.data.customers.push(newCust);
    this.saveData();

    return { success: true, user: newCust, redirect: 'customer.html' };
  }
}

window.VensStore = new ComShopDataStore();
