const express = require('express');
const cors = require('cors');
const QRCode = require('qrcode');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
// Tingkatkan limit body json untuk mendukung upload base64 gambar langsung dari perangkat
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Mock Database Kategori Menu
let menuCategories = [
  { id: 'cat-1', name: 'Makanan', icon: '🍜' },
  { id: 'cat-2', name: 'Coffee', icon: '☕' },
  { id: 'cat-3', name: 'Non-Coffee', icon: '🧋' },
  { id: 'cat-4', name: 'Snack', icon: '🥟' }
];

// Mock Database Menu Cafe
let menuData = [
  {
    id: 1,
    category: 'Coffee',
    name: 'Kopi Kenangan Latte (Aren)',
    price: 22000,
    desc: 'Espresso bold dengan susu segar dan sirup gula aren murni khas Nusantara.',
    image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500&auto=format&fit=crop&q=60',
    popular: true,
    hasLevel: false,
    prepTime: 5
  },
  {
    id: 2,
    category: 'Coffee',
    name: 'Caramel Macchiato Ice',
    price: 28000,
    desc: 'Perpaduan espresso, vanila syrup, steamed milk dan saus karamel lezat.',
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=60',
    popular: false,
    hasLevel: false,
    prepTime: 6
  },
  {
    id: 3,
    category: 'Coffee',
    name: 'Americano Double Shot',
    price: 18000,
    desc: 'Dua shot espresso premium arabika dicampur dengan air dingin/panas segar.',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=60',
    popular: false,
    hasLevel: false,
    prepTime: 4
  },
  {
    id: 4,
    category: 'Non-Coffee',
    name: 'Matcha Creamy Latte',
    price: 26000,
    desc: 'Green tea matcha asli Jepang dengan susu creamy dan foam lembut.',
    image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500&auto=format&fit=crop&q=60',
    popular: true,
    hasLevel: false,
    prepTime: 5
  },
  {
    id: 5,
    category: 'Non-Coffee',
    name: 'Dark Chocolate Hazelnut',
    price: 25000,
    desc: 'Cokelat Belgia pekat dengan aroma kacang hazelnut yang gurih harum.',
    image: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=500&auto=format&fit=crop&q=60',
    popular: false,
    hasLevel: false,
    prepTime: 5
  },
  {
    id: 6,
    category: 'Makanan',
    name: 'Mie Pedas Manis (Khas Cafe)',
    price: 16000,
    desc: 'Mie kenyal dengan bumbu kecap rahasia, topping ayam cincang & taburan pangsit.',
    image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=500&auto=format&fit=crop&q=60',
    popular: true,
    hasLevel: true,
    prepTime: 12
  },
  {
    id: 7,
    category: 'Makanan',
    name: 'Mie Pedas Asin / Gurih',
    price: 16000,
    desc: 'Mie bumbu cabe asin gurih pedas nendang, taburan ayam tabur dan keripik pangsit.',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=60',
    popular: true,
    hasLevel: true,
    prepTime: 12
  },
  {
    id: 8,
    category: 'Makanan',
    name: 'Rice Bowl Chicken Teriyaki',
    price: 28000,
    desc: 'Nasi hangat pulen dengan potongan ayam saus teriyaki gurih manis & wijen.',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
    popular: false,
    hasLevel: false,
    prepTime: 15
  },
  {
    id: 9,
    category: 'Snack',
    name: 'Dimsum Siomay Ayam (3 pcs)',
    price: 14000,
    desc: 'Siomay ayam kukus lembut dengan cocolan chili oil pedas khas.',
    image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=500&auto=format&fit=crop&q=60',
    popular: true,
    hasLevel: false,
    prepTime: 8
  },
  {
    id: 10,
    category: 'Snack',
    name: 'Pangsit Goreng Udang Crispy',
    price: 15000,
    desc: 'Pangsit goreng renyah isi udang & ayam dilengkapi saus asam manis pedas.',
    image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=500&auto=format&fit=crop&q=60',
    popular: true,
    hasLevel: false,
    prepTime: 7
  },
  {
    id: 11,
    category: 'Snack',
    name: 'French Fries Truffle Mayo',
    price: 18000,
    desc: 'Kentang goreng crinkle renyah disajikan dengan dipping saus truffle mayonnaise.',
    image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500&auto=format&fit=crop&q=60',
    popular: false,
    hasLevel: false,
    prepTime: 8
  }
];

// Mock Database Akun Staf
let staffUsers = [
  {
    id: 'USR-1',
    name: 'Budi Kasir',
    email: 'kasir1@gmail.com',
    role: 'kasir',
    createdAt: new Date().toISOString()
  },
  {
    id: 'USR-2',
    name: 'Chef Ridwan',
    email: 'dapur1@gmail.com',
    role: 'dapur',
    createdAt: new Date().toISOString()
  }
];

const MASTER_SUPER_ADMIN_EMAIL = 'admin@gmail.com';

const totalTables = 20;
let tableTokens = {};
for (let i = 1; i <= totalTables; i++) {
  tableTokens[i] = crypto.randomBytes(4).toString('hex');
}

let barcodeRefreshLogs = [];

// =================== PENGATURAN PEMBAYARAN & GATEWAY WEBHOOK ===================
let paymentSettings = {
  // Mode Payment Gateway (midtrans, xendit, doku, tripay, manual)
  gatewayProvider: 'midtrans', // 'midtrans' | 'xendit' | 'doku' | 'tripay' | 'manual'
  serverKey: 'SB-Mid-server-DemoCafeSecretKey9988',
  clientKey: 'SB-Mid-client-DemoCafeClientKey1122',
  webhookSecret: 'cafe_webhook_secret_key_2026',
  isProduction: false, // Sandbox vs Production

  qrisEnabled: true,
  qrisMerchantName: 'KOPI & MIE CAFE INDONESIA',
  qrisNmid: 'ID1020304050607',
  qrisCustomImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=00020101021226600016ID.CO.QRIS.WWW01189360099900000000010215ID10203040506075204581253033605802ID5925KOPI%20MIE%20CAFE%20INDONESIA6007JAKARTA6304ABCD',
  qrisNotes: 'Mendukung GoPay, OVO, ShopeePay, DANA, BCA, Mandiri, BRI & semua e-Wallet via QRIS.',
  
  bankEnabled: true,
  bankName: 'BCA (Bank Central Asia)',
  bankAccountNumber: '8730-1928-33',
  bankAccountHolder: 'CAFE RESTO NUSANTARA PT',
  bankNotes: 'Sertakan nomor meja Anda pada catatan transfer m-Banking.',

  cashierEnabled: true
};

// Log audit webhook payment gateway yang tercatat
let webhookAuditLogs = [];

// =================== PENGATURAN STRUK THERMAL ===================
let receiptSettings = {
  cafeName: 'KOPI & MIE CAFE',
  cafeAddress: 'Jl. Raya Kuliner Nusantara No. 88, Jakarta Selatan',
  cafePhone: '0812-3456-7890',
  headerNote: 'RESTO & CAFE SPECIALIST',
  footerNote: 'Terima kasih atas kunjungan Anda!\nFollow Instagram kami @kopimiecafe',
  paperWidth: '58mm',
  fontSize: '11px',
  fontFamily: 'Courier New, monospace',
  autoPrintOnConnect: true,
  wifiPassword: 'Password Wifi: cafe-enak-88'
};

// =================== PENGATURAN BANNER SUKSES & TERIMA KASIH (SUPER ADMIN ONLY) ===================
let successBannerSettings = {
  title: 'Pembayaran Berhasil! Terima Kasih',
  message: 'Pesanan Anda telah diterima dan langsung masuk ke antrean koki dapur & barista.',
  subMessage: 'Silakan duduk santai di meja Anda, pesanan lezat akan segera diantar!',
  imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
  showImage: true,
  socialText: 'Jangan lupa tag kami di Instagram: @kopimiecafe #KopiMieEnak'
};

// Koleksi database pesanan
const orders = [];

// =================== MIDDLEWARE VERIFIKASI SUPER ADMIN & STAF ===================
function verifyRole(allowedRoles) {
  return (req, res, next) => {
    const authEmail = (req.headers['x-user-email'] || req.query.authEmail || '').toLowerCase().trim();
    if (!authEmail) {
      return res.status(401).json({ success: false, message: 'Akses Ditolak: Anda wajib login terlebih dahulu!' });
    }

    if (authEmail === MASTER_SUPER_ADMIN_EMAIL) {
      req.user = { email: authEmail, role: 'super_admin' };
      return next();
    }

    const staff = staffUsers.find(u => u.email.toLowerCase() === authEmail);
    if (!staff) {
      return res.status(403).json({ success: false, message: 'Akses Ditolak: Akun Gmail ini tidak terdaftar di sistem cafe!' });
    }

    if (staff.role === 'super_admin') {
      req.user = staff;
      return next();
    }

    if (allowedRoles.includes('super_admin') && !allowedRoles.includes(staff.role)) {
      return res.status(403).json({
        success: false,
        message: `Akses Ditolak: Akun ${staff.role.toUpperCase()} sama sekali TIDAK MEMILIKI AKSES ke panel pengaturan. Hanya Super Admin yang berhak!`
      });
    }

    if (!allowedRoles.includes(staff.role)) {
      return res.status(403).json({
        success: false,
        message: `Akses Ditolak: Anda tidak memiliki izin untuk rute ini!`
      });
    }

    req.user = staff;
    next();
  };
}

// =================== BANNER SUKSES APIs (DIATUR SUPER ADMIN) ===================
app.get('/api/success-banner-settings', (req, res) => {
  res.json({ success: true, data: successBannerSettings });
});

app.put('/api/success-banner-settings', verifyRole(['super_admin']), (req, res) => {
  successBannerSettings = { ...successBannerSettings, ...req.body };
  res.json({
    success: true,
    message: 'Banner & Ucapan Terima Kasih Pembayaran Berhasil Disimpan!',
    data: successBannerSettings
  });
});

// PENCARIAN WEB GAMBAR PRESET (UNSPLASH CURATED UNTUK CAFE, RESTO, MAKANAN, MINUMAN, DESSERT & MIE)
app.get('/api/admin/search-web-images', verifyRole(['super_admin']), (req, res) => {
  const query = (req.query.q || '').toLowerCase().trim();
  
  // Library gambar web HD cepat untuk cafe, kopi, makanan, minuman, dimsum, mie & resto
  const webImagesDatabase = [
    // Kategori Kopi & Minuman
    {
      id: 1,
      title: 'Kopi Espresso & Latte Art Cafe',
      tag: 'coffee latte kopi espresso cafe drink minuman',
      url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 2,
      title: 'Es Kopi Susu Gula Aren Spesial',
      tag: 'kopi susu aren ice coffee minuman dingin segar boba',
      url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 3,
      title: 'Matcha Green Tea Latte Segar',
      tag: 'matcha green tea latte minuman non-coffee jepang susu',
      url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 4,
      title: 'Lemon Tea & Mocktail Dingin Segar',
      tag: 'lemon tea mocktail juice teh segar minuman es fruits',
      url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 5,
      title: 'Cokelat Panas / Hot Chocolate Cream',
      tag: 'chocolate cokelat cocoa coklat manis hot drink',
      url: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=600&auto=format&fit=crop&q=80'
    },
    
    // Kategori Mie Pedas Ala Gacoan & Makanan Utama
    {
      id: 6,
      title: 'Mie Pedas Spesial Level Pangsit Renyah',
      tag: 'mie pedas gacoan ramen noodles bakmi chili pedas makanan spicy',
      url: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 7,
      title: 'Mie Goreng Spesial Telur & Daging',
      tag: 'mie goreng noodles spicy bakmi ayam telor makanan gacoan',
      url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 8,
      title: 'Ramen Kuah Gurih Kental Telur Setengah Matang',
      tag: 'ramen soup mie kuah mie makanan jepang gurih noodles',
      url: 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 9,
      title: 'Nasi Goreng Spesial Cafe Telur Mata Sapi',
      tag: 'nasi goreng fried rice makanan rice cafe resto telur',
      url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 10,
      title: 'Ayam Goreng Crispy Renyah Sambal Pedas',
      tag: 'ayam crispy fried chicken makanan spicy lauk gurih',
      url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80'
    },

    // Kategori Snack, Dimsum, Kentang & Camilan
    {
      id: 11,
      title: 'Dimsum Siomay Kukus & Udang Keju Hangat',
      tag: 'dimsum siomay pangsit udang keju gacoan kukus snack camilan',
      url: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 12,
      title: 'Pangsit Goreng Renyah & Saus Asam Manis',
      tag: 'pangsit goreng wonton crispy snack gacoan keripik camilan',
      url: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 13,
      title: 'French Fries Kentang Goreng Bumbu Gurih',
      tag: 'french fries kentang goreng snack potato camilan cafe',
      url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 14,
      title: 'Croissant Mentega Hangat & Renyah',
      tag: 'croissant roti pastry bakery snack kue camilan manis',
      url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 15,
      title: 'Waffle Saus Cokelat & Es Krim',
      tag: 'waffle dessert es krim pancake manis snack kue',
      url: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600&auto=format&fit=crop&q=80'
    },

    // Kategori Suasana Cafe, Resto & Banner
    {
      id: 16,
      title: 'Suasana Cafe Hangat & Aesthetic',
      tag: 'cafe aesthetic banner suasana resto hangout kopi',
      url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 17,
      title: 'Interior Resto Modern & Nyaman',
      tag: 'resto interior modern tempat meja makan banner cafe',
      url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 18,
      title: 'Pelanggan Ceria Menikmati Hidangan',
      tag: 'happy customer pelanggan senyum terima kasih sahabat cafe',
      url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 19,
      title: 'Barista Meracik Kopi Espresso Segar',
      tag: 'barista kopi racik cafe kitchen mesin kopi',
      url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 20,
      title: 'Piring Hidangan Lezat & Mewah',
      tag: 'makanan food plating dinner resto hidangan lezat',
      url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'
    }
  ];

  if (!query) {
    return res.json({ success: true, data: webImagesDatabase });
  }

  const queryTokens = query.split(/\s+/).filter(Boolean);
  const filtered = webImagesDatabase.filter(img => {
    const textTarget = (img.title + ' ' + img.tag).toLowerCase();
    return queryTokens.some(token => textTarget.includes(token));
  });

  res.json({
    success: true,
    data: filtered.length > 0 ? filtered : webImagesDatabase
  });
});

// =================== BARCODE TABLE & REFRESH (EKSKLUSIF SUPER ADMIN) ===================
app.get('/api/qr/table/:tableNum', verifyRole(['super_admin']), async (req, res) => {
  try {
    const tableNum = parseInt(req.params.tableNum);
    const host = req.get('host');
    const protocol = req.protocol;
    const token = tableTokens[tableNum] || 'default';
    const targetUrl = `${protocol}://${host}/order.html?table=${tableNum}&token=${token}`;
    
    const qrDataUrl = await QRCode.toDataURL(targetUrl, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 320,
      color: {
        dark: '#1e293b',
        light: '#ffffff'
      }
    });

    res.json({
      success: true,
      tableNumber: tableNum,
      token,
      targetUrl,
      qrDataUrl
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/admin/refresh-barcode', verifyRole(['super_admin']), (req, res) => {
  const { tableNumber, reason } = req.body;
  const adminEmail = req.user.email;
  const timeStr = new Date().toLocaleString('id-ID');

  if (tableNumber === 'all' || !tableNumber) {
    for (let i = 1; i <= totalTables; i++) {
      tableTokens[i] = crypto.randomBytes(4).toString('hex');
    }
    const logMsg = `[${timeStr}] Super Admin (${adminEmail}) merefresh SEMUA BARCODE MEJA (1-20). Alasan: ${reason || 'Penyegaran rutin'}`;
    barcodeRefreshLogs.unshift(logMsg);
    return res.json({
      success: true,
      message: 'Semua Barcode Meja 1 s/d 20 berhasil diperbarui dengan token acak baru!',
      refreshed: 'all',
      timestamp: timeStr
    });
  } else {
    const tNum = parseInt(tableNumber);
    tableTokens[tNum] = crypto.randomBytes(4).toString('hex');
    const logMsg = `[${timeStr}] Super Admin (${adminEmail}) merefresh BARCODE MEJA ${tNum}. Token baru: ${tableTokens[tNum]}. Alasan: ${reason || 'Penyegaran'}`;
    barcodeRefreshLogs.unshift(logMsg);
    return res.json({
      success: true,
      message: `Barcode Meja ${tNum} berhasil di-refresh dengan token baru!`,
      tableNumber: tNum,
      newToken: tableTokens[tNum],
      timestamp: timeStr
    });
  }
});

app.get('/api/admin/barcode-logs', verifyRole(['super_admin']), (req, res) => {
  res.json({ success: true, logs: barcodeRefreshLogs });
});

app.get('/api/table/verify', (req, res) => {
  const table = parseInt(req.query.table);
  const token = req.query.token;

  if (!table || table < 1 || table > totalTables) {
    return res.json({ valid: false, message: 'Nomor meja tidak valid' });
  }

  if (token && tableTokens[table] && tableTokens[table] !== token) {
    return res.json({
      valid: false,
      expired: true,
      message: 'Barcode Meja ini sudah kedaluwarsa (Telah di-refresh oleh Super Admin). Silakan scan barcode terbaru di meja.'
    });
  }

  res.json({ valid: true, tableNumber: table });
});

// Cek pesanan aktif di meja pelanggan (HANYA yang belum Selesai)
app.get('/api/table/:tableNum/active-order', (req, res) => {
  const tableNum = parseInt(req.params.tableNum);
  if (!tableNum) {
    return res.status(400).json({ success: false, message: 'Nomor meja tidak valid' });
  }

  // Cari pesanan aktif untuk meja ini yang statusnya BELUM 'Selesai'
  const activeOrder = orders
    .filter(o => o.tableNumber === tableNum && o.status !== 'Selesai')
    .slice(-1)[0] || null;

  res.json({
    success: true,
    tableNumber: tableNum,
    hasActiveOrder: !!activeOrder,
    activeOrder: activeOrder
  });
});

// =================== ORDERS APIs (DAPUR, KASIR, ADMIN & CUSTOMER) ===================
app.post('/api/orders', (req, res) => {
  const { tableNumber, customerName, items, paymentMethod, totalAmount, paidImmediately } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Keranjang belanja masih kosong! Anda belum memilih menu makanan atau minuman satu pun.'
    });
  }

  if (tableNumber === undefined || tableNumber === null || tableNumber === '') {
    return res.status(400).json({ success: false, message: 'Nomor meja wajib dipilih!' });
  }

  if (!customerName || !customerName.trim()) {
    return res.status(400).json({ success: false, message: 'Nama pemesan wajib diisi!' });
  }

  let maxPrep = 10;
  items.forEach(it => {
    const match = menuData.find(m => m.id === it.id);
    if (match && match.prepTime > maxPrep) {
      maxPrep = match.prepTime;
    }
  });

  const activeOrdersCount = orders.filter(o => o.status === 'Sedang Dimasak' || o.status.includes('Menyiapkan')).length;
  const estimatedMinutes = maxPrep + (activeOrdersCount * 2);

  const orderId = 'ORD-' + Date.now().toString().slice(-6);
  const now = new Date();
  const estimatedReadyTime = new Date(now.getTime() + estimatedMinutes * 60000).toISOString();

  let initialStatus = 'Pesanan Diterima (Menunggu Antrean)';
  let paymentStatus = 'PENDING'; // 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED'
  let isPaymentDone = false;

  if (paidImmediately) {
    // Pesanan langsung kasir yang dibayar di tempat
    initialStatus = 'Sudah Dibayar';
    paymentStatus = 'PAID';
    isPaymentDone = true;
  } else if (paymentMethod === 'Kasir') {
    initialStatus = 'Menunggu Pembayaran Kasir';
    paymentStatus = 'UNPAID';
  } else if (paymentMethod === 'Transfer Bank') {
    initialStatus = 'Menunggu Transfer Bank';
    paymentStatus = 'UNPAID';
  } else if (paymentMethod === 'QRIS') {
    // Sesuai alur payment gateway: Status awal QRIS adalah Menunggu Pembayaran QRIS (PENDING)
    // Baru menjadi PAID setelah webhook payment gateway (Midtrans/Xendit/Tripay/DOKU) terverifikasi
    initialStatus = 'Menunggu Pembayaran QRIS (Scan QR)';
    paymentStatus = 'PENDING';
    isPaymentDone = false;
  }

  // Hitung total tagihan jika tidak dikirimkan dari frontend (subtotal + 10% tax)
  let finalTotal = parseFloat(totalAmount);
  if (!finalTotal || isNaN(finalTotal)) {
    const sub = items.reduce((acc, it) => acc + ((it.price || 0) * (it.qty || 1)), 0);
    const tax = Math.round(sub * 0.10);
    finalTotal = sub + tax;
  }

  const newOrder = {
    id: orderId,
    tableNumber: parseInt(tableNumber),
    customerName: customerName.trim(),
    items,
    paymentMethod: paymentMethod || 'Kasir',
    paymentStatus: paymentStatus, // Status pembayaran ketat
    gatewayProvider: paymentSettings.gatewayProvider,
    paymentDetails: {
      merchant: paymentSettings.qrisMerchantName,
      bank: paymentSettings.bankName,
      bankAccount: paymentSettings.bankAccountNumber,
      bankHolder: paymentSettings.bankAccountHolder
    },
    totalAmount: finalTotal,
    cashReceived: req.body.cashReceived || finalTotal,
    cashChange: req.body.cashChange || 0,
    status: initialStatus,
    createdAt: now.toISOString(),
    completedAt: null, // Diisi saat selesai
    estimatedMinutes: estimatedMinutes,
    estimatedReadyTime: estimatedReadyTime,
    kitchenTimeline: [
      {
        step: 'Pesanan Masuk',
        time: now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        completed: true
      },
      {
        step: 'Pembayaran Dikonfirmasi (PAID)',
        time: isPaymentDone ? now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-',
        completed: isPaymentDone
      },
      {
        step: 'Koki Memasak & Barista Meracik',
        time: '-',
        completed: false
      },
      {
        step: 'Siap Disajikan ke Meja',
        time: '-',
        completed: false
      }
    ]
  };

  orders.unshift(newOrder);
  res.json({
    success: true,
    message: 'Pesanan berhasil dibuat!',
    order: newOrder
  });
});

// GET /api/orders: Super Admin, Kasir, Dapur
app.get('/api/orders', verifyRole(['super_admin', 'kasir', 'dapur']), (req, res) => {
  const role = req.user.role;
  const viewMode = req.query.view; // 'active' atau 'history' atau undefined

  // Jika diminta viewMode tertentu (misal oleh Dapur atau Super Admin yang sedang membuka KDS)
  if (viewMode === 'history') {
    // Mengecek riwayat pesanan yang sudah selesai
    const historyOrders = orders.filter(o => o.status === 'Selesai');
    return res.json({ success: true, data: historyOrders, role, view: 'history' });
  } else if (viewMode === 'active') {
    // HANYA pesanan aktif yang belum selesai
    const activeOrders = orders.filter(o => o.status !== 'Selesai');
    return res.json({ success: true, data: activeOrders, role, view: 'active' });
  }

  // Jika role dapur tanpa parameter view khusus, default hanya aktif (agar pesanan selesai tidak nyasar)
  if (role === 'dapur') {
    const activeKitchenOrders = orders.filter(o => o.status !== 'Selesai');
    return res.json({ success: true, data: activeKitchenOrders, role: 'dapur', view: 'active' });
  }

  // Super Admin & Kasir melihat seluruh data jika tidak ada filter view
  res.json({ success: true, data: orders, role });
});

app.get('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const reqTable = parseInt(req.query.table);

  const order = orders.find(o => o.id === id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
  }

  if (reqTable && order.tableNumber !== reqTable) {
    return res.status(403).json({
      success: false,
      message: 'Akses Ditolak: Anda hanya dapat memantau pesanan untuk nomor meja Anda!'
    });
  }

  res.json({ success: true, order });
});

// PATCH /api/orders/:id/status: Dapur, Kasir, Super Admin
app.patch('/api/orders/:id/status', verifyRole(['super_admin', 'kasir', 'dapur']), (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const order = orders.find(o => o.id === id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
  }

  // ATURAN KETAT DAPUR TERKUNCI:
  // Koki dapur tidak bisa memproses / memasak pesanan jika pembayaran BELUM LUNAS (PAID)!
  if ((status === 'Sedang Dimasak' || status === 'Siap Disajikan') && order.paymentStatus !== 'PAID') {
    return res.status(400).json({
      success: false,
      message: 'Pesanan belum dibayar! Dapur terkunci dan hanya bisa memasak setelah pembayaran diselesaikan.'
    });
  }

  order.status = status;
  const currentTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  if (status === 'Sudah Dibayar' || status === 'Sudah Dibayar (QRIS)' || status === 'Pesanan Diterima (Menunggu Antrean)') {
    order.paymentStatus = 'PAID';
    order.kitchenTimeline[1].completed = true;
    order.kitchenTimeline[1].time = currentTime;
  } else if (status === 'Sedang Dimasak') {
    order.kitchenTimeline[1].completed = true;
    order.kitchenTimeline[2].completed = true;
    order.kitchenTimeline[2].time = currentTime;
  } else if (status === 'Siap Disajikan') {
    order.kitchenTimeline[1].completed = true;
    order.kitchenTimeline[2].completed = true;
    order.kitchenTimeline[3].completed = true;
    order.kitchenTimeline[3].time = currentTime;
  } else if (status === 'Selesai') {
    order.completedAt = new Date().toISOString();
    order.kitchenTimeline.forEach(t => t.completed = true);
  }

  res.json({ success: true, message: `Status pesanan diubah ke: ${status}`, order });
});

// =================== PAYMENT GATEWAY WEBHOOK (MIDTRANS, XENDIT, TRIPAY, DOKU) ===================
/**
 * Alur Proses Webhook QRIS:
 * 1. Payment Gateway mengirimkan notifikasi ke Webhook Server
 * 2. Server memverifikasi signature / API Key
 * 3. Cek Order ID (apakah ada di database orders)
 * 4. Cek Nominal (apakah jumlah pembayaran sesuai total tagihan)
 * 5. Cek Status Transaksi (settlement, capture, paid, success)
 * 6. Baru ubah: paymentStatus = 'PAID' dan status = 'Sudah Dibayar (QRIS Gateway)'
 */
app.post('/api/payment/webhook', (req, res) => {
  const provider = paymentSettings.gatewayProvider; // 'midtrans', 'xendit', 'tripay', 'doku'
  const timeStr = new Date().toLocaleString('id-ID');

  let orderId = '';
  let grossAmount = 0;
  let transactionStatus = '';
  let signatureValid = false;
  let receivedSignature = req.headers['x-callback-signature'] || req.headers['x-signature'] || req.body.signature_key || '';

  // STEP 2: VERIFIKASI SIGNATURE SESUAI PROVIDER
  if (provider === 'midtrans') {
    // Format Midtrans: order_id, status_code, gross_amount, ServerKey -> SHA512
    orderId = req.body.order_id;
    grossAmount = Math.round(parseFloat(req.body.gross_amount || 0));
    transactionStatus = req.body.transaction_status || req.body.status;
    const statusCode = req.body.status_code || '200';

    const rawString = `${orderId}${statusCode}${req.body.gross_amount}${paymentSettings.serverKey}`;
    const calculatedSignature = crypto.createHash('sha512').update(rawString).digest('hex');

    // Jika signature diberikan, cek kecocokan. Jika mode sandbox/simulasi, verifikasi diizinkan
    if (!receivedSignature || receivedSignature === calculatedSignature || req.body.is_simulation) {
      signatureValid = true;
    }
  } else if (provider === 'xendit') {
    // Format Xendit: x-callback-token verification
    orderId = req.body.external_id || req.body.order_id;
    grossAmount = Math.round(parseFloat(req.body.amount || 0));
    transactionStatus = req.body.status; // 'PAID', 'SETTLED'
    const xenditToken = req.headers['x-callback-token'];

    if (!xenditToken || xenditToken === paymentSettings.serverKey || req.body.is_simulation) {
      signatureValid = true;
    }
  } else if (provider === 'tripay') {
    // Format Tripay: HMAC-SHA256 signature
    orderId = req.body.merchant_ref;
    grossAmount = Math.round(parseFloat(req.body.total_amount || 0));
    transactionStatus = req.body.status; // 'PAID'

    const calculatedSig = crypto.createHmac('sha256', paymentSettings.serverKey).update(JSON.stringify(req.body)).digest('hex');
    if (!receivedSignature || receivedSignature === calculatedSig || req.body.is_simulation) {
      signatureValid = true;
    }
  } else {
    // Manual / DOKU / Gateway Lain
    orderId = req.body.order_id || req.body.orderId;
    grossAmount = Math.round(parseFloat(req.body.amount || req.body.gross_amount || 0));
    transactionStatus = req.body.transaction_status || req.body.status || 'PAID';
    signatureValid = true;
  }

  // LOG AUDIT WEBHOOK
  const auditEntry = {
    id: 'WH-' + Date.now().toString().slice(-4),
    timestamp: timeStr,
    provider,
    orderId,
    grossAmount,
    transactionStatus,
    signatureValid,
    ip: req.ip || req.socket.remoteAddress
  };

  // STEP 2: CEK KEABSAHAN SIGNATURE
  if (!signatureValid) {
    auditEntry.result = 'DITOLAK: Signature tidak valid!';
    webhookAuditLogs.unshift(auditEntry);
    return res.status(403).json({
      success: false,
      message: 'Verifikasi Gagal: Signature / API Key Payment Gateway tidak cocok!'
    });
  }

  // STEP 3: CEK ORDER ID
  const order = orders.find(o => o.id === orderId);
  if (!order) {
    auditEntry.result = `DITOLAK: Order ID (${orderId}) tidak ditemukan di sistem!`;
    webhookAuditLogs.unshift(auditEntry);
    return res.status(404).json({
      success: false,
      message: `Order ID ${orderId} tidak ditemukan di database pesanan cafe.`
    });
  }

  // STEP 4: CEK NOMINAL (Gross Amount harus cocok dengan order.totalAmount)
  if (grossAmount > 0 && grossAmount !== order.totalAmount) {
    auditEntry.result = `DITOLAK: Nominal tidak sesuai! Tagihan: Rp ${order.totalAmount}, Dibayar: Rp ${grossAmount}`;
    webhookAuditLogs.unshift(auditEntry);
    return res.status(400).json({
      success: false,
      message: `Nominal tidak valid! Total order: Rp ${order.totalAmount}, diterima: Rp ${grossAmount}`
    });
  }

  // STEP 5: CEK STATUS TRANSAKSI
  const successStatuses = ['settlement', 'capture', 'paid', 'success', 'completed'];
  const isPaid = successStatuses.includes(transactionStatus.toLowerCase());

  if (isPaid) {
    // STEP 6: BARU DIUBAH MENJADI PAID
    order.paymentStatus = 'PAID';
    order.status = 'Sudah Dibayar (QRIS Gateway)';
    order.paidAt = new Date().toISOString();
    
    // Update timeline proses dapur
    const curTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    order.kitchenTimeline[1].completed = true;
    order.kitchenTimeline[1].time = curTime;
    order.kitchenTimeline[1].step = `Pembayaran Lunas (${provider.toUpperCase()} QRIS)`;

    auditEntry.result = `BERHASIL: Order #${orderId} telah diverifikasi LUNAS (PAID)!`;
    webhookAuditLogs.unshift(auditEntry);

    return res.json({
      success: true,
      message: `Webhook sukses! Status pembayaran Order #${orderId} telah diverifikasi LUNAS (PAID).`,
      orderId: order.id,
      paymentStatus: 'PAID'
    });
  } else if (transactionStatus.toLowerCase().includes('pending')) {
    order.paymentStatus = 'PENDING';
    auditEntry.result = `PENDING: Menunggu pelanggan menyelesaikan scan QRIS #${orderId}`;
    webhookAuditLogs.unshift(auditEntry);
    return res.json({ success: true, message: 'Transaksi masih berstatus PENDING', orderId });
  } else {
    order.paymentStatus = 'FAILED';
    auditEntry.result = `GAGAL: Pembayaran #${orderId} dibatalkan atau kedaluwarsa (${transactionStatus})`;
    webhookAuditLogs.unshift(auditEntry);
    return res.json({ success: false, message: 'Transaksi FAILED / EXPIRED', orderId });
  }
});

// Endpoint untuk simulasi uji webhook pembayaran dari panel Super Admin
app.post('/api/admin/simulate-gateway-payment', verifyRole(['super_admin']), (req, res) => {
  const { orderId, amount, status, provider } = req.body;
  const targetOrder = orders.find(o => o.id === orderId);

  if (!targetOrder) {
    return res.status(404).json({ success: false, message: 'Order ID tidak ditemukan!' });
  }

  const payload = {
    order_id: orderId,
    gross_amount: amount || targetOrder.totalAmount,
    transaction_status: status || 'settlement',
    is_simulation: true
  };

  // Panggil endpoint webhook internal
  const curTime = new Date().toLocaleString('id-ID');
  const auditEntry = {
    id: 'SIM-' + Date.now().toString().slice(-4),
    timestamp: curTime,
    provider: provider || paymentSettings.gatewayProvider,
    orderId,
    grossAmount: payload.gross_amount,
    transactionStatus: payload.transaction_status,
    signatureValid: true,
    ip: '127.0.0.1 (Super Admin Test)'
  };

  if (payload.gross_amount !== targetOrder.totalAmount) {
    auditEntry.result = `DITOLAK: Nominal simulasi (Rp ${payload.gross_amount}) tidak cocok dengan total tagihan (Rp ${targetOrder.totalAmount})!`;
    webhookAuditLogs.unshift(auditEntry);
    return res.status(400).json({ success: false, message: auditEntry.result });
  }

  targetOrder.paymentStatus = 'PAID';
  targetOrder.status = 'Sudah Dibayar (QRIS Gateway)';
  targetOrder.paidAt = new Date().toISOString();

  const cTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  targetOrder.kitchenTimeline[1].completed = true;
  targetOrder.kitchenTimeline[1].time = cTime;
  targetOrder.kitchenTimeline[1].step = `Pembayaran Lunas (${(provider || paymentSettings.gatewayProvider).toUpperCase()} QRIS)`;

  auditEntry.result = `BERHASIL: Simulasi Webhook berhasil! Order #${orderId} telah diverifikasi LUNAS (PAID).`;
  webhookAuditLogs.unshift(auditEntry);

  res.json({
    success: true,
    message: `Verifikasi Pembayaran Berhasil! Status #${orderId} kini PAID dan langsung masuk ke proses dapur.`,
    order: targetOrder
  });
});

app.get('/api/admin/webhook-logs', verifyRole(['super_admin']), (req, res) => {
  res.json({ success: true, logs: webhookAuditLogs.slice(0, 30) });
});
app.get('/api/receipt-settings', (req, res) => {
  res.json({ success: true, data: receiptSettings });
});

app.put('/api/receipt-settings', verifyRole(['super_admin']), (req, res) => {
  receiptSettings = { ...receiptSettings, ...req.body };
  res.json({ success: true, message: 'Format Struk berhasil diperbarui oleh Super Admin!', data: receiptSettings });
});

app.get('/api/payment-settings', (req, res) => {
  res.json({ success: true, data: paymentSettings });
});

app.put('/api/payment-settings', verifyRole(['super_admin']), (req, res) => {
  paymentSettings = { ...paymentSettings, ...req.body };
  res.json({ success: true, message: 'Rekening & QRIS berhasil diperbarui oleh Super Admin!', data: paymentSettings });
});

// =================== KELOLA KATEGORI MENU (SUPER ADMIN ONLY) ===================
app.get('/api/categories', (req, res) => {
  res.json({ success: true, data: menuCategories });
});

app.post('/api/categories', verifyRole(['super_admin']), (req, res) => {
  const { name, icon } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Nama kategori wajib diisi!' });
  }
  const cleanName = name.trim();
  const exists = menuCategories.find(c => c.name.toLowerCase() === cleanName.toLowerCase());
  if (exists) {
    return res.status(400).json({ success: false, message: 'Kategori dengan nama tersebut sudah ada!' });
  }

  const newCat = {
    id: 'cat-' + Date.now().toString().slice(-4),
    name: cleanName,
    icon: icon || '🍽️'
  };
  menuCategories.push(newCat);
  res.json({ success: true, message: `Kategori "${cleanName}" berhasil ditambahkan!`, category: newCat });
});

app.put('/api/categories/:id', verifyRole(['super_admin']), (req, res) => {
  const { id } = req.params;
  const { name, icon } = req.body;
  const cat = menuCategories.find(c => c.id === id);
  if (!cat) {
    return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan!' });
  }
  const oldName = cat.name;
  if (name && name.trim()) {
    cat.name = name.trim();
    // Sinkronisasi kategori di menuData jika ada menu yang menggunakan kategori lama
    menuData.forEach(m => {
      if (m.category === oldName) m.category = cat.name;
    });
  }
  if (icon) cat.icon = icon;
  res.json({ success: true, message: `Kategori berhasil diperbarui menjadi "${cat.name}"!`, category: cat });
});

app.delete('/api/categories/:id', verifyRole(['super_admin']), (req, res) => {
  const { id } = req.params;
  const cat = menuCategories.find(c => c.id === id);
  if (!cat) {
    return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan!' });
  }
  menuCategories = menuCategories.filter(c => c.id !== id);
  res.json({ success: true, message: `Kategori "${cat.name}" berhasil dihapus!` });
});

// =================== KELOLA MENU CAFE (SUPER ADMIN ONLY) ===================
app.get('/api/menu', (req, res) => {
  res.json({ success: true, data: menuData, categories: menuCategories });
});

app.post('/api/menu', verifyRole(['super_admin']), (req, res) => {
  const { name, category, price, desc, image, hasLevel, prepTime, popular } = req.body;
  if (!name || !price) {
    return res.status(400).json({ success: false, message: 'Nama dan harga menu wajib diisi!' });
  }
  const newMenu = {
    id: Date.now(),
    name,
    category: category || (menuCategories[0] ? menuCategories[0].name : 'Makanan'),
    price: parseInt(price),
    desc: desc || '',
    image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
    popular: !!popular,
    hasLevel: !!hasLevel,
    prepTime: parseInt(prepTime) || 10
  };
  menuData.push(newMenu);
  res.json({ success: true, message: 'Menu berhasil ditambahkan', menu: newMenu });
});

app.put('/api/menu/:id', verifyRole(['super_admin']), (req, res) => {
  const id = parseInt(req.params.id);
  const menuIndex = menuData.findIndex(m => m.id === id);
  if (menuIndex === -1) {
    return res.status(404).json({ success: false, message: 'Menu tidak ditemukan!' });
  }

  const { name, category, price, desc, image, hasLevel, prepTime, popular } = req.body;
  menuData[menuIndex] = {
    ...menuData[menuIndex],
    name: name || menuData[menuIndex].name,
    category: category || menuData[menuIndex].category,
    price: price ? parseInt(price) : menuData[menuIndex].price,
    desc: desc !== undefined ? desc : menuData[menuIndex].desc,
    image: image || menuData[menuIndex].image,
    hasLevel: hasLevel !== undefined ? !!hasLevel : menuData[menuIndex].hasLevel,
    prepTime: prepTime ? parseInt(prepTime) : menuData[menuIndex].prepTime,
    popular: popular !== undefined ? !!popular : menuData[menuIndex].popular
  };

  res.json({ success: true, message: `Menu "${menuData[menuIndex].name}" berhasil diperbarui!`, menu: menuData[menuIndex] });
});

app.delete('/api/menu/:id', verifyRole(['super_admin']), (req, res) => {
  const id = parseInt(req.params.id);
  menuData = menuData.filter(m => m.id !== id);
  res.json({ success: true, message: 'Menu berhasil dihapus' });
});

// =================== AUTH & STAF MANAGEMENT ===================
app.post('/api/auth/google-login', (req, res) => {
  const { email, name, avatar } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email Google diperlukan' });
  }

  const cleanEmail = email.toLowerCase().trim();

  // 1. Cek Super Admin Utama
  if (cleanEmail === MASTER_SUPER_ADMIN_EMAIL) {
    return res.json({
      success: true,
      user: {
        email: cleanEmail,
        name: name || 'Super Admin Master',
        role: 'super_admin',
        avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60'
      }
    });
  }

  // 2. Cek apakah terdaftar di daftar staf/admin yang diizinkan (Kasir, Dapur, ATAU Super Admin tambahan)
  const staff = staffUsers.find(u => u.email.toLowerCase() === cleanEmail);
  if (staff) {
    return res.json({
      success: true,
      user: {
        email: cleanEmail,
        name: staff.name || name,
        role: staff.role, // 'super_admin' | 'kasir' | 'dapur'
        avatar: avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=60'
      }
    });
  }

  // Jika email sembarangan (tidak terdaftar di staffUsers dan bukan admin@gmail.com) -> DITOLAK
  res.status(403).json({
    success: false,
    message: `Akses Ditolak: Akun (${cleanEmail}) belum diberi izin oleh Super Admin.`
  });
});

app.get('/api/admin/staff', verifyRole(['super_admin']), (req, res) => {
  res.json({ success: true, data: staffUsers, masterAdmin: MASTER_SUPER_ADMIN_EMAIL });
});

app.post('/api/admin/staff', verifyRole(['super_admin']), (req, res) => {
  const { email, name, role } = req.body;
  if (!email || !role) {
    return res.status(400).json({ success: false, message: 'Email Gmail dan role wajib diisi!' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const existing = staffUsers.find(u => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    existing.role = role;
    existing.name = name || existing.name;
    return res.json({ success: true, message: `Hak akses ${cleanEmail} diperbarui menjadi ${role}` });
  }

  const newUser = {
    id: 'USR-' + Date.now().toString().slice(-4),
    name: name || cleanEmail.split('@')[0],
    email: cleanEmail,
    role, // 'super_admin', 'kasir', 'dapur'
    createdAt: new Date().toISOString()
  };

  staffUsers.push(newUser);
  res.json({ success: true, message: `Akun Gmail ${cleanEmail} berhasil diberi akses ${role.toUpperCase()}!`, user: newUser });
});

app.delete('/api/admin/staff/:id', verifyRole(['super_admin']), (req, res) => {
  const { id } = req.params;
  staffUsers = staffUsers.filter(u => u.id !== id);
  res.json({ success: true, message: 'Hak akses staf berhasil dicabut' });
});

app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`☕ Cafe Smart QR System Online on PORT: ${PORT}`);
  console.log(`👑 Super Admin Panel: http://localhost:${PORT}/admin.html`);
  console.log(`👨‍🍳 Layar Dapur KDS: http://localhost:${PORT}/kitchen.html`);
  console.log(`💵 Kasir POS: http://localhost:${PORT}/cashier.html`);
  console.log(`📱 Pelanggan: http://localhost:${PORT}/order.html`);
  console.log(`=================================================`);
});
