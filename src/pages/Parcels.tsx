import { useState, useEffect } from "react";
import { Plus, Search, Package, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface Parcel {
  id: number;
  room_number: string;
  tenant_name: string | null;
  tracking_number: string;
  courier: string;
  description: string;
  status: "pending" | "picked_up";
  received_date: string;
  picked_up_date: string | null;
}

export function Parcels() {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchParcels = () => {
    fetch("/api/parcels")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch parcels");
        return res.json();
      })
      .then((data) => {
        setParcels(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchParcels();
  }, []);

  const handlePickup = (id: number) => {
    fetch(`/api/parcels/${id}/pickup`, { method: "PUT" })
      .then((res) => res.json())
      .then(() => {
        fetchParcels();
      });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "picked_up":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-3 h-3 mr-1" /> รับแล้ว
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 mr-1" /> รอรับ
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">
            ระบบจัดการพัสดุ
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            บันทึกและติดตามพัสดุของผู้เช่า
          </p>
        </div>
        <button className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          เพิ่มพัสดุ
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
              placeholder="ค้นหาเลขพัสดุ, ห้องพัก..."
            />
          </div>
          <select className="text-sm border-zinc-200 rounded-lg text-zinc-600 focus:ring-emerald-500 focus:border-emerald-500 bg-white py-2 pl-3 pr-8">
            <option>สถานะทั้งหมด</option>
            <option>รอรับ</option>
            <option>รับแล้ว</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50/50 border-b border-zinc-200">
              <tr>
                <th className="px-6 py-4 font-medium">ห้อง / ผู้รับ</th>
                <th className="px-6 py-4 font-medium">ข้อมูลพัสดุ</th>
                <th className="px-6 py-4 font-medium">วันที่รับเข้า</th>
                <th className="px-6 py-4 font-medium">สถานะ</th>
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
              ) : parcels.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-zinc-500"
                  >
                    ไม่พบข้อมูลพัสดุ
                  </td>
                </tr>
              ) : (
                parcels.map((parcel) => (
                  <tr
                    key={parcel.id}
                    className="hover:bg-zinc-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-zinc-900 text-base">
                        ห้อง {parcel.room_number}
                      </div>
                      <div className="text-zinc-500 text-xs mt-0.5">
                        {parcel.tenant_name || "ไม่ระบุชื่อ"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center font-medium text-zinc-900">
                        <Package className="w-4 h-4 text-zinc-400 mr-2" />
                        {parcel.tracking_number}
                      </div>
                      <div className="text-xs text-zinc-500 mt-1 ml-6">
                        {parcel.courier} - {parcel.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-600">
                      {format(
                        new Date(parcel.received_date),
                        "d MMM yyyy HH:mm",
                        { locale: th },
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(parcel.status)}
                      {parcel.status === "picked_up" &&
                        parcel.picked_up_date && (
                          <div className="text-xs text-zinc-400 mt-1">
                            รับเมื่อ:{" "}
                            {format(
                              new Date(parcel.picked_up_date),
                              "d MMM HH:mm",
                              { locale: th },
                            )}
                          </div>
                        )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {parcel.status === "pending" && (
                        <button
                          onClick={() => handlePickup(parcel.id)}
                          className="text-xs font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-md transition-colors"
                        >
                          กดรับพัสดุ
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
