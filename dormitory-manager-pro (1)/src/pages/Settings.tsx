import React, { useState } from "react";
import { Save, CheckCircle2 } from "lucide-react";

export function Settings() {
  const [isSaved, setIsSaved] = useState(false);
  const [formData, setFormData] = useState({
    dormName: "AT HOME เทพมิตร",
    promptpayId: "0812345678",
    liffId: import.meta.env.VITE_LIFF_ID || "",
    adminName: "ผู้ดูแลระบบ",
    adminEmail: "admin@athome.com",
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, save to database
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">ตั้งค่าระบบ</h1>
        <p className="text-zinc-500 mt-1">จัดการข้อมูลหอพักและการเชื่อมต่อต่างๆ</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
        <form onSubmit={handleSave} className="p-6 space-y-8">
          
          {/* General Settings */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-900 border-b border-zinc-100 pb-2">ข้อมูลทั่วไป</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">ชื่อหอพัก</label>
                <input
                  type="text"
                  value={formData.dormName}
                  onChange={(e) => setFormData({ ...formData, dormName: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">พร้อมเพย์ (สำหรับรับชำระเงิน)</label>
                <input
                  type="text"
                  value={formData.promptpayId}
                  onChange={(e) => setFormData({ ...formData, promptpayId: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="เบอร์โทรศัพท์ หรือ เลขบัตรประชาชน"
                />
              </div>
            </div>
          </div>

          {/* LINE LIFF Settings */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-900 border-b border-zinc-100 pb-2">การเชื่อมต่อ LINE (สำหรับลูกบ้าน)</h2>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">LINE LIFF ID</label>
                <input
                  type="text"
                  value={formData.liffId}
                  onChange={(e) => setFormData({ ...formData, liffId: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm"
                  placeholder="เช่น 1234567890-AbcdEfgh"
                />
                <p className="text-xs text-zinc-500 mt-2">
                  * นำ LIFF ID จาก LINE Developers Console มาใส่ที่นี่ เพื่อให้ระบบดึงข้อมูลโปรไฟล์ลูกบ้านได้
                </p>
              </div>
            </div>
          </div>

          {/* Admin Profile */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-900 border-b border-zinc-100 pb-2">ข้อมูลผู้ดูแลระบบ</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">ชื่อผู้ดูแล</label>
                <input
                  type="text"
                  value={formData.adminName}
                  onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">อีเมล</label>
                <input
                  type="email"
                  value={formData.adminEmail}
                  onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end border-t border-zinc-100">
            {isSaved && (
              <span className="text-emerald-600 flex items-center text-sm mr-4">
                <CheckCircle2 className="w-4 h-4 mr-1" />
                บันทึกข้อมูลสำเร็จ
              </span>
            )}
            <button
              type="submit"
              className="bg-zinc-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              บันทึกการตั้งค่า
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
