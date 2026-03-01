import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Mail,
  Phone,
  MoreVertical,
  Edit2,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface Tenant {
  id: number;
  name: string;
  phone: string;
  email: string;
  room_number: string | null;
  move_in_date: string;
}

export function Tenants() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tenants")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch tenants");
        return res.json();
      })
      .then((data) => {
        setTenants(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">
            ข้อมูลผู้เช่า
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            จัดการข้อมูลผู้เช่าและรายละเอียดการติดต่อ
          </p>
        </div>
        <button className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          เพิ่มผู้เช่า
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
              placeholder="ค้นหาชื่อ, เบอร์โทร..."
            />
          </div>
          <select className="text-sm border-zinc-200 rounded-lg text-zinc-600 focus:ring-emerald-500 focus:border-emerald-500 bg-white py-2 pl-3 pr-8">
            <option>สถานะทั้งหมด</option>
            <option>กำลังเช่า</option>
            <option>ย้ายออกแล้ว</option>
          </select>
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
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-zinc-500"
                  >
                    กำลังโหลดข้อมูล...
                  </td>
                </tr>
              ) : tenants.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-zinc-500"
                  >
                    ไม่พบข้อมูลผู้เช่า
                  </td>
                </tr>
              ) : (
                tenants.map((tenant) => (
                  <tr
                    key={tenant.id}
                    className="hover:bg-zinc-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold">
                          {tenant.name.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-zinc-900 text-base">
                            {tenant.name}
                          </div>
                          <div className="text-zinc-500 text-xs mt-0.5">
                            รหัส: TEN-{tenant.id.toString().padStart(4, "0")}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center text-zinc-600">
                          <Phone className="w-3.5 h-3.5 mr-2 text-zinc-400" />
                          {tenant.phone || (
                            <span className="italic text-zinc-400">
                              ไม่ระบุ
                            </span>
                          )}
                        </div>
                        <div className="flex items-center text-zinc-600">
                          <Mail className="w-3.5 h-3.5 mr-2 text-zinc-400" />
                          {tenant.email || (
                            <span className="italic text-zinc-400">
                              ไม่ระบุ
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {tenant.room_number ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800 border border-zinc-200">
                          ห้อง {tenant.room_number}
                        </span>
                      ) : (
                        <span className="text-zinc-400 italic">ไม่มีห้อง</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-zinc-600">
                      {tenant.move_in_date
                        ? format(new Date(tenant.move_in_date), "d MMM yyyy", {
                            locale: th,
                          })
                        : "ไม่ระบุ"}
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
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-zinc-200 flex items-center justify-between text-sm text-zinc-500 bg-zinc-50/50">
          <span>แสดง {tenants.length} รายการ</span>
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
