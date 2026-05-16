"use client"

import { useState } from "react"
import { Topbar } from "@/components/topbar"
import {
  User, Building2, Bell, Shield, PaintBucket,
  Upload, Save, CheckCircle2
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

const TABS = [
  { id: "clinic", label: "Thông tin phòng khám", icon: Building2 },
  { id: "notifications", label: "Thông báo", icon: Bell },
  { id: "security", label: "Bảo mật", icon: Shield },
  { id: "appearance", label: "Giao diện", icon: PaintBucket },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("clinic")
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setIsSaving(true)
    setSaved(false)
    setTimeout(() => {
      setIsSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }, 1000)
  }

  return (
    <>
      <Topbar title="Cài đặt hệ thống" variant="simple" />
      <div className="p-6 lg:p-8 max-w-6xl mx-auto w-full">

        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* ── Left Sidebar: Navigation ── */}
          <div className="w-full md:w-64 shrink-0 flex flex-col gap-1.5">
            {TABS.map((t) => {
              const Icon = t.icon
              const active = activeTab === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all",
                    active
                      ? "bg-primary text-white shadow-md shadow-primary/20"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <Icon className="size-4" />
                  {t.label}
                </button>
              )
            })}
          </div>

          {/* ── Right Content ── */}
          <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8 min-h-[500px]">

            {/* Clinic Tab */}
            {activeTab === "clinic" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Thông tin phòng khám</h2>
                  <p className="text-sm text-slate-500 mt-1">Quản lý địa chỉ, tên hiển thị trên hóa đơn và giờ làm việc.</p>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase">Tên phòng khám</label>
                    <input type="text" defaultValue="Nha khoa Clinical Serenity" className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:bg-white focus:border-primary focus:ring-2 ring-primary/20 outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase">Địa chỉ trụ sở</label>
                    <input type="text" defaultValue="123 Nguyễn Văn Linh, Phường Tân Phú, Quận 7, TP.HCM" className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:bg-white focus:border-primary focus:ring-2 ring-primary/20 outline-none transition-all" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase">Hotline</label>
                      <input type="text" defaultValue="1900 1234" className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:bg-white focus:border-primary focus:ring-2 ring-primary/20 outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase">Mã số thuế</label>
                      <input type="text" defaultValue="0123456789" className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:bg-white focus:border-primary focus:ring-2 ring-primary/20 outline-none transition-all" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Tùy chọn thông báo</h2>
                  <p className="text-sm text-slate-500 mt-1">Quản lý cách bạn nhận thông báo từ hệ thống.</p>
                </div>
                
                <div className="space-y-4">
                  {[
                    { title: "Lịch khám mới", desc: "Nhận email khi có bệnh nhân đặt lịch trực tuyến.", default: true },
                    { title: "Yêu cầu đổi lịch", desc: "Thông báo qua app khi bác sĩ yêu cầu đổi giờ làm.", default: true },
                    { title: "Báo cáo doanh thu", desc: "Nhận email báo cáo tổng kết doanh thu hàng tuần.", default: false },
                    { title: "Thông báo từ hệ thống", desc: "Cập nhật phần mềm, bảo trì server.", default: true },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start justify-between py-3 border-b border-slate-50 last:border-0">
                      <div>
                        <p className="text-sm font-bold text-slate-800">{item.title}</p>
                        <p className="text-xs text-slate-500">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked={item.default} />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state for other tabs */}
            {["security", "appearance"].includes(activeTab) && (
              <div className="h-full flex flex-col items-center justify-center py-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Shield className="size-16 text-slate-200 mb-4" />
                <h2 className="text-lg font-bold text-slate-700">Đang phát triển</h2>
                <p className="text-sm text-slate-500 mt-1">Tính năng này sẽ sớm được ra mắt trong bản cập nhật tới.</p>
              </div>
            )}

            {/* Action Bar */}
            <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
              {saved && (
                <div className="flex items-center gap-1.5 text-emerald-600 mr-2 animate-in fade-in slide-in-from-right-4">
                  <CheckCircle2 className="size-4" />
                  <span className="text-sm font-bold">Đã lưu thay đổi</span>
                </div>
              )}
              <button className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
                Hủy bỏ
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center justify-center min-w-[120px] h-[42px] bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-md shadow-primary/20 disabled:opacity-70"
              >
                {isSaving ? (
                  <svg className="animate-spin size-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                ) : (
                  <>
                    <Save className="size-4 mr-2" />
                    Lưu cài đặt
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
