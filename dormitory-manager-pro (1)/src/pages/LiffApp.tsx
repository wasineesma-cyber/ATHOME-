import { useState, useEffect } from "react";
import { Package, FileText, ChevronRight, Home, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { QRCodeSVG } from "qrcode.react";
import generatePayload from "promptpay-qr";
import liff from "@line/liff";

export function LiffApp() {
  const [activeTab, setActiveTab] = useState<"parcels" | "invoices">("parcels");
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isLiffLoading, setIsLiffLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  // Mock data for tenant (In real app, get from LINE Profile -> Database)
  const [tenantInfo, setTenantInfo] = useState({
    name: "กำลังโหลด...",
    room: "101", // Fallback room for demonstration
  });

  const [parcels, setParcels] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    const initLiff = async () => {
      try {
        // Use a fallback LIFF ID for preview if not set in env
        const liffId = import.meta.env.VITE_LIFF_ID || "YOUR_LIFF_ID";
        
        // Only init if we have a valid-looking ID, otherwise skip to mock
        if (liffId !== "YOUR_LIFF_ID") {
          await liff.init({ liffId });
          if (liff.isLoggedIn()) {
            const userProfile = await liff.getProfile();
            setProfile(userProfile);
            setTenantInfo(prev => ({ ...prev, name: userProfile.displayName }));
          } else {
            // For real app: liff.login();
            // For preview: just use mock
            setTenantInfo({ name: "สมชาย ใจดี", room: "101" });
          }
        } else {
          // Mock for preview without LIFF ID
          setTenantInfo({ name: "สมชาย ใจดี (Mock)", room: "101" });
        }
      } catch (err) {
        console.error("LIFF init failed", err);
        setTenantInfo({ name: "สมชาย ใจดี (Mock)", room: "101" });
      } finally {
        setIsLiffLoading(false);
      }
    };

    initLiff();
  }, []);

  useEffect(() => {
    if (isLiffLoading) return;

    // Fetch parcels
    fetch("/api/parcels")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch parcels");
        return res.json();
      })
      .then((data) => {
        // Filter only for this tenant's room
        setParcels(data.filter((p: any) => p.room_number === tenantInfo.room));
      })
      .catch(err => console.error(err));

    // Fetch invoices
    fetch("/api/invoices")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch invoices");
        return res.json();
      })
      .then((data) => {
        // Filter only for this tenant's room
        setInvoices(data.filter((i: any) => i.room_number === tenantInfo.room));
      })
      .catch(err => console.error(err));
  }, [isLiffLoading, tenantInfo.room]);

  const getMonthName = (monthNumber: number) => {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString("th-TH", { month: "long" });
  };

  if (isLiffLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center font-sans">
        <Loader2 className="w-8 h-8 text-zinc-400 animate-spin mb-4" />
        <p className="text-zinc-500">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  if (selectedInvoice) {
    const promptpayId = "0812345678"; // Replace with actual PromptPay ID
    const amount = selectedInvoice.total;
    const payload = generatePayload(promptpayId, { amount });

    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
        <div className="bg-white p-4 border-b border-zinc-200 flex items-center sticky top-0 z-10">
          <button
            onClick={() => setSelectedInvoice(null)}
            className="text-zinc-500 mr-4"
          >
            &larr; กลับ
          </button>
          <h1 className="text-lg font-semibold text-zinc-900">
            ชำระบิลค่าเช่า
          </h1>
        </div>

        <div className="p-4 flex-1 flex flex-col items-center">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
            <div className="bg-zinc-900 p-6 text-center text-white">
              <h2 className="text-xl font-bold">
                บิลประจำเดือน {getMonthName(selectedInvoice.month)}
              </h2>
              <p className="text-zinc-400 mt-1">
                ห้อง {selectedInvoice.room_number}
              </p>
            </div>

            <div className="p-6">
              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">ค่าเช่าห้อง</span>
                  <span className="font-medium text-zinc-900">
                    ฿{selectedInvoice.rent_amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">ค่าน้ำประปา</span>
                  <span className="font-medium text-zinc-900">
                    ฿{selectedInvoice.water_amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">ค่าไฟฟ้า</span>
                  <span className="font-medium text-zinc-900">
                    ฿{selectedInvoice.electricity_amount.toLocaleString()}
                  </span>
                </div>
                <div className="pt-3 border-t border-zinc-100 flex justify-between text-lg font-bold">
                  <span className="text-zinc-900">ยอดรวมทั้งสิ้น</span>
                  <span className="text-emerald-600">
                    ฿{selectedInvoice.total.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="bg-zinc-50 rounded-xl p-6 flex flex-col items-center justify-center border border-zinc-100">
                <p className="text-sm font-medium text-zinc-600 mb-4">
                  สแกนเพื่อชำระเงิน (พร้อมเพย์)
                </p>
                <div className="bg-white p-3 rounded-xl shadow-sm border border-zinc-100">
                  <QRCodeSVG value={payload} size={200} />
                </div>
                <p className="text-xs text-zinc-400 mt-4 text-center">
                  ชื่อบัญชี: หอพัก AT HOME เทพมิตร
                  <br />
                  พร้อมเพย์: {promptpayId}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
      {/* Header */}
      <div className="bg-zinc-900 text-white p-6 pb-8 rounded-b-3xl shadow-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            {profile?.pictureUrl ? (
              <img 
                src={profile.pictureUrl} 
                alt="Profile" 
                className="w-12 h-12 rounded-full border-2 border-zinc-700 object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-xl font-bold border-2 border-zinc-700">
                {tenantInfo.name.charAt(0)}
              </div>
            )}
            <div className="ml-4">
              <h1 className="text-lg font-semibold">{tenantInfo.name}</h1>
              <p className="text-zinc-400 text-sm flex items-center mt-0.5">
                <Home className="w-3.5 h-3.5 mr-1" /> ห้อง {tenantInfo.room}
              </p>
            </div>
          </div>
        </div>
        
        <div className="mb-6 text-center">
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-widest">
            AT HOME เทพมิตร
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex bg-zinc-800/50 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("parcels")}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeTab === "parcels" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400"}`}
          >
            พัสดุของฉัน
          </button>
          <button
            onClick={() => setActiveTab("invoices")}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeTab === "invoices" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400"}`}
          >
            บิลค่าเช่า
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {activeTab === "parcels" && (
          <div className="space-y-3">
            {parcels.length === 0 ? (
              <div className="text-center py-10 text-zinc-500">
                ไม่มีพัสดุในขณะนี้
              </div>
            ) : (
              parcels.map((parcel) => (
                <div
                  key={parcel.id}
                  className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-100 flex items-start"
                >
                  <div
                    className={`p-3 rounded-xl mr-4 ${parcel.status === "pending" ? "bg-amber-50 text-amber-600" : "bg-zinc-50 text-zinc-400"}`}
                  >
                    <Package className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-zinc-900">
                        {parcel.courier}
                      </h3>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${parcel.status === "pending" ? "bg-amber-100 text-amber-800" : "bg-zinc-100 text-zinc-600"}`}
                      >
                        {parcel.status === "pending" ? "รอรับ" : "รับแล้ว"}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-500 mt-1">
                      เลขพัสดุ: {parcel.tracking_number}
                    </p>
                    <p className="text-xs text-zinc-400 mt-2">
                      รับเข้า:{" "}
                      {format(
                        new Date(parcel.received_date),
                        "d MMM yyyy HH:mm",
                        { locale: th },
                      )}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "invoices" && (
          <div className="space-y-3">
            {invoices.length === 0 ? (
              <div className="text-center py-10 text-zinc-500">
                ไม่มีบิลค่าเช่า
              </div>
            ) : (
              invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  onClick={() =>
                    invoice.status === "unpaid" && setSelectedInvoice(invoice)
                  }
                  className={`bg-white p-4 rounded-2xl shadow-sm border border-zinc-100 flex items-center ${invoice.status === "unpaid" ? "cursor-pointer hover:border-emerald-200" : "opacity-75"}`}
                >
                  <div
                    className={`p-3 rounded-xl mr-4 ${invoice.status === "unpaid" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}
                  >
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-zinc-900">
                      บิลเดือน {getMonthName(invoice.month)}
                    </h3>
                    <p className="text-sm font-medium text-zinc-900 mt-1">
                      ฿{invoice.total.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full mb-2 ${invoice.status === "unpaid" ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800"}`}
                    >
                      {invoice.status === "unpaid" ? "รอชำระ" : "ชำระแล้ว"}
                    </span>
                    {invoice.status === "unpaid" && (
                      <ChevronRight className="w-4 h-4 text-zinc-400" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
