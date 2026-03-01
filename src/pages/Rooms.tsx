import React from "react";
import { useState, useEffect, useMemo } from "react";
import { Plus, Search, Edit2, Trash2, X, Check } from "lucide-react";
import { cn } from "../lib/utils";

interface Room {
  id: number;
  number: string;
  type: string;
  price: number;
  amenities: string;
  status: "vacant" | "occupied" | "maintenance";
  tenant_name: string | null;
}

const AMENITY_OPTIONS = ["แอร์", "เตียง 5 ฟุต", "เตียง 6 ฟุต", "ตู้เสื้อผ้า", "เครื่องทำน้ำอุ่น", "ทีวี", "ตู้เย็น", "ไมโครเวฟ", "โซฟา", "อินเทอร์เน็ต", "ที่จอดรถ"];

function RoomModal({
  room,
  onClose,
  onSave,
}: {
  room: Room | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [form, setForm] = useState({
    number: room?.number ?? "",
    type: room?.type ?? "Standard",
    price: room?.price ?? 4500,
    status: room?.status ?? "vacant",
    amenities: [] as string[],
  });

  useEffect(() => {
    if (room) {
      try {
        setForm((f) => ({ ...f, amenities: JSON.parse(room.amenities || "[]") }));
      } catch {
        setForm((f) => ({ ...f, amenities: [] }));
      }
    }
  }, [room]);

  const toggleAmenity = (a: string) => {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = { ...form, amenities: JSON.stringify(form.amenities), price: Number(form.price) };
    const url = room ? `/api/rooms/${room.id}` : "/api/rooms";
    const method = room ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    onSave();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-zinc-100">
          <h2 className="text-lg font-semibold text-zinc-900">{room ? "แก้ไขห้องพัก" : "เพิ่มห้องพักใหม่"}</h2>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-600 rounded-full hover:bg-zinc-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">เลขห้อง</label>
              <input
                required
                value={form.number}
                onChange={(e) => setForm({ ...form, number: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
                placeholder="เช่น 101"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">ประเภท</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option>Standard</option>
                <option>Deluxe</option>
                <option>Suite</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">ราคา/เดือน (฿)</label>
              <input
                required
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">สถานะ</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as Room["status"] })}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="vacant">ว่าง</option>
                <option value="occupied">มีผู้เช่า</option>
                <option value="maintenance">ซ่อมบำรุง</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">สิ่งอำนวยความสะดวก</label>
            <div className="flex flex-wrap gap-2">
              {AMENITY_OPTIONS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAmenity(a)}
                  className={cn(
                    "px-3 py-1 text-xs rounded-full border transition-colors",
                    form.amenities.includes(a)
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-zinc-600 border-zinc-200 hover:border-emerald-400"
                  )}
                >
                  {form.amenities.includes(a) && <Check className="w-3 h-3 inline mr-1" />}
                  {a}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-2 border-t border-zinc-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors">
              ยกเลิก
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors">
              {room ? "บันทึกการแก้ไข" : "เพิ่มห้องพัก"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function Rooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ทั้งหมด");
  const [filterType, setFilterType] = useState("ทั้งหมด");
  const [modalRoom, setModalRoom] = useState<Room | null | "new">(undefined as any);
  const [showModal, setShowModal] = useState(false);

  const fetchRooms = () => {
    setIsLoading(true);
    fetch("/api/rooms")
      .then((r) => r.json())
      .then((data) => { setRooms(data); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  };

  useEffect(() => { fetchRooms(); }, []);

  const handleDelete = async (room: Room) => {
    if (!confirm(`ยืนยันลบห้อง ${room.number}?`)) return;
    await fetch(`/api/rooms/${room.id}`, { method: "DELETE" });
    fetchRooms();
  };

  const filtered = useMemo(() => {
    return rooms.filter((r) => {
      const matchSearch = r.number.includes(search) || (r.tenant_name ?? "").includes(search);
      const matchStatus = filterStatus === "ทั้งหมด" || r.status === { "ว่าง": "vacant", "มีผู้เช่า": "occupied", "ซ่อมบำรุง": "maintenance" }[filterStatus];
      const matchType = filterType === "ทั้งหมด" || r.type === filterType;
      return matchSearch && matchStatus && matchType;
    });
  }, [rooms, search, filterStatus, filterType]);

  const getStatusColor = (status: string) => {
    if (status === "vacant") return "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (status === "occupied") return "bg-blue-100 text-blue-800 border-blue-200";
    return "bg-amber-100 text-amber-800 border-amber-200";
  };

  const getStatusText = (status: string) => {
    if (status === "vacant") return "ว่าง";
    if (status === "occupied") return "มีผู้เช่า";
    return "ซ่อมบำรุง";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">จัดการห้องพัก</h1>
          <p className="text-sm text-zinc-500 mt-1">จัดการข้อมูลห้องพัก สถานะ และสิ่งอำนวยความสะดวก</p>
        </div>
        <button
          onClick={() => { setModalRoom(null); setShowModal(true); }}
          className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          เพิ่มห้องพัก
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/50">
          <div className="relative w-72">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-zinc-400" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-emerald-500 focus:border-emerald-500 bg-white"
              placeholder="ค้นหาเลขห้อง, ผู้เช่า..."
            />
          </div>
          <div className="flex space-x-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-sm border border-zinc-200 rounded-lg text-zinc-600 focus:ring-emerald-500 focus:border-emerald-500 bg-white py-2 pl-3 pr-8"
            >
              <option>ทั้งหมด</option>
              <option>ว่าง</option>
              <option>มีผู้เช่า</option>
              <option>ซ่อมบำรุง</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-sm border border-zinc-200 rounded-lg text-zinc-600 focus:ring-emerald-500 focus:border-emerald-500 bg-white py-2 pl-3 pr-8"
            >
              <option>ทั้งหมด</option>
              <option>Standard</option>
              <option>Deluxe</option>
              <option>Suite</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50/50 border-b border-zinc-200">
              <tr>
                <th className="px-6 py-4 font-medium">เลขห้อง</th>
                <th className="px-6 py-4 font-medium">ประเภท / ราคา</th>
                <th className="px-6 py-4 font-medium">สิ่งอำนวยความสะดวก</th>
                <th className="px-6 py-4 font-medium">สถานะ</th>
                <th className="px-6 py-4 font-medium">ผู้เช่าปัจจุบัน</th>
                <th className="px-6 py-4 font-medium text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-zinc-500">กำลังโหลดข้อมูล...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-zinc-500">ไม่พบข้อมูลห้องพัก</td></tr>
              ) : (
                filtered.map((room) => {
                  let amenitiesList: string[] = [];
                  try { amenitiesList = JSON.parse(room.amenities || "[]"); } catch { /* skip */ }
                  return (
                    <tr key={room.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-zinc-900 text-base">{room.number}</td>
                      <td className="px-6 py-4">
                        <div className="text-zinc-900 font-medium">{room.type}</div>
                        <div className="text-zinc-500 text-xs mt-0.5 font-mono">฿{room.price.toLocaleString()}/เดือน</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {amenitiesList.slice(0, 3).map((item, i) => (
                            <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 text-zinc-600 border border-zinc-200">{item}</span>
                          ))}
                          {amenitiesList.length > 3 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 text-zinc-600 border border-zinc-200">+{amenitiesList.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn("px-2.5 py-1 text-xs font-medium rounded-full border", getStatusColor(room.status))}>
                          {getStatusText(room.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-600">
                        {room.tenant_name || <span className="text-zinc-400 italic">ไม่มีผู้เช่า</span>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => { setModalRoom(room); setShowModal(true); }}
                          className="text-zinc-400 hover:text-emerald-600 p-1 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(room)}
                          className="text-zinc-400 hover:text-red-600 p-1 ml-2 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-zinc-200 flex items-center justify-between text-sm text-zinc-500 bg-zinc-50/50">
          <span>แสดง {filtered.length} จาก {rooms.length} ห้อง</span>
        </div>
      </div>

      {showModal && (
        <RoomModal
          room={modalRoom as Room | null}
          onClose={() => setShowModal(false)}
          onSave={fetchRooms}
        />
      )}
    </div>
  );
}
