import { useState, useEffect } from "react";
import { Users, Home, DollarSign, AlertCircle, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Stats {
  totalRooms: number;
  occupiedRooms: number;
  occupancyRate: number;
  totalTenants: number;
  monthlyRevenue: number;
  pendingInvoices: number;
}

interface RevenuePoint { name: string; revenue: number; }

export function Dashboard() {
  const [stats, setStats] = useState<Stats>({ totalRooms: 0, occupiedRooms: 0, occupancyRate: 0, totalTenants: 0, monthlyRevenue: 0, pendingInvoices: 0 });
  const [chartData, setChartData] = useState<RevenuePoint[]>([]);

  useEffect(() => {
    fetch("/api/stats").then((r) => r.json()).then(setStats).catch(() => {});
    fetch("/api/stats/revenue").then((r) => r.json()).then(setChartData).catch(() => {});
  }, []);

  const statCards = [
    { name: "รายได้รวมเดือนนี้", value: `฿${stats.monthlyRevenue.toLocaleString()}`, icon: DollarSign, change: null, changeType: "positive" },
    { name: "อัตราการเช่า", value: `${stats.occupancyRate}%`, icon: Home, change: `${stats.occupiedRooms}/${stats.totalRooms} ห้อง`, changeType: stats.occupancyRate >= 50 ? "positive" : "negative" },
    { name: "ผู้เช่าปัจจุบัน", value: stats.totalTenants.toString(), icon: Users, change: null, changeType: "positive" },
    { name: "บิลรอชำระ", value: stats.pendingInvoices.toString(), icon: AlertCircle, change: null, changeType: stats.pendingInvoices > 0 ? "negative" : "positive" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">ภาพรวมระบบ</h1>
        <span className="text-sm text-zinc-500">อัปเดตล่าสุด: เมื่อสักครู่</span>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((item) => (
          <div key={item.name} className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <item.icon className="w-5 h-5 text-emerald-600" />
              </div>
              {item.change && (
                <div className={`flex items-center text-sm font-medium ${item.changeType === "positive" ? "text-emerald-600" : "text-red-600"}`}>
                  {item.changeType === "positive" ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                  {item.change}
                </div>
              )}
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-zinc-500">{item.name}</h3>
              <p className="text-3xl font-semibold text-zinc-900 mt-1">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-zinc-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-zinc-900">แนวโน้มรายได้ (6 เดือนล่าสุด)</h2>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 12 }} dx={-10}
                  tickFormatter={(v) => v === 0 ? "฿0" : `฿${v / 1000}k`} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                  formatter={(value: number) => [`฿${value.toLocaleString()}`, "รายได้"]} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6">
          <h2 className="text-lg font-semibold text-zinc-900 mb-6">สรุปสถานะห้องพัก</h2>
          <div className="space-y-4">
            {[
              { label: "ห้องมีผู้เช่า", value: stats.occupiedRooms, total: stats.totalRooms, color: "bg-blue-500" },
              { label: "ห้องว่าง", value: stats.totalRooms - stats.occupiedRooms, total: stats.totalRooms, color: "bg-emerald-500" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-zinc-600">{item.label}</span>
                  <span className="font-medium text-zinc-900">{item.value} / {item.total} ห้อง</span>
                </div>
                <div className="w-full bg-zinc-100 rounded-full h-2">
                  <div className={`${item.color} h-2 rounded-full transition-all`}
                    style={{ width: item.total > 0 ? `${(item.value / item.total) * 100}%` : "0%" }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-100 space-y-3">
            <h3 className="text-sm font-semibold text-zinc-700">ข้อมูลเพิ่มเติม</h3>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">ห้องทั้งหมด</span>
              <span className="font-medium">{stats.totalRooms} ห้อง</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">ผู้เช่าทั้งหมด</span>
              <span className="font-medium">{stats.totalTenants} คน</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">บิลรอชำระ</span>
              <span className={`font-medium ${stats.pendingInvoices > 0 ? "text-amber-600" : "text-emerald-600"}`}>{stats.pendingInvoices} รายการ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
