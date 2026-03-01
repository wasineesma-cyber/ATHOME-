import { Router } from "express";
import db from "../../src/db/index.js";

const router = Router();

router.get("/", (req, res) => {
  try {
    const rooms = db.prepare(`
      SELECT r.*, t.name as tenant_name
      FROM rooms r
      LEFT JOIN tenants t ON r.id = t.room_id
      ORDER BY r.number ASC
    `).all();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
});

router.post("/", (req, res) => {
  try {
    const { number, type, price, amenities, status } = req.body;
    const stmt = db.prepare("INSERT INTO rooms (number, type, price, amenities, status) VALUES (?, ?, ?, ?, ?)");
    const result = stmt.run(number, type, price, amenities || '[]', status || 'vacant');
    res.json({ id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: "Failed to create room" });
  }
});

router.put("/:id", (req, res) => {
  try {
    const { number, type, price, amenities, status } = req.body;
    const stmt = db.prepare("UPDATE rooms SET number = ?, type = ?, price = ?, amenities = ?, status = ? WHERE id = ?");
    stmt.run(number, type, price, amenities, status, req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update room" });
  }
});

export default router;
