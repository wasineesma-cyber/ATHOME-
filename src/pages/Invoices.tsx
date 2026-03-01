import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  FileText,
  Download,
  CheckCircle,
  AlertCircle,
  Clock,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { cn } from "../lib/utils";
import { QRCodeSVG } from "qrcode.react";
import generatePayload from "promptpay-qr";

interface Invoice {
  id: number;
  tenant_name: string;
  room_number: string;
  month: number;
  year: number;
  rent_amount: number;
  water_amount: number;
  electricity_amount: number;
  total: number;
  status: "paid" | "unpaid" | "overdue";
  created_at: string;
}

export function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const fetchInvoices = () => {
    fetch("/api/invoices")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch invoices");
        return res.json();
      })
      .then((data) => {
        setInvoices(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleMarkPaid = (id: number) => {
    fetch(`/api/invoices/${id}/pay`, { method: "PUT" })
      .then((res) => res.json())
      .then(() => {
        fetchInvoices();
      });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-3 h-3 mr-1" /> ชำระแล้ว
          </span>
        );
      case "unpaid":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 mr-1" /> รอชำระ
          </span>
        );
      case "overdue":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
            <AlertCircle className="w-3 h-3 mr-1" /> เกินกำหนด
          </span>
        );
      default:
        return null;
    }
  };

  const getMonthName = (monthNumber: number) => {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString("th-TH", { month: "long" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">
            ระบบบิลค่าเช่า
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            จัดการบิลค่าเช่า ค่าน้ำ ค่าไฟ และติดตามการชำระเงิน
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors shadow-sm">
            <Download className="w-4 h-4 mr-2" />
            ส่งออกข้อมูล
          </button>
          <button className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            สร้างบิลใหม่
          </button>
        </div>
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
              placeholder="ค้นหาบิล..."
            />
          </div>
          <div className="flex space-x-2">
            <select className="text-sm border-zinc-200 rounded-lg text-zinc-600 focus:ring-emerald-500 focus:border-emerald-500 bg-white py-2 pl-3 pr-8">
              <option>สถานะทั้งหมด</option>
              <option>ชำระแล้ว</option>
              <option>รอชำระ</option>
              <option>เกินกำหนด</option>
            </select>
            <select className="text-sm border-zinc-200 rounded-lg text-zinc-600 focus:ring-emerald-500 focus:border-emerald-500 bg-white py-2 pl-3 pr-8">
              <option>เดือนนี้</option>
              <option>เดือนที่แล้ว</option>
              <option>3 เดือนล่าสุด</option>
              <option>ทั้งหมด</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50/50 border-b border-zinc-200">
              <tr>
                <th className="px-6 py-4 font-medium">รหัสบิล</th>
                <th className="px-6 py-4 font-medium">ผู้เช่า / ห้อง</th>
                <th className="px-6 py-4 font-medium">รอบบิล</th>
                <th className="px-6 py-4 font-medium">ยอดรวม</th>
                <th className="px-6 py-4 font-medium">สถานะ</th>
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
              ) : invoices.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-zinc-500"
                  >
                    ไม่พบบิลค่าเช่า
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="hover:bg-zinc-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center font-medium text-zinc-900">
                        <FileText className="w-4 h-4 text-zinc-400 mr-2" />
                        INV-{invoice.year}-
                        {invoice.month.toString().padStart(2, "0")}-
                        {invoice.id.toString().padStart(3, "0")}
                      </div>
                      <div className="text-xs text-zinc-500 mt-1 ml-6">
                        ออกเมื่อ:{" "}
                        {format(new Date(invoice.created_at), "d MMM yyyy", {
                          locale: th,
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-zinc-900">
                        {invoice.tenant_name}
                      </div>
                      <div className="text-zinc-500 text-xs mt-0.5">
                        ห้อง {invoice.room_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-600">
                      {getMonthName(invoice.month)} {invoice.year}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono font-medium text-zinc-900">
                        ฿{invoice.total.toLocaleString()}
                      </div>
                      <div className="text-xs text-zinc-500 mt-0.5">
                        ค่าเช่า: ฿{invoice.rent_amount} | น้ำไฟ: ฿
                        {invoice.water_amount + invoice.electricity_amount}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(invoice.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {invoice.status === "unpaid" && (
                        <button
                          onClick={() => handleMarkPaid(invoice.id)}
                          className="text-xs font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-md transition-colors mr-2"
                        >
                          รับชำระแล้ว
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedInvoice(invoice)}
                        className="text-zinc-400 hover:text-zinc-600 p-1 transition-colors"
                        title="ดูบิลและ QR Code"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-zinc-200 flex items-center justify-between text-sm text-zinc-500 bg-zinc-50/50">
          <span>แสดง {invoices.length} รายการ</span>
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

      {/* Invoice Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-zinc-100">
              <h2 className="text-lg font-semibold text-zinc-900">
                รายละเอียดบิล
              </h2>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-1 text-zinc-400 hover:text-zinc-600 rounded-full hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-zinc-900">
                  บิลประจำเดือน {getMonthName(selectedInvoice.month)}{" "}
                  {selectedInvoice.year}
                </h3>
                <p className="text-zinc-500 mt-1">
                  ห้อง {selectedInvoice.room_number} -{" "}
                  {selectedInvoice.tenant_name}
                </p>
              </div>

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

              {selectedInvoice.status === "unpaid" ? (
                <div className="bg-zinc-50 rounded-xl p-6 flex flex-col items-center justify-center border border-zinc-100">
                  <p className="text-sm font-medium text-zinc-600 mb-4">
                    สแกนเพื่อชำระเงิน (พร้อมเพย์)
                  </p>
                  <div className="bg-white p-3 rounded-xl shadow-sm border border-zinc-100">
                    <QRCodeSVG
                      value={generatePayload("0812345678", {
                        amount: selectedInvoice.total,
                      })}
                      size={200}
                    />
                  </div>
                  <p className="text-xs text-zinc-400 mt-4 text-center">
                    ชื่อบัญชี: หอพัก DormManager
                    <br />
                    พร้อมเพย์: 081-234-5678
                  </p>
                </div>
              ) : (
                <div className="bg-emerald-50 rounded-xl p-6 flex flex-col items-center justify-center border border-emerald-100 text-emerald-600">
                  <CheckCircle className="w-12 h-12 mb-2" />
                  <p className="font-medium">ชำระเงินเรียบร้อยแล้ว</p>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-zinc-100 bg-zinc-50 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-200 bg-zinc-100 rounded-lg transition-colors"
              >
                ปิด
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center">
                <Download className="w-4 h-4 mr-2" />
                ดาวน์โหลด PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
