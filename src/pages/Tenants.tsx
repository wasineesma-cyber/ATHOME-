import React from "react";
import { useState, useEffect, useMemo } from "react";
import { Plus, Search, Mail, Phone, Edit2, Trash2, X } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface Tenant {
  id: number;
  name: string;
  phone: string;
  email: string;
  room_id: number | null;
  room_number: string | null;
  move_in_date: string;
}

interface Room {
  id: number;
  number: string;
  status: string;
}

function TenantModal({ tenant, onClose, onSave }: { tenant: Tenant | null; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({
    name: tenant?.name ?? "",
    phone: tenant?.phone ?? "",
    email: tenant?.email ?? "",
    room_id: tenant?.room_id ? String(tenant.room_id) : "",
    move_in_date: tenant?.move_in_date ? tenant.move_in_date.slice(0, 10) : new Date().toISOString().slice(0, 10),
  });
  const [vacantRooms, setVacantRooms] = useState<Room[]>([]);

  useEffect(() => {
    fetch("/api/rooms").then((r) => r.json())
      .then((rooms: Room[]) => setVacantRooms(rooms.filter((r) => r.status === "vacant" || r.id === tenant?.room_id)));
  }, [tenant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = { ...form, room_id: form.room_id ? Number(form.room_id) : null };
    await fetch(tenant ? `/api/tenants/${tenant.id}` : "/api/tenants", {
      method: tenant ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    onSave();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-zinc-100">
          <h2 className="text-lg font-semibold text-zinc-900">{tenant ? "แก้ไขข้อมูลผู้เช่า" : "เพิ่มผู้เช่าใหม่"}</h2>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-600 rounded-full hover:bg-zinc-100"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">ชื่อ-นามสกุล</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" placeholder="เช่น สมชาย ใจดี" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">เบอร์โทรศัพท์</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" placeholder="0812345678" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">อีเมล</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" placeholder="email@example.com" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">ห้องพัก</label>
              <select value={form.room_id} onChange={(e) => setForm({ ...form, room_id: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                <option value="">-- ไม่ระบุ --</option>
                {vacantRooms.map((r) => <option key={r.id} value={r.id}>ห้อง {r.number}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">วันที่เข้าพัก</label>
              <input type="date" value={form.move_in_date} onChange={(e) => setForm({ ...form, move_in_date: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-2 border-t border-zinc-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-lg">ยกเลิก</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg">{tenant ? "บันทึก" : "เพิ่มผู้เช่า"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function Tenants() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalTenant, setModalTenant] = useState<Tenant | null>(null);

  const fetchTenants = () => {
    setIsLoading(true);
    fetch("/api/tenants").then((r) => r.json()).then((d) => { setTenants(d); setIsLoading(false); }).catch(() => setIsLoading(false));
  };

  useEffect(() => { fetchTenants(); }, []);

  const handleDelete = async (t: Tenant) => {
    if (!confirm("ยืนยันลบข้อมูล " + t.name + "?")) return;
    await fetch("/api/tenants/" + t.id, { method: "DELETE" });
    fetchTenants();
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return tenants.filter((t) => t.name.toLowerCase().includes(q) || (t.phone ?? "").includes(q) || (t.room_number ?? "").includes(q));
  }, [tenants, search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">ข้อมูลผู้เช่า</h1>
          <p className="text-sm text-zinc-500 mt-1">จัดการข้อมูลผู้เช่าและรายละเอียดการติดต่อ</p>
        </div>
        <button onClick={() => { setModalTenant(null); setShowModal(true); }}
          className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm">
          <Plus className="w-4 h-4 mr-2" />เพิ่มผู้เช่า
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/50">
          <div className="relative w-72">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><Search className="w-4 h-4 text-zinc-400" /></div>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-emerald-500 focus:border-emerald-500 bg-white"
              placeholder="ค้นหาชื่อ, เบอร์โทร, ห้อง..." />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50/50 border-b border-zinc-200">
              <tr>
                <th className="px-6 py-4 font-medium">ชื่อ-นามสกุล</th>
                <th className="px-6 py-4 font-medium">ข้อมูลติดต่อ</th>
                <th className="px-6 py-4 font-medium">ห้องพัก</th>
                <th className="px-6 py-4 font-medium">วันที่เข้าพัก</th>
                <th className="px-6 py-4 font-medium text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-zinc-500">กำลังโหลดข้อมูล...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-zinc-500">ไม่พบข้อมูลผู้เช่า</td></tr>
              ) : (
                filtered.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold">
                          {tenant.name.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-zinc-900 text-base">{tenant.name}</div>
                          <div className="text-zinc-500 text-xs mt-0.5">TEN-{tenant.id.toString().padStart(4, "0")}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center text-zinc-600"><Phone className="w-3.5 h-3.5 mr-2 text-zinc-400" />{tenant.phone || <span className="italic text-zinc-400">ไม่ระบุ</span>}</div>
                        <div className="flex items-center text-zinc-600"><Mail className="w-3.5 h-3.5 mr-2 text-zinc-400" />{tenant.email || <span className="italic text-zinc-400">ไม่ระบุ</span>}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {tenant.room_number
                        ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800 border border-zinc-200">ห้อง {tenant.room_number}</span>
                        : <span className="text-zinc-400 italic">ไม่มีห้อง</span>}
                    </td>
                    <td className="px-6 py-4 text-zinc-600">
                      {tenant.move_in_date ? format(new Date(tenant.move_in_date), "d MMM yyyy", { locale: th }) : "ไม่ระบุ"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => { setModalTenant(tenant); setShowModal(true); }} className="text-zinc-400 hover:text-emerald-600 p-1 transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(tenant)} className="text-zinc-400 hover:text-red-600 p-1 ml-2 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-zinc-200 text-sm text-zinc-500 bg-zinc-50/50">
          <span>แสดง {filtered.length} จาก {tenants.length} รายการ</span>
        </div>
      </div>

      {showModal && <TenantModal tenant={modalTenant} onClose={() => setShowModal(false)} onSave={fetchTenants} />}
    </div>
  );
}
