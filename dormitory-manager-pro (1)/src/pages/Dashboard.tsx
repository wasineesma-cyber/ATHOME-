import { useState, useEffect } from "react";
import {
  Users,
  Home,
  DollarSign,
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "ม.ค.", revenue: 40000 },
  { name: "ก.พ.", revenue: 45000 },
  { name: "มี.ค.", revenue: 42000 },
  { name: "เม.ย.", revenue: 50000 },
  { name: "พ.ค.", revenue: 55000 },
  { name: "มิ.ย.", revenue: 58000 },
];

export function Dashboard() {
  const [stats, setStats] = useState({
    totalRooms: 0,
    occupiedRooms: 0,
    occupancyRate: 0,
    totalTenants: 0,
    monthlyRevenue: 0,
    pendingInvoices: 0,
  });

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch stats");
        return res.json();
      })
      .then((data) => setStats(data))
      .catch((err) => console.error(err));
  }, []);

  const statCards = [
    {
      name: "รายได้รวมเดือนนี้",
      value: `฿${stats.monthlyRevenue.toLocaleString()}`,
      icon: DollarSign,
      change: "+4.75%",
      changeType: "positive",
    },
    {
      name: "อัตราการเช่า",
      value: `${stats.occupancyRate}%`,
      icon: Home,
      change: "+1.02%",
      changeType: "positive",
    },
    {
      name: "ผู้เช่าปัจจุบัน",
      value: stats.totalTenants.toString(),
      icon: Users,
      change: "+2",
      changeType: "positive",
    },
    {
      name: "บิลรอชำระ",
      value: stats.pendingInvoices.toString(),
      icon: AlertCircle,
      change: "-1",
      changeType: "negative",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">
          ภาพรวมระบบ
        </h1>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-zinc-500">
            อัปเดตล่าสุด: เมื่อสักครู่
          </span>
          <button className="px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors">
            ดาวน์โหลดรายงาน
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((item) => (
          <div
            key={item.name}
            className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <item.icon className="w-5 h-5 text-emerald-600" />
              </div>
              <div
                className={`flex items-center text-sm font-medium ${
                  item.changeType === "positive"
                    ? "text-emerald-600"
                    : "text-red-600"
                }`}
              >
                {item.changeType === "positive" ? (
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 mr-1" />
                )}
                {item.change}
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-zinc-500">{item.name}</h3>
              <p className="text-3xl font-semibold text-zinc-900 mt-1">
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-zinc-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-zinc-900">
              แนวโน้มรายได้
            </h2>
            <select className="text-sm border-zinc-200 rounded-lg text-zinc-600 focus:ring-emerald-500 focus:border-emerald-500">
              <option>6 เดือนล่าสุด</option>
              <option>ปีนี้</option>
            </select>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e4e4e7"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#71717a", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#71717a", fontSize: 12 }}
                  dx={-10}
                  tickFormatter={(value) => `฿${value / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  formatter={(value: number) => [
                    `฿${value.toLocaleString()}`,
                    "รายได้",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6">
          <h2 className="text-lg font-semibold text-zinc-900 mb-6">
            กิจกรรมล่าสุด
          </h2>
          <div className="space-y-6">
            {[
              {
                title: "ผู้เช่าใหม่ย้ายเข้า",
                desc: "ห้อง 102 - สมชาย",
                time: "2 ชั่วโมงที่แล้ว",
                icon: Users,
                color: "text-blue-500",
                bg: "bg-blue-50",
              },
              {
                title: "ชำระบิลแล้ว",
                desc: "ห้อง 201 - ฿6,750",
                time: "5 ชั่วโมงที่แล้ว",
                icon: DollarSign,
                color: "text-emerald-500",
                bg: "bg-emerald-50",
              },
              {
                title: "แจ้งซ่อม",
                desc: "ห้อง 203 - แอร์ไม่เย็น",
                time: "1 วันที่แล้ว",
                icon: AlertCircle,
                color: "text-amber-500",
                bg: "bg-amber-50",
              },
              {
                title: "ห้องว่าง",
                desc: "ห้อง 105 ย้ายออกแล้ว",
                time: "2 วันที่แล้ว",
                icon: Home,
                color: "text-purple-500",
                bg: "bg-purple-50",
              },
            ].map((item, i) => (
              <div key={i} className="flex">
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full ${item.bg} flex items-center justify-center mr-4`}
                >
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-900">
                    {item.title}
                  </p>
                  <p className="text-sm text-zinc-500">{item.desc}</p>
                  <p className="text-xs text-zinc-400 mt-1">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
            ดูกิจกรรมทั้งหมด &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
