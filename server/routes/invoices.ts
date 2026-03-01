import { Router } from "express";
import db from "../../src/db/index.js";

const router = Router();

router.get("/", (req, res) => {
  try {
    const invoices = db.prepare(`
      SELECT i.*, t.name as tenant_name, r.number as room_number
      FROM invoices i
      JOIN tenants t ON i.tenant_id = t.id
      JOIN rooms r ON i.room_id = r.id
      ORDER BY i.year DESC, i.month DESC, i.created_at DESC
    `).all();
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});

router.post("/", (req, res) => {
  try {
    const { tenant_id, room_id, month, year, rent_amount, water_amount, electricity_amount, status } = req.body;
    const total = rent_amount + water_amount + electricity_amount;

    const stmt = db.prepare(`
      INSERT INTO invoices (tenant_id, room_id, month, year, rent_amount, water_amount, electricity_amount, total, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(tenant_id, room_id, month, year, rent_amount, water_amount, electricity_amount, total, status || 'unpaid');
    res.json({ id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: "Failed to create invoice" });
  }
});

router.put("/:id/pay", (req, res) => {
  try {
    const stmt = db.prepare("UPDATE invoices SET status = 'paid' WHERE id = ?");
    stmt.run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update invoice" });
  }
});

export default router;
