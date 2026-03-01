import React from "react";
import { useState, useEffect, useMemo, useRef } from "react";
import {
  Plus, Search, FileText, Download, CheckCircle, AlertCircle,
  Clock, X, Printer, MessageSquare, Send,
} from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import generatePayload from "promptpay-qr";

interface Invoice {
  id: number;
  tenant_name: string;
  room_number: string;
  month: number;
  year: number;
  rent_amount: number;
  water_amount: number;
  electricity_amount: number;
  total: number;
  status: "paid" | "unpaid" | "overdue";
  created_at: string;
}

interface Tenant { id: number; name: string; room_id: number | null; room_number: string | null; }
interface Settings { dorm_name?: string; promptpay_id?: string; line_notify_token?: string; }

const MONTH_NAMES = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];

function getMonthName(m: number) { return MONTH_NAMES[m - 1] ?? ""; }

function getStatusBadge(status: string) {
  if (status === "paid") return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200"><CheckCircle className="w-3 h-3 mr-1" />ชำระแล้ว</span>;
  if (status === "unpaid") return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200"><Clock className="w-3 h-3 mr-1" />รอชำระ</span>;
  return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200"><AlertCircle className="w-3 h-3 mr-1" />เกินกำหนด</span>;
}

// ──────────────────────────────────────────────
// Create Invoice Modal
// ──────────────────────────────────────────────
function CreateInvoiceModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const now = new Date();
  const [form, setForm] = useState({
    tenant_id: "",
    room_id: "",
    month: String(now.getMonth() + 1),
    year: String(now.getFullYear()),
    rent_amount: "",
    water_amount: "",
    electricity_amount: "",
  });
  const [tenants, setTenants] = useState<Tenant[]>([]);

  useEffect(() => {
    fetch("/api/tenants").then((r) => r.json()).then(setTenants);
  }, []);

  const selectedTenant = tenants.find((t) => String(t.id) === form.tenant_id);

  useEffect(() => {
    if (selectedTenant?.room_id) {
      setForm((f) => ({ ...f, room_id: String(selectedTenant.room_id) }));
    }
  }, [form.tenant_id, selectedTenant]);

  const total = (Number(form.rent_amount) || 0) + (Number(form.water_amount) || 0) + (Number(form.electricity_amount) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenant_id: Number(form.tenant_id),
        room_id: Number(form.room_id),
        month: Number(form.month),
        year: Number(form.year),
        rent_amount: Number(form.rent_amount),
        water_amount: Number(form.water_amount),
        electricity_amount: Number(form.electricity_amount),
      }),
    });
    onSave();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-zinc-100">
          <h2 className="text-lg font-semibold text-zinc-900">สร้างบิลใหม่</h2>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-600 rounded-full hover:bg-zinc-100"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-zinc-700 mb-1">ผู้เช่า</label>
              <select required value={form.tenant_id} onChange={(e) => setForm({ ...form, tenant_id: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                <option value="">-- เลือกผู้เช่า --</option>
                {tenants.filter((t) => t.room_id).map((t) => (
                  <option key={t.id} value={t.id}>{t.name} (ห้อง {t.room_number})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">เดือน</label>
              <select value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                {MONTH_NAMES.map((name, i) => <option key={i + 1} value={i + 1}>{name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">ปี (พ.ศ.)</label>
              <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">ค่าเช่า (฿)</label>
              <input required type="number" value={form.rent_amount} onChange={(e) => setForm({ ...form, rent_amount: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">ค่าน้ำ (฿)</label>
              <input required type="number" value={form.water_amount} onChange={(e) => setForm({ ...form, water_amount: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">ค่าไฟ (฿)</label>
              <input required type="number" value={form.electricity_amount} onChange={(e) => setForm({ ...form, electricity_amount: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" placeholder="0" />
            </div>
          </div>
          {total > 0 && (
            <div className="bg-emerald-50 rounded-lg p-3 flex justify-between items-center">
              <span className="text-sm font-medium text-zinc-700">ยอดรวมทั้งสิ้น</span>
              <span className="text-lg font-bold text-emerald-700">฿{total.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-end space-x-3 pt-2 border-t border-zinc-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-lg">ยกเลิก</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg">สร้างบิล</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Invoice Detail Modal (with print, save image, LINE notify)
// ──────────────────────────────────────────────
function InvoiceDetailModal({
  invoice,
  settings,
  onClose,
  onPaid,
}: {
  invoice: Invoice;
  settings: Settings;
  onClose: () => void;
  onPaid: () => void;
}) {
  const qrCanvasRef = useRef<HTMLDivElement>(null);
  const [sendingLine, setSendingLine] = useState(false);
  const [lineSent, setLineSent] = useState(false);

  const promptpayId = settings.promptpay_id || "0000000000";
  const dormName = settings.dorm_name || "หอพัก";
  const invCode = `INV-${invoice.year}-${String(invoice.month).padStart(2,"0")}-${String(invoice.id).padStart(3,"0")}`;

  // ── Print PDF ──
  const handlePrint = () => {
    const qrCanvas = qrCanvasRef.current?.querySelector("canvas") as HTMLCanvasElement | null;
    const qrDataUrl = qrCanvas ? qrCanvas.toDataURL() : "";

    const html = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8"/>
  <title>ใบเสร็จ ${invCode}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Sarabun', sans-serif; background: #fff; color: #18181b; width: 400px; margin: 0 auto; }
    .header { background: #059669; color: #fff; padding: 20px; text-align: center; }
    .header h1 { font-size: 20px; font-weight: 700; }
    .header p { font-size: 13px; opacity: 0.85; margin-top: 2px; }
    .section { padding: 16px 20px; border-bottom: 1px solid #e4e4e7; }
    .row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
    .row .label { color: #71717a; }
    .row .value { font-weight: 600; }
    .total-row { display: flex; justify-content: space-between; padding: 12px 20px; background: #f0fdf4; font-size: 17px; font-weight: 700; color: #059669; }
    .qr-section { padding: 16px; text-align: center; }
    .qr-section p { font-size: 13px; color: #52525b; margin-bottom: 8px; }
    .qr-section img { width: 180px; height: 180px; }
    .qr-label { font-size: 12px; color: #71717a; margin-top: 6px; }
    .footer { padding: 12px; text-align: center; font-size: 11px; color: #a1a1aa; border-top: 1px dashed #e4e4e7; }
    @media print { body { width: 100%; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>${dormName}</h1>
    <p>ใบเสร็จค่าเช่า</p>
  </div>
  <div class="section">
    <div class="row"><span class="label">รหัสบิล</span><span class="value">${invCode}</span></div>
    <div class="row"><span class="label">ออกเมื่อ</span><span class="value">${format(new Date(invoice.created_at), "d MMMM yyyy", { locale: th })}</span></div>
    <div class="row"><span class="label">รอบบิล</span><span class="value">${getMonthName(invoice.month)} ${invoice.year}</span></div>
    <div class="row"><span class="label">ผู้เช่า</span><span class="value">${invoice.tenant_name}</span></div>
    <div class="row"><span class="label">ห้อง</span><span class="value">${invoice.room_number}</span></div>
  </div>
  <div class="section">
    <div class="row"><span class="label">ค่าเช่าห้อง</span><span class="value">฿${invoice.rent_amount.toLocaleString()}</span></div>
    <div class="row"><span class="label">ค่าน้ำประปา</span><span class="value">฿${invoice.water_amount.toLocaleString()}</span></div>
    <div class="row"><span class="label">ค่าไฟฟ้า</span><span class="value">฿${invoice.electricity_amount.toLocaleString()}</span></div>
  </div>
  <div class="total-row"><span>ยอดรวมทั้งสิ้น</span><span>฿${invoice.total.toLocaleString()}</span></div>
  ${invoice.status !== "paid" && qrDataUrl ? `
  <div class="qr-section">
    <p>สแกนเพื่อชำระเงิน (พร้อมเพย์)</p>
    <img src="${qrDataUrl}" alt="QR Code" />
    <div class="qr-label">พร้อมเพย์: ${promptpayId}</div>
  </div>` : `<div class="qr-section"><p style="color:#059669;font-weight:700;font-size:16px;">✓ ชำระเงินเรียบร้อยแล้ว</p></div>`}
  <div class="footer">${dormName} · ขอบคุณที่ใช้บริการ</div>
  <script>window.onload = () => { window.print(); }<\/script>
</body></html>`;

    const w = window.open("", "_blank", "width=480,height=700");
    if (w) { w.document.write(html); w.document.close(); }
  };

  // ── Save as Image ──
  const handleSaveImage = () => {
    const qrCanvas = qrCanvasRef.current?.querySelector("canvas") as HTMLCanvasElement | null;
    const W = 420, H = 680;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);

    // Header
    ctx.fillStyle = "#059669";
    ctx.fillRect(0, 0, W, 70);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "center";
    ctx.fillText(dormName, W / 2, 32);
    ctx.font = "14px Arial";
    ctx.fillText("ใบเสร็จค่าเช่า", W / 2, 54);

    // Invoice Info
    const drawRow = (label: string, value: string, y: number, bold = false) => {
      ctx.fillStyle = "#71717a";
      ctx.font = "13px Arial";
      ctx.textAlign = "left";
      ctx.fillText(label, 28, y);
      ctx.fillStyle = "#18181b";
      ctx.font = bold ? "bold 13px Arial" : "13px Arial";
      ctx.textAlign = "right";
      ctx.fillText(value, W - 28, y);
    };

    let y = 100;
    drawRow("รหัสบิล", invCode, y); y += 26;
    drawRow("รอบบิล", `${getMonthName(invoice.month)} ${invoice.year}`, y); y += 26;
    drawRow("ผู้เช่า", invoice.tenant_name, y); y += 26;
    drawRow("ห้อง", invoice.room_number, y); y += 10;

    // Divider
    ctx.strokeStyle = "#e4e4e7";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(28, y + 10); ctx.lineTo(W - 28, y + 10); ctx.stroke();
    y += 26;

    drawRow("ค่าเช่าห้อง", "฿" + invoice.rent_amount.toLocaleString(), y); y += 26;
    drawRow("ค่าน้ำประปา", "฿" + invoice.water_amount.toLocaleString(), y); y += 26;
    drawRow("ค่าไฟฟ้า", "฿" + invoice.electricity_amount.toLocaleString(), y); y += 16;

    // Total bar
    ctx.fillStyle = "#f0fdf4";
    ctx.fillRect(0, y, W, 40);
    ctx.fillStyle = "#059669";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "left";
    ctx.fillText("ยอดรวมทั้งสิ้น", 28, y + 26);
    ctx.textAlign = "right";
    ctx.fillText("฿" + invoice.total.toLocaleString(), W - 28, y + 26);
    y += 60;

    // QR Code or Paid stamp
    if (invoice.status !== "paid" && qrCanvas) {
      ctx.fillStyle = "#52525b";
      ctx.font = "13px Arial";
      ctx.textAlign = "center";
      ctx.fillText("สแกนเพื่อชำระเงิน (พร้อมเพย์)", W / 2, y);
      y += 16;
      const qrSize = 160;
      ctx.drawImage(qrCanvas, (W - qrSize) / 2, y, qrSize, qrSize);
      y += qrSize + 10;
      ctx.fillStyle = "#71717a";
      ctx.font = "12px Arial";
      ctx.fillText("พร้อมเพย์: " + promptpayId, W / 2, y);
    } else {
      ctx.fillStyle = "#059669";
      ctx.font = "bold 18px Arial";
      ctx.textAlign = "center";
      ctx.fillText("✓ ชำระเงินเรียบร้อยแล้ว", W / 2, y + 20);
    }

    // Footer
    ctx.fillStyle = "#a1a1aa";
    ctx.font = "11px Arial";
    ctx.textAlign = "center";
    ctx.fillText(dormName + " · ขอบคุณที่ใช้บริการ", W / 2, H - 16);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `receipt-${invoice.room_number}-${invoice.year}-${invoice.month}.png`;
      link.click();
    }, "image/png");
  };

  // ── LINE Notify ──
  const handleLineNotify = async () => {
    const token = settings.line_notify_token;
    if (!token) { alert("กรุณาตั้งค่า LINE Notify Token ในหน้า 'ตั้งค่า' ก่อนนะคะ"); return; }
    setSendingLine(true);
    const message = `\n📋 ใบแจ้งหนี้ประจำเดือน ${getMonthName(invoice.month)} ${invoice.year}\n━━━━━━━━━━━━━━\nห้อง: ${invoice.room_number}\nผู้เช่า: ${invoice.tenant_name}\n━━━━━━━━━━━━━━\nค่าเช่าห้อง: ฿${invoice.rent_amount.toLocaleString()}\nค่าน้ำประปา: ฿${invoice.water_amount.toLocaleString()}\nค่าไฟฟ้า: ฿${invoice.electricity_amount.toLocaleString()}\n━━━━━━━━━━━━━━\n💰 ยอดรวม: ฿${invoice.total.toLocaleString()}\n\nกรุณาชำระภายในวันที่ 5 ของเดือน\nพร้อมเพย์: ${promptpayId}`;
    const res = await fetch("/api/line-notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, message }),
    });
    setSendingLine(false);
    if (res.ok) { setLineSent(true); setTimeout(() => setLineSent(false), 3000); }
    else { alert("ส่ง LINE ไม่สำเร็จ กรุณาตรวจสอบ Token"); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-zinc-100">
          <h2 className="text-lg font-semibold text-zinc-900">รายละเอียดบิล</h2>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-600 rounded-full hover:bg-zinc-100"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-zinc-900">บิลประจำเดือน {getMonthName(invoice.month)} {invoice.year}</h3>
            <p className="text-zinc-500 mt-1">ห้อง {invoice.room_number} · {invoice.tenant_name}</p>
            <p className="text-xs text-zinc-400 mt-0.5">{invCode}</p>
          </div>

          <div className="space-y-3 mb-6 text-sm">
            <div className="flex justify-between"><span className="text-zinc-500">ค่าเช่าห้อง</span><span className="font-medium">฿{invoice.rent_amount.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-zinc-500">ค่าน้ำประปา</span><span className="font-medium">฿{invoice.water_amount.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-zinc-500">ค่าไฟฟ้า</span><span className="font-medium">฿{invoice.electricity_amount.toLocaleString()}</span></div>
            <div className="pt-3 border-t border-zinc-100 flex justify-between text-lg font-bold">
              <span>ยอดรวมทั้งสิ้น</span>
              <span className="text-emerald-600">฿{invoice.total.toLocaleString()}</span>
            </div>
          </div>

          {invoice.status !== "paid" ? (
            <div className="bg-zinc-50 rounded-xl p-5 flex flex-col items-center border border-zinc-100">
              <p className="text-sm font-medium text-zinc-600 mb-3">สแกนเพื่อชำระเงิน (พร้อมเพย์)</p>
              <div className="bg-white p-3 rounded-xl shadow-sm border border-zinc-100">
                <QRCodeSVG value={generatePayload(promptpayId, { amount: invoice.total })} size={190} />
              </div>
              {/* Hidden canvas for image export */}
              <div ref={qrCanvasRef} className="hidden">
                <QRCodeCanvas value={generatePayload(promptpayId, { amount: invoice.total })} size={200} />
              </div>
              <p className="text-xs text-zinc-400 mt-3 text-center">พร้อมเพย์: {promptpayId}</p>
            </div>
          ) : (
            <div>
              <div ref={qrCanvasRef} className="hidden">
                <QRCodeCanvas value={generatePayload(promptpayId, { amount: invoice.total })} size={200} />
              </div>
              <div className="bg-emerald-50 rounded-xl p-6 flex flex-col items-center border border-emerald-100 text-emerald-600">
                <CheckCircle className="w-12 h-12 mb-2" />
                <p className="font-medium">ชำระเงินเรียบร้อยแล้ว</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-zinc-100 bg-zinc-50 space-y-2">
          {invoice.status === "unpaid" && (
            <button onClick={() => { fetch(`/api/invoices/${invoice.id}/pay`, { method: "PUT" }).then(() => { onPaid(); onClose(); }); }}
              className="w-full py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center justify-center">
              <CheckCircle className="w-4 h-4 mr-2" />รับชำระแล้ว
            </button>
          )}
          <div className="flex space-x-2">
            <button onClick={handlePrint}
              className="flex-1 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-lg flex items-center justify-center">
              <Printer className="w-4 h-4 mr-2" />พิมพ์ PDF
            </button>
            <button onClick={handleSaveImage}
              className="flex-1 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-lg flex items-center justify-center">
              <Download className="w-4 h-4 mr-2" />เซฟรูป
            </button>
            <button onClick={handleLineNotify} disabled={sendingLine}
              className="flex-1 py-2 text-sm font-medium text-white bg-[#06C755] hover:bg-[#05a847] disabled:opacity-60 rounded-lg flex items-center justify-center">
              {lineSent ? <><CheckCircle className="w-4 h-4 mr-1" />ส่งแล้ว!</> : sendingLine ? "กำลังส่ง..." : <><Send className="w-4 h-4 mr-1" />LINE</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Main Invoices Page
// ──────────────────────────────────────────────
export function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ทั้งหมด");
  const [settings, setSettings] = useState<Settings>({});

  const fetchInvoices = () => {
    setIsLoading(true);
    fetch("/api/invoices").then((r) => r.json()).then((d) => { setInvoices(d); setIsLoading(false); }).catch(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchInvoices();
    fetch("/api/settings").then((r) => r.json()).then(setSettings).catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return invoices.filter((inv) => {
      const matchSearch = inv.tenant_name.toLowerCase().includes(q) || inv.room_number.includes(q);
      const statusMap: Record<string, string> = { "ชำระแล้ว": "paid", "รอชำระ": "unpaid", "เกินกำหนด": "overdue" };
      const matchStatus = filterStatus === "ทั้งหมด" || inv.status === statusMap[filterStatus];
      return matchSearch && matchStatus;
    });
  }, [invoices, search, filterStatus]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">ระบบบิลค่าเช่า</h1>
          <p className="text-sm text-zinc-500 mt-1">จัดการบิลค่าเช่า ค่าน้ำ ค่าไฟ และติดตามการชำระเงิน</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm">
          <Plus className="w-4 h-4 mr-2" />สร้างบิลใหม่
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/50">
          <div className="relative w-72">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><Search className="w-4 h-4 text-zinc-400" /></div>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-emerald-500 focus:border-emerald-500 bg-white"
              placeholder="ค้นหาชื่อผู้เช่า, ห้อง..." />
          </div>
          <div className="flex space-x-2">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="text-sm border border-zinc-200 rounded-lg text-zinc-600 bg-white py-2 pl-3 pr-8">
              <option>ทั้งหมด</option>
              <option>ชำระแล้ว</option>
              <option>รอชำระ</option>
              <option>เกินกำหนด</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50/50 border-b border-zinc-200">
              <tr>
                <th className="px-6 py-4 font-medium">รหัสบิล</th>
                <th className="px-6 py-4 font-medium">ผู้เช่า / ห้อง</th>
                <th className="px-6 py-4 font-medium">รอบบิล</th>
                <th className="px-6 py-4 font-medium">ยอดรวม</th>
                <th className="px-6 py-4 font-medium">สถานะ</th>
                <th className="px-6 py-4 font-medium text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-zinc-500">กำลังโหลดข้อมูล...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-zinc-500">ไม่พบบิลค่าเช่า</td></tr>
              ) : (
                filtered.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center font-medium text-zinc-900">
                        <FileText className="w-4 h-4 text-zinc-400 mr-2" />
                        INV-{invoice.year}-{String(invoice.month).padStart(2,"0")}-{String(invoice.id).padStart(3,"0")}
                      </div>
                      <div className="text-xs text-zinc-500 mt-1 ml-6">
                        ออกเมื่อ: {format(new Date(invoice.created_at), "d MMM yyyy", { locale: th })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-zinc-900">{invoice.tenant_name}</div>
                      <div className="text-zinc-500 text-xs mt-0.5">ห้อง {invoice.room_number}</div>
                    </td>
                    <td className="px-6 py-4 text-zinc-600">{getMonthName(invoice.month)} {invoice.year}</td>
                    <td className="px-6 py-4">
                      <div className="font-mono font-medium text-zinc-900">฿{invoice.total.toLocaleString()}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">เช่า: ฿{invoice.rent_amount} | น้ำไฟ: ฿{invoice.water_amount + invoice.electricity_amount}</div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(invoice.status)}</td>
                    <td className="px-6 py-4 text-right">
                      {invoice.status === "unpaid" && (
                        <button onClick={() => fetch(`/api/invoices/${invoice.id}/pay`, { method: "PUT" }).then(fetchInvoices)}
                          className="text-xs font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-md transition-colors mr-2">
                          รับชำระ
                        </button>
                      )}
                      <button onClick={() => setSelectedInvoice(invoice)} className="text-zinc-400 hover:text-zinc-600 p-1 transition-colors" title="ดูบิล">
                        <FileText className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-zinc-200 text-sm text-zinc-500 bg-zinc-50/50">
          <span>แสดง {filtered.length} จาก {invoices.length} รายการ</span>
        </div>
      </div>

      {showCreate && <CreateInvoiceModal onClose={() => setShowCreate(false)} onSave={fetchInvoices} />}
      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          settings={settings}
          onClose={() => setSelectedInvoice(null)}
          onPaid={fetchInvoices}
        />
      )}
    </div>
  );
}
