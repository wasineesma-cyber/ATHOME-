import express from "express";
import { createServer as createViteServer } from "vite";
import db from "./src/db/index.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  
  // --- Dashboard Stats ---
  app.get("/api/stats", (req, res) => {
    try {
      const totalRooms = db.prepare("SELECT COUNT(*) as count FROM rooms").get() as { count: number };
      const occupiedRooms = db.prepare("SELECT COUNT(*) as count FROM rooms WHERE status = 'occupied'").get() as { count: number };
      const totalTenants = db.prepare("SELECT COUNT(*) as count FROM tenants").get() as { count: number };
      
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      const revenue = db.prepare("SELECT SUM(total) as total FROM invoices WHERE status = 'paid' AND month = ? AND year = ?")
        .get(currentMonth, currentYear) as { total: number | null };
        
      const pendingInvoices = db.prepare("SELECT COUNT(*) as count FROM invoices WHERE status = 'unpaid'").get() as { count: number };

      res.json({
        totalRooms: totalRooms.count,
        occupiedRooms: occupiedRooms.count,
        occupancyRate: totalRooms.count > 0 ? Math.round((occupiedRooms.count / totalRooms.count) * 100) : 0,
        totalTenants: totalTenants.count,
        monthlyRevenue: revenue.total || 0,
        pendingInvoices: pendingInvoices.count,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // --- Rooms ---
  app.get("/api/rooms", (req, res) => {
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

  app.post("/api/rooms", (req, res) => {
    try {
      const { number, type, price, amenities, status } = req.body;
      const stmt = db.prepare("INSERT INTO rooms (number, type, price, amenities, status) VALUES (?, ?, ?, ?, ?)");
      const result = stmt.run(number, type, price, amenities || '[]', status || 'vacant');
      res.json({ id: result.lastInsertRowid });
    } catch (error) {
      res.status(500).json({ error: "Failed to create room" });
    }
  });

  app.put("/api/rooms/:id", (req, res) => {
    try {
      const { number, type, price, amenities, status } = req.body;
      const stmt = db.prepare("UPDATE rooms SET number = ?, type = ?, price = ?, amenities = ?, status = ? WHERE id = ?");
      stmt.run(number, type, price, amenities, status, req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update room" });
    }
  });

  // --- Parcels ---
  app.get("/api/parcels", (req, res) => {
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

  app.post("/api/parcels", (req, res) => {
    try {
      const { room_id, tenant_id, tracking_number, courier, description } = req.body;
      const stmt = db.prepare("INSERT INTO parcels (room_id, tenant_id, tracking_number, courier, description) VALUES (?, ?, ?, ?, ?)");
      const result = stmt.run(room_id, tenant_id, tracking_number, courier, description);
      res.json({ id: result.lastInsertRowid });
    } catch (error) {
      res.status(500).json({ error: "Failed to create parcel" });
    }
  });

  app.put("/api/parcels/:id/pickup", (req, res) => {
    try {
      const stmt = db.prepare("UPDATE parcels SET status = 'picked_up', picked_up_date = CURRENT_TIMESTAMP WHERE id = ?");
      stmt.run(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update parcel" });
    }
  });

  // --- Tenants ---
  app.get("/api/tenants", (req, res) => {
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

  app.post("/api/tenants", (req, res) => {
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

  // --- Invoices ---
  app.get("/api/invoices", (req, res) => {
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

  app.post("/api/invoices", (req, res) => {
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

  app.put("/api/invoices/:id/pay", (req, res) => {
    try {
      const stmt = db.prepare("UPDATE invoices SET status = 'paid' WHERE id = ?");
      stmt.run(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update invoice" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, you would serve static files here
    // app.use(express.static('dist'));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
