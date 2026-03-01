import { Router } from "express";
import db from "../../src/db/index.js";

const router = Router();

router.get("/", (req, res) => {
  try {
    const tenants = db.prepare(`
      SELECT t.*, r.number as room_number
      FROM tenants t
      LEFT JOIN rooms r ON t.room_id = r.id
      ORDER BY t.created_at DESC
    `).all();
    res.json(tenants);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tenants" });
  }
});

router.post("/", (req, res) => {
  try {
    const { name, phone, email, room_id, move_in_date } = req.body;

    const transaction = db.transaction(() => {
      const stmt = db.prepare("INSERT INTO tenants (name, phone, email, room_id, move_in_date) VALUES (?, ?, ?, ?, ?)");
      const result = stmt.run(name, phone, email, room_id, move_in_date);

      if (room_id) {
        db.prepare("UPDATE rooms SET status = 'occupied' WHERE id = ?").run(room_id);
      }

      return result.lastInsertRowid;
    });

    const id = transaction();
    res.json({ id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create tenant" });
  }
});

export default router;
