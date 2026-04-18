// require('dotenv').config();
// const db = require('./db');
// const express = require('express');
// const bcrypt = require('bcryptjs');
// const session = require('express-session');
// const path = require('path');
// const crypto = require('crypto');
// const cron = require('node-cron');
// const app = express();


// // middleware
// app.use(express.static('Public'));
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());

// app.use(session({
//   secret: 'yourSecretKey',
//   resave: false,
//   saveUninitialized: true,
// }));

// app.get('/admin/login', (req, res) => {
//   res.sendFile(path.join(__dirname, 'Public', 'admin-login.html'));
// });

// app.post('/admin/login', async (req, res) => {
//   // ... (the login logic code you pasted earlier) ...
// });

// app.get('/api/user-data', async (req, res) => {

//   if (!req.session.userId)
//     return res.status(401).json({ error: "Login required" });

//   const [users] = await db.query(
//     "SELECT id,name,balance,status,referral_code FROM users WHERE id=?",
//     [req.session.userId]
//   );

//   res.json(users[0]);
// });

// // ✅ FIXED: adminRoutes ko function ki tarah CALL nahi karna
// app.use(express.static('Public'));



// const adminRoutes = require('./admin.routes');
// app.use('/admin', adminRoutes);




// // ---------------- ROUTES ----------------

// app.get('/', (req, res) =>
//   res.sendFile(path.join(__dirname, 'Public', 'index.html'))
// );

// app.get('/register', (req, res) =>
//   res.sendFile(path.join(__dirname, 'Public', 'register.html'))
// );

// app.get('/login', (req, res) =>
//   res.sendFile(path.join(__dirname, 'Public', 'login.html'))
// );


// app.get('/dashboard', (req, res) => {
//   // 1. Check if user is logged in
//   if (!req.session.userId) {
//     return res.redirect('/login');
//   }

//   // 2. Safely send the HTML file
//   // Note: Make sure 'Public' and 'dashboard.html' exactly match your actual folder/file names (capitalization matters!)
//   const filePath = path.join(__dirname, 'Public', 'dashboard.html');
//   res.sendFile(filePath);
// });

// // LOGOUT
// app.get('/logout', (req, res) => {
//   req.session.destroy(() => {
//     res.clearCookie('connect.sid');
//     res.redirect('/login');
//   });
// });

// // REGISTER (POST)
// // REGISTER (POST) - FIXED
// app.post('/register', async (req, res) => {
//   try {
//     const { name, email, password, ref } = req.body;
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const referralCode = "REF" + Math.floor(100000 + Math.random() * 900000);
//     let referrerId = null;

//     // 1. Check if a referral code was used
//     if (ref) {
//       const [refUser] = await db.query(
//         "SELECT id FROM users WHERE referral_code=?",
//         [ref]
//       );
//       if (refUser.length > 0) {
//         referrerId = refUser[0].id;
//       }
//     }

//     // 2. Insert the new user FIRST so we can get their new ID
//     const [result] = await db.query(
//       `INSERT INTO users (name,email,password,referral_code,referrer_id,status)
//        VALUES (?,?,?,?,?,?)`,
//       [name, email, hashedPassword, referralCode, referrerId, 'pending']
//     );

//     // 3. Now that the user is created, handle the commission
//     const newUserId = result.insertId; 
    
//     if (referrerId) {
//       await db.query(
//         "INSERT INTO commissions (user_id, from_user, amount, status) VALUES (?,?,?,'pending')",
//         [referrerId, newUserId, 500] // example 500 commission
//       );
//     }

//     res.redirect('/dashboard');

//   } catch (err) {
//     console.log(err);
//     res.send("Error registering");
//   }
// });
// // LOGIN (POST)
// app.post('/login', async (req, res) => {

//   const { email, password } = req.body;

//   const [users] = await db.query(
//     "SELECT * FROM users WHERE email=?",
//     [email]
//   );

//   if (users.length === 0)
//     return res.send("User not found");

//   const user = users[0];

//   const match = await bcrypt.compare(password, user.password);

//   if (!match)
//     return res.send("Invalid password");

//   req.session.userId = user.id;

//   res.redirect('/dashboard');
// });

// app.post('/select-plan', (req, res) => {
//   if (!req.session.userId) {
//     return res.json({ success:false, error:'Login required' });
//   }

//   req.session.selectedPlan = req.body.planId;
//   res.json({ success:true });
// });

// app.post('/withdraw-request', async (req, res) => {
//   try {

//     if (!req.session.userId)
//       return res.status(401).json({ error: "Login required" });

//     const { amount } = req.body;

//     // Get user
//     const [users] = await db.query(
//       "SELECT balance FROM users WHERE id=?",
//       [req.session.userId]
//     );

//     const user = users[0];

//     if (amount <= 0)
//       return res.json({ error: "Invalid amount" });

//     if (user.balance < amount)
//       return res.json({ error: "Insufficient balance" });

//     // Insert withdrawal request
//     await db.query(
//       `INSERT INTO withdrawals (user_id, amount, status)
//        VALUES (?,?, 'pending')`,
//       [req.session.userId, amount]
//     );

//     res.json({ success: true });

//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// app.post("/submit-payment", async (req, res) => {
//   const { plan_id, name, email, trx_id, amount, slip } = req.body;

//   await db.query(
//     `INSERT INTO payments 
//    (user_id,plan_id,name,email,trx_id,amount,slip,status)
//    VALUES (?,?,?,?,?,?,?,'pending')`,
//     [req.session.userId, plan_id, name, email, trx_id, amount, slip],
//   );

//   res.json({ success: true });
// });



// app.get('/payment', (req, res) => {
//   if (!req.session.selectedPlan)
//     return res.redirect('/buyplan');

//   res.sendFile(path.join(__dirname,'Public','payment.html'));
// });



// // Secure the Admin Panel HTML page
// app.get('/admin', async (req, res) => {
//   // 1. If they are not logged in at all, send them to the admin login page
//   if (!req.session.userId) {
//     return res.redirect('/admin/login');
//   }

//   // 2. Check the database to make sure they have the admin role
//   const [users] = await db.query("SELECT role FROM users WHERE id=?", [req.session.userId]);
  
//   if (users.length === 0 || users[0].role !== 'admin') {
//     return res.send("Access Denied. Regular users cannot view this page.");
//   }

//   // 3. If they pass the checks, show them the admin panel
//   res.sendFile(path.join(__dirname, 'Public', 'admin.html'));
// });

// // ==========================================
// // ADMIN LOGIN ROUTES
// // ==========================================



// // 2. Process the Admin Login
// app.post('/admin/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Find the user by email
//     const [users] = await db.query("SELECT * FROM users WHERE email=?", [email]);
//     if (users.length === 0) {
//       return res.send("User not found");
//     }

//     const user = users[0];

//     // SECURITY CHECK: Is this user actually an admin?
//     if (user.role !== 'admin') {
//       return res.send("Access Denied. You are not authorized to view the admin panel.");
//     }

//     // Check if password matches
//     const match = await bcrypt.compare(password, user.password);
//     if (!match) {
//       return res.send("Invalid password");
//     }

//     // Success! Save session and redirect to the admin panel
//     req.session.userId = user.id;
//     res.redirect('/admin');

//   } catch (err) {
//     console.log(err);
//     res.send("Server error during admin login");
//   }
// });

// app.listen(3000, () =>
//   console.log("Server running on http://localhost:3000")
// );
require('dotenv').config();
const db = require('./db');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const path = require('path');
const crypto = require('crypto');
const cron = require('node-cron');
const app = express();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
const JWT_EXPIRES_IN = '24h';

// ==========================================
// 1. MIDDLEWARE (Setup)
// ==========================================
app.use(express.static(path.join(__dirname, 'Public'))); // Serves your CSS, JS, and Images
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.set('trust proxy', 1);

// JWT Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    // Check cookie as fallback
    const cookieToken = req.cookies?.token;
    if (!cookieToken) {
      req.userId = null;
      return next();
    }
    return verifyToken(cookieToken, req, res, next);
  }
  
  return verifyToken(token, req, res, next);
}

function verifyToken(token, req, res, next) {
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      req.userId = null;
    } else {
      req.userId = user.userId;
      req.userRole = user.role;
    }
    next();
  });
}

function requireAuth(req, res, next) {
  if (!req.userId) {
    return res.status(401).json({ error: 'Login required' });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.userId) {
    return res.status(401).json({ error: 'Login required' });
  }
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Admin only' });
  }
  next();
}

app.use(authenticateToken);

// ==========================================
// 2. PUBLIC PAGE ROUTES (No login required)
// ==========================================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Public', 'index.html'));
});

// 1. UPDATED GET REGISTER ROUTE
app.get('/register', (req, res) => {
  // Agar URL mein ?ref= mojood hai, to usay session mein save kar lo
  if (req.query.ref) {
    req.session.pendingReferral = req.query.ref;
  }
  res.sendFile(path.join(__dirname, 'Public', 'login.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'Public', 'login.html'));
});

app.get('/admin/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'Public', 'admin-login.html'));
});


// REGISTER ROUTE (WITH SMART REFERRAL EXTRACTION)
app.post('/register', async (req, res) => {
  try {
    const { name, email, password, ref } = req.body;
    
    console.log("---- NEW REGISTRATION ----");
    console.log("Raw Input from Form:", ref);

    const [existingUsers] = await db.query("SELECT * FROM users WHERE email=?", [email]);
    if (existingUsers.length > 0) return res.send("Error: Email already registered.");

    const hashedPassword = await bcrypt.hash(password, 10);
    const referralCode = "REF" + Math.floor(100000 + Math.random() * 900000);
    let referrerId = null;

    // THE SMART FIX: Auto-extract the exact REF code even if a full URL is pasted
    if (ref && ref.trim() !== "") {
      let cleanRef = ref.trim(); 
      
      // Ye logic text mein se exact 'REF' aur uske numbers ko nikal legi
      const extractCode = cleanRef.match(/REF\d+/);
      
      if (extractCode) {
        cleanRef = extractCode[0]; 
        console.log("Cleaned Referral Code:", cleanRef);
      }

      const [refUser] = await db.query("SELECT id FROM users WHERE referral_code=?", [cleanRef]);
      
      if (refUser.length > 0) {
        referrerId = refUser[0].id;
        console.log("SUCCESS! Found Referrer ID:", referrerId);
      } else {
        console.log("FAILED: Referral code not found in database.");
      }
    } else {
      console.log("No referral code was submitted in the form.");
    }

    const [result] = await db.query(
      `INSERT INTO users (name,email,password,referral_code,referrer_id,status) VALUES (?,?,?,?,?,?)`,
      [name, email, hashedPassword, referralCode, referrerId, 'pending']
    );

    const token = jwt.sign({ userId: result.insertId, role: 'user' }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.cookie('token', token);
    res.redirect('/dashboard');

  } catch (err) {
    console.log(err);
    res.send("Error registering");
  }
});
// User Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const [users] = await db.query("SELECT * FROM users WHERE email=?", [email]);

  if (users.length === 0) return res.send("User not found");

  const user = users[0];
  const match = await bcrypt.compare(password, user.password);

  if (!match) return res.send("Invalid password");

  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  res.cookie('token', token);
  res.redirect('/dashboard');
});

// Admin Login Process
app.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [users] = await db.query("SELECT * FROM users WHERE email=?", [email]);
    
    if (users.length === 0) return res.send("User not found");

    const user = users[0];

    if (user.role !== 'admin') {
      return res.send("Access Denied. You are not authorized to view the admin panel.");
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.send("Invalid password");

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.cookie('token', token);
    res.redirect('/admin');

  } catch (err) {
    console.log(err);
    res.send("Server error during admin login");
  }
});

// Logout
app.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
});

// ==========================================
// 4. PROTECTED USER PAGES (Must be logged in)
// ==========================================
app.get('/dashboard', requireAuth, (req, res) => {
  const filePath = path.join(__dirname, 'Public', 'Dashboard.html');
  res.sendFile(filePath);
});

app.get('/payment', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname,'Public','payment.html'));
});

// User Data API
app.get('/api/user-data', requireAuth, async (req, res) => {
  try {
    // 1. Get basic user info
    const [users] = await db.query(
      "SELECT id, name, balance, status, referral_code, role FROM users WHERE id=?",
      [req.userId]
    );
    const user = users[0];

    // 2. Count Total Active Referrals
    const [referrals] = await db.query(
      "SELECT COUNT(*) as total FROM users WHERE referrer_id=? AND status='active'",
      [req.userId]
    );
    user.totalReferrals = referrals[0].total;

    // 3. Calculate Total Earnings (Sum of approved commissions)
    const [earnings] = await db.query(
      "SELECT SUM(amount) as total FROM commissions WHERE user_id=? AND status='approved'",
      [req.userId]
    );
    // If earnings[0].total is null (no earnings yet), set it to 0
    user.totalEarnings = earnings[0].total || 0; 

    // Send all this data to the dashboard
    res.json(user);

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Payment History API
app.get('/api/payment-history', requireAuth, async (req, res) => {
  try {
    const [payments] = await db.query(
      "SELECT amount, status, created_at FROM payments WHERE user_id=? ORDER BY created_at DESC", 
      [req.userId]
    );
    res.json(payments);
  } catch (error) {
    console.log("Payment History Error:", error);
    res.status(500).json([]);
  }
});


app.post("/submit-payment", requireAuth, async (req, res) => {
  try {
    const { name, email, trx_id, amount, slip, plan_id } = req.body;
    
    if (!plan_id) {
      return res.status(400).json({ error: "No plan selected. Please go back and select a plan." });
    }

    await db.query(
      `INSERT INTO payments 
      (user_id, plan_id, name, email, trx_id, amount, slip, status)
      VALUES (?,?,?,?,?,?,?,'pending')`,
      [req.userId, plan_id, name, email, trx_id, amount, slip]
    );

    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
});


app.post('/api/withdraw', requireAuth, async (req, res) => {
  try {
    const { name, method, account_number, amount } = req.body;
    const withdrawAmount = parseFloat(amount);

    // 1. Get current user balance
    const [users] = await db.query("SELECT balance FROM users WHERE id=?", [req.userId]);
    const user = users[0];

    // 2. Security Checks
    if (withdrawAmount <= 0) return res.status(400).json({ error: "Amount must be greater than 0." });
    if (withdrawAmount > user.balance) return res.status(400).json({ error: "Insufficient balance!" });

    // 3. Deduct balance immediately
    await db.query("UPDATE users SET balance = balance - ? WHERE id=?", [withdrawAmount, req.userId]);

    // 4. Save request in withdrawals table
    await db.query(
      `INSERT INTO withdrawals (user_id, name, payment_method, account_number, amount, status) 
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [req.userId, name, method, account_number, withdrawAmount]
    );

    res.json({ success: true, message: "Withdrawal request submitted successfully!" });
  } catch (error) {
    console.log("Withdrawal Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});


app.get('/admin/withdrawals', requireAdmin, async (req, res) => {
  try {
    const [withdrawals] = await db.query("SELECT * FROM withdrawals ORDER BY created_at DESC");
    res.json(withdrawals);
  } catch (error) {
    console.log("Error fetching withdrawals:", error);
    res.status(500).json([]);
  }
});


// Buy Plan Page
app.get('/buyplan', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'Public', 'plan.html'));
});

// Select Plan - Just confirm success (plan_id passed directly to submit-payment)
app.post('/select-plan', requireAuth, (req, res) => {
  res.json({ success: true });
});

// Admin HTML Page Route
app.get('/admin', requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'Public', 'admin.html'));
});

// Admin API Routes (from admin.routes.js)
const adminRoutes = require('./admin.routes');
app.use('/admin', adminRoutes);

// ==========================================
// 7. START SERVER
// ==========================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export for Vercel serverless
module.exports = app;