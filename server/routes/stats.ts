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

// Monthly revenue for chart (last 6 months)
router.get("/revenue", (req, res) => {
  try {
    const thaiMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    const now = new Date();
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      const row = db.prepare(
        "SELECT COALESCE(SUM(total), 0) as revenue FROM invoices WHERE month = ? AND year = ?"
      ).get(m, y) as { revenue: number };
      result.push({ name: thaiMonths[m - 1], revenue: row.revenue });
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch revenue" });
  }
});

export default router;
