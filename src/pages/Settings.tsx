import React, { useState, useEffect } from "react";
import { Save, CheckCircle2, ExternalLink } from "lucide-react";

interface SettingsData {
  dorm_name: string;
  promptpay_id: string;
  liff_id: string;
  admin_name: string;
  admin_email: string;
  line_notify_token: string;
}

export function Settings() {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState<SettingsData>({
    dorm_name: "AT HOME เทพมิตร",
    promptpay_id: "0812345678",
    liff_id: "",
    admin_name: "ผู้ดูแลระบบ",
    admin_email: "admin@athome.com",
    line_notify_token: "",
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setForm((f) => ({ ...f, ...data }));
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  if (isLoading) return <div className="flex items-center justify-center h-40 text-zinc-500">กำลังโหลด...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">ตั้งค่าระบบ</h1>
        <p className="text-zinc-500 mt-1">จัดการข้อมูลหอพักและการเชื่อมต่อต่างๆ</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
        <form onSubmit={handleSave} className="p-6 space-y-8">
          {/* General */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-900 border-b border-zinc-100 pb-2">ข้อมูลทั่วไป</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">ชื่อหอพัก</label>
                <input type="text" value={form.dorm_name} onChange={(e) => setForm({ ...form, dorm_name: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">พร้อมเพย์ (รับชำระเงิน)</label>
                <input type="text" value={form.promptpay_id} onChange={(e) => setForm({ ...form, promptpay_id: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="เบอร์โทรศัพท์ หรือ เลขบัตรประชาชน" />
              </div>
            </div>
          </div>

          {/* LINE Notify */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-900 border-b border-zinc-100 pb-2">LINE Notify (แจ้งเตือนผู้เช่า)</h2>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">LINE Notify Token</label>
              <input type="text" value={form.line_notify_token} onChange={(e) => setForm({ ...form, line_notify_token: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm"
                placeholder="เช่น AbCdEfGhIjKlMnOpQrStUvWxYz" />
              <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1">
                รับ Token ได้ที่
                <a href="https://notify-bot.line.me/th/" target="_blank" rel="noopener noreferrer"
                  className="text-emerald-600 underline flex items-center gap-0.5">
                  notify-bot.line.me <ExternalLink className="w-3 h-3" />
                </a>
                → "สร้าง Token" → เลือก Chatroom ที่ต้องการส่ง
              </p>
            </div>
          </div>

          {/* LINE LIFF */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-900 border-b border-zinc-100 pb-2">LINE LIFF (สำหรับลูกบ้านดูบิลเอง)</h2>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">LINE LIFF ID</label>
              <input type="text" value={form.liff_id} onChange={(e) => setForm({ ...form, liff_id: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm"
                placeholder="เช่น 1234567890-AbcdEfgh" />
            </div>
          </div>

          {/* Admin */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-900 border-b border-zinc-100 pb-2">ข้อมูลผู้ดูแลระบบ</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">ชื่อผู้ดูแล</label>
                <input type="text" value={form.admin_name} onChange={(e) => setForm({ ...form, admin_name: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">อีเมล</label>
                <input type="email" value={form.admin_email} onChange={(e) => setForm({ ...form, admin_email: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end border-t border-zinc-100">
            {isSaved && (
              <span className="text-emerald-600 flex items-center text-sm mr-4">
                <CheckCircle2 className="w-4 h-4 mr-1" />บันทึกข้อมูลสำเร็จ
              </span>
            )}
            <button type="submit" className="bg-zinc-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors flex items-center">
              <Save className="w-4 h-4 mr-2" />บันทึกการตั้งค่า
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
