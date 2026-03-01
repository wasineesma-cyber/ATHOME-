import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  Wifi,
  Tv,
  Wind,
  Coffee,
} from "lucide-react";
import { cn } from "../components/Layout";

interface Room {
  id: number;
  number: string;
  type: string;
  price: number;
  amenities: string;
  status: "vacant" | "occupied" | "maintenance";
  tenant_name: string | null;
}

export function Rooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/rooms")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch rooms");
        return res.json();
      })
      .then((data) => {
        setRooms(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "vacant":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "occupied":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "maintenance":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-zinc-100 text-zinc-800 border-zinc-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "vacant":
        return "ว่าง";
      case "occupied":
        return "มีผู้เช่า";
      case "maintenance":
        return "ซ่อมบำรุง";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">
            จัดการห้องพัก
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            จัดการข้อมูลห้องพัก สถานะ และสิ่งอำนวยความสะดวก
          </p>
        </div>
        <button className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm">
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
              className="block w-full pl-10 pr-3 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-emerald-500 focus:border-emerald-500 bg-white"
              placeholder="ค้นหาห้องพัก..."
            />
          </div>
          <div className="flex space-x-2">
            <select className="text-sm border-zinc-200 rounded-lg text-zinc-600 focus:ring-emerald-500 focus:border-emerald-500 bg-white py-2 pl-3 pr-8">
              <option>สถานะทั้งหมด</option>
              <option>ว่าง</option>
              <option>มีผู้เช่า</option>
              <option>ซ่อมบำรุง</option>
            </select>
            <select className="text-sm border-zinc-200 rounded-lg text-zinc-600 focus:ring-emerald-500 focus:border-emerald-500 bg-white py-2 pl-3 pr-8">
              <option>ประเภททั้งหมด</option>
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
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-zinc-500"
                  >
                    กำลังโหลดข้อมูล...
                  </td>
                </tr>
              ) : rooms.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-zinc-500"
                  >
                    ไม่พบข้อมูลห้องพัก
                  </td>
                </tr>
              ) : (
                rooms.map((room) => {
                  let amenitiesList: string[] = [];
                  try {
                    amenitiesList = JSON.parse(room.amenities || "[]");
                  } catch (e) {
                    // ignore
                  }

                  return (
                    <tr
                      key={room.id}
                      className="hover:bg-zinc-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-zinc-900 text-base">
                        {room.number}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-zinc-900 font-medium">
                          {room.type}
                        </div>
                        <div className="text-zinc-500 text-xs mt-0.5 font-mono">
                          ฿{room.price.toLocaleString()}/เดือน
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {amenitiesList.slice(0, 3).map((item, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 text-zinc-600 border border-zinc-200"
                            >
                              {item}
                            </span>
                          ))}
                          {amenitiesList.length > 3 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 text-zinc-600 border border-zinc-200">
                              +{amenitiesList.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "px-2.5 py-1 text-xs font-medium rounded-full border",
                            getStatusColor(room.status),
                          )}
                        >
                          {getStatusText(room.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-600">
                        {room.tenant_name || (
                          <span className="text-zinc-400 italic">
                            ไม่มีผู้เช่า
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-zinc-400 hover:text-emerald-600 p-1 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="text-zinc-400 hover:text-red-600 p-1 ml-2 transition-colors">
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
          <span>แสดง {rooms.length} ห้อง</span>
          <div className="flex space-x-1">
            <button className="px-3 py-1 border border-zinc-200 rounded bg-white hover:bg-zinc-50 disabled:opacity-50">
              ก่อนหน้า
            </button>
            <button className="px-3 py-1 border border-zinc-200 rounded bg-white hover:bg-zinc-50 disabled:opacity-50">
              ถัดไป
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
