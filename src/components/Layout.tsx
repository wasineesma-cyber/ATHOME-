import { ReactNode } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import {
  LayoutDashboard,
  Home,
  Users,
  FileText,
  Settings,
  Bell,
  Search,
  Package,
  LogOut,
} from "lucide-react";
import { cn } from "../lib/utils";

function Sidebar() {
  const location = useLocation();

  const navigation = [
    { name: "ภาพรวม", href: "/", icon: LayoutDashboard },
    { name: "ห้องพัก", href: "/rooms", icon: Home },
    { name: "ผู้เช่า", href: "/tenants", icon: Users },
    { name: "บิลค่าเช่า", href: "/invoices", icon: FileText },
    { name: "พัสดุ", href: "/parcels", icon: Package },
    { name: "ตั้งค่า", href: "/settings", icon: Settings },
  ];

  const handleLogout = () => {
    // Force reload to clear state (since we use simple state for auth)
    window.location.href = "/login";
  };

  return (
    <div className="flex flex-col w-64 bg-zinc-950 text-zinc-300 border-r border-zinc-800 h-screen">
      <div className="flex items-center h-16 px-6 bg-zinc-950 border-b border-zinc-800">
        <Home className="w-6 h-6 text-emerald-500 mr-3" />
        <span className="text-lg font-semibold text-white tracking-tight">
          AT HOME เทพมิตร
        </span>
      </div>
      <div className="flex-1 py-6 overflow-y-auto">
        <nav className="px-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  isActive
                    ? "bg-zinc-800 text-white"
                    : "hover:bg-zinc-800/50 hover:text-white",
                  "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                )}
              >
                <item.icon
                  className={cn(
                    isActive
                      ? "text-emerald-500"
                      : "text-zinc-500 group-hover:text-zinc-300",
                    "flex-shrink-0 w-5 h-5 mr-3 transition-colors",
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-sm font-medium text-white">
              AT
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">ผู้ดูแลระบบ</p>
              <p className="text-xs text-zinc-500">AT HOME เทพมิตร</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
            title="ออกจากระบบ"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="bg-white border-b border-zinc-200 h-16 flex items-center justify-between px-8">
      <div className="flex items-center flex-1">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-zinc-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-zinc-200 rounded-lg leading-5 bg-zinc-50 placeholder-zinc-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors"
            placeholder="ค้นหาห้องพัก, ผู้เช่า, บิล..."
          />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <button className="p-2 text-zinc-400 hover:text-zinc-500 relative">
          <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          <Bell className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-zinc-50 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
