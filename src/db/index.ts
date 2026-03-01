import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbDir = path.join(__dirname, "../../data");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(path.join(dbDir, "dormitory.db"));

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    number TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL,
    price REAL NOT NULL,
    amenities TEXT DEFAULT '[]',
    status TEXT DEFAULT 'vacant' CHECK(status IN ('vacant', 'occupied', 'maintenance')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tenants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    room_id INTEGER,
    move_in_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id)
  );

  CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id INTEGER NOT NULL,
    room_id INTEGER NOT NULL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    rent_amount REAL NOT NULL,
    water_amount REAL NOT NULL,
    electricity_amount REAL NOT NULL,
    total REAL NOT NULL,
    status TEXT DEFAULT 'unpaid' CHECK(status IN ('unpaid', 'paid', 'overdue')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (room_id) REFERENCES rooms(id)
  );

  CREATE TABLE IF NOT EXISTS parcels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id INTEGER NOT NULL,
    tenant_id INTEGER,
    tracking_number TEXT,
    courier TEXT,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'picked_up')),
    received_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    picked_up_date DATETIME,
    FOREIGN KEY (room_id) REFERENCES rooms(id),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL DEFAULT ''
  );
`);

// Seed default settings if empty
const settingsCount = db.prepare("SELECT COUNT(*) as count FROM settings").get() as { count: number };
if (settingsCount.count === 0) {
  const setSetting = db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)");
  setSetting.run("dorm_name", "AT HOME เทพมิตร");
  setSetting.run("promptpay_id", "0812345678");
  setSetting.run("liff_id", "");
  setSetting.run("admin_name", "ผู้ดูแลระบบ");
  setSetting.run("admin_email", "admin@athome.com");
  setSetting.run("line_notify_token", "");
}

// Seed initial data if empty
const roomCount = db.prepare("SELECT COUNT(*) as count FROM rooms").get() as {
  count: number;
};
if (roomCount.count === 0) {
  console.log("Seeding initial data...");
  const insertRoom = db.prepare(
    "INSERT INTO rooms (number, type, price, amenities, status) VALUES (?, ?, ?, ?, ?)",
  );

  const stdAmenities = JSON.stringify([
    "แอร์",
    "เตียง 5 ฟุต",
    "ตู้เสื้อผ้า",
    "เครื่องทำน้ำอุ่น",
  ]);
  const dlxAmenities = JSON.stringify([
    "แอร์",
    "เตียง 6 ฟุต",
    "ตู้เสื้อผ้า",
    "เครื่องทำน้ำอุ่น",
    "ทีวี",
    "ตู้เย็น",
  ]);
  const suiteAmenities = JSON.stringify([
    "แอร์ 2 ตัว",
    "เตียง 6 ฟุต",
    "ตู้เสื้อผ้าบิวท์อิน",
    "เครื่องทำน้ำอุ่น",
    "สมาร์ททีวี",
    "ตู้เย็น",
    "ไมโครเวฟ",
    "โซฟา",
  ]);

  const rooms = [
    ["101", "Standard", 4500, stdAmenities, "occupied"],
    ["102", "Standard", 4500, stdAmenities, "vacant"],
    ["103", "Standard", 4500, stdAmenities, "occupied"],
    ["201", "Deluxe", 6000, dlxAmenities, "occupied"],
    ["202", "Deluxe", 6000, dlxAmenities, "vacant"],
    ["203", "Suite", 8500, suiteAmenities, "maintenance"],
  ];

  for (const room of rooms) {
    insertRoom.run(...room);
  }

  const insertTenant = db.prepare(
    "INSERT INTO tenants (name, phone, email, room_id, move_in_date) VALUES (?, ?, ?, ?, ?)",
  );
  insertTenant.run(
    "สมชาย ใจดี",
    "0812345678",
    "somchai@example.com",
    1,
    "2023-01-15",
  );
  insertTenant.run(
    "สมศรี รักดี",
    "0898765432",
    "somsri@example.com",
    3,
    "2023-05-01",
  );
  insertTenant.run(
    "มานะ สุขสบาย",
    "0855555555",
    "mana@example.com",
    4,
    "2023-11-10",
  );

  const insertInvoice = db.prepare(
    "INSERT INTO invoices (tenant_id, room_id, month, year, rent_amount, water_amount, electricity_amount, total, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
  );
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  insertInvoice.run(
    1,
    1,
    currentMonth,
    currentYear,
    4500,
    150,
    800,
    5450,
    "unpaid",
  );
  insertInvoice.run(
    2,
    3,
    currentMonth,
    currentYear,
    4500,
    200,
    1100,
    5800,
    "paid",
  );
  insertInvoice.run(
    3,
    4,
    currentMonth,
    currentYear,
    6000,
    100,
    650,
    6750,
    "unpaid",
  );

  const insertParcel = db.prepare(
    "INSERT INTO parcels (room_id, tenant_id, tracking_number, courier, description, status) VALUES (?, ?, ?, ?, ?, ?)",
  );
  insertParcel.run(1, 1, "TH123456789", "Kerry", "กล่องขนาดกลาง", "pending");
  insertParcel.run(
    4,
    3,
    "SPX98765432",
    "Shopee Express",
    "ซองเอกสาร",
    "pending",
  );
}

export default db;
