import { Router } from "express";
import db from "../../src/db/index.js";

const router = Router();

router.get("/", (req, res) => {
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

export default router;
