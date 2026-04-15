const db = require("./db");
const express = require("express");
const router = express.Router();
const mailer = require("./Public/mailer");

// 🔐 ADMIN SECURITY
router.use(async (req, res, next) => {
  if (!req.session.userId)
    return res.status(401).json({ error: "Login required" });

  const [rows] = await db.query("SELECT role FROM users WHERE id=?", [
    req.session.userId,
  ]);

  if (!rows.length || rows[0].role !== "admin")
    return res.status(403).json({ error: "Admin only" });

  next();
});

// USERS
router.get("/users", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM users");
  res.json(rows);
});

router.post("/update-user", async (req, res) => {
  const { id, balance, plan, status } = req.body;
  await db.query(
    "UPDATE users SET balance=?, active_plan_id=?, status=? WHERE id=?",
    [balance, plan, status, id],
  );
  res.json({ success: true });
});

// BAN / ACTIVATE
router.post("/ban-user", async (req, res) => {
  await db.query("UPDATE users SET status='banned' WHERE id=?", [req.body.id]);
  res.json({ success: true });
});

router.post("/activate-user", async (req, res) => {
  await db.query("UPDATE users SET status='active' WHERE id=?", [req.body.id]);
  res.json({ success: true });
});


router.post("/reject-payment", async (req, res) => {
  const { paymentId } = req.body;

  await db.query("UPDATE payments SET status='rejected' WHERE id=?", [
    paymentId,
  ]);

  res.json({ success: true });
});

router.post("/approve-payment", async (req, res) => {
  try {
    const { paymentId } = req.body;

    // 1️⃣ Get payment details
    const [payments] = await db.query("SELECT * FROM payments WHERE id=?", [
      paymentId,
    ]);

    if (!payments.length)
      return res.status(404).json({ error: "Payment not found" });

    const payment = payments[0];

    if (payment.status === "approved")
      return res.json({ message: "Already approved" });

    // 2️⃣ Get user
    const [users] = await db.query("SELECT * FROM users WHERE id=?", [
      payment.user_id,
    ]);

    const user = users[0];

    // 3️⃣ Get plan
    const [plans] = await db.query("SELECT * FROM plans WHERE id=?", [
      payment.plan_id,
    ]);

    const plan = plans[0];

    if (!plan) return res.status(404).json({ error: "Plan not found" });

    // 4️⃣ Approve payment
    await db.query("UPDATE payments SET status='approved' WHERE id=?", [
      paymentId,
    ]);

    // 5️⃣ Activate user (FIXED: Removed the crashing total_investment column)
    await db.query(
      `UPDATE users 
       SET status='active', active_plan_id=?
       WHERE id=?`,
      [plan.id, user.id],
    );

    // 6️⃣ Referral commission logic
    if (user.referrer_id) {
      const commissionAmount = plan.price * (plan.referral_commission / 100);

      // insert commission record
      // insert commission record (FIXED: changed 'pending' to 'approved')
      await db.query(
        `INSERT INTO commissions (user_id, from_user, amount, status) VALUES (?, ?, ?, 'approved')`,
        [user.referrer_id, user.id, commissionAmount]
      );

      // update referrer balance
      await db.query(
        `UPDATE users SET balance = balance + ? WHERE id=?`,
        [commissionAmount, user.referrer_id]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/approve-withdrawal", async (req, res) => {
  try {
    const { withdrawalId } = req.body;

    const [rows] = await db.query("SELECT * FROM withdrawals WHERE id=?", [
      withdrawalId,
    ]);

    if (!rows.length) return res.json({ error: "Request not found" });

    const withdrawal = rows[0];

    if (withdrawal.status === "approved")
      return res.json({ message: "Already approved" });

    // Deduct balance
    const [user] = await db.query("SELECT balance FROM users WHERE id=?", [
      withdrawal.user_id,
    ]);

    if (user[0].balance < withdrawal.amount)
      return res.json({ error: "Insufficient balance" });

    // Update withdrawal status
    await db.query("UPDATE withdrawals SET status='approved' WHERE id=?", [
      withdrawalId,
    ]);

    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/reject-withdrawal", async (req, res) => {
  const { withdrawalId } = req.body;

  await db.query("UPDATE withdrawals SET status='rejected' WHERE id=?", [
    withdrawalId,
  ]);

  res.json({ success: true });
});

router.get('/payments', async (req, res) => {
  const [rows] = await db.query("SELECT * FROM payments ORDER BY id DESC");
  res.json(rows);
});

module.exports = router;
