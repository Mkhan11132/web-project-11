

async function distributeDailyProfit() {
  try {
    console.log("⏳ Running Daily Profit Distribution...");

    // Get users with active plans
    const [users] = await db.query(`
      SELECT u.id, u.name, u.balance, p.daily_earning
      FROM users u
      JOIN plans p ON u.active_plan_id = p.id
      WHERE u.active_plan_id IS NOT NULL
      AND u.status = 'active'
    `);

    for (let user of users) {
      const earning = parseFloat(user.daily_earning);

      if (earning > 0) {
        await db.query(
          "UPDATE users SET balance = balance + ? WHERE id = ?",
          [earning, user.id]
        );

        await db.query(
          "INSERT INTO earnings (user_id, amount) VALUES (?, ?)",
          [user.id, earning]
        );

        console.log(`✅ Added daily profit ${earning} to ${user.name}`);
      }
    }

    console.log("🎉 Daily profit distribution complete");
  } catch (err) {
    console.error("Daily Profit Error:", err);
  }
}

module.exports = distributeDailyProfit;
