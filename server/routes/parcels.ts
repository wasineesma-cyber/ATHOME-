import { Router } from "express";
import db from "../../src/db/index.js";

const router = Router();

router.get("/", (req, res) => {
  try {
    const parcels = db.prepare(`
      SELECT p.*, r.number as room_number, t.name as tenant_name
      FROM parcels p
      JOIN rooms r ON p.room_id = r.id
      LEFT JOIN tenants t ON p.tenant_id = t.id
      ORDER BY p.received_date DESC
    `).all();
    res.json(parcels);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch parcels" });
  }
});

router.post("/", (req, res) => {
  try {
    const { room_id, tenant_id, tracking_number, courier, description } = req.body;
    const stmt = db.prepare("INSERT INTO parcels (room_id, tenant_id, tracking_number, courier, description) VALUES (?, ?, ?, ?, ?)");
    const result = stmt.run(room_id, tenant_id, tracking_number, courier, description);
    res.json({ id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: "Failed to create parcel" });
  }
});

router.put("/:id/pickup", (req, res) => {
  try {
    const stmt = db.prepare("UPDATE parcels SET status = 'picked_up', picked_up_date = CURRENT_TIMESTAMP WHERE id = ?");
    stmt.run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update parcel" });
  }
});

export default router;
