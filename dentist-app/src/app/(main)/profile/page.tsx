"use client"

import { useState } from "react"
import { Topbar } from "@/components/topbar"
import { Upload, Save, CheckCircle2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const router = useRouter()
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
      <Topbar title="Hồ sơ cá nhân" variant="simple" />
      <div className="p-6 lg:p-10 max-w-4xl mx-auto w-full">
        
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-10">
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold text-slate-900">Thông tin tài khoản</h1>
            <p className="text-slate-500 mt-1">Quản lý thông tin hiển thị và liên hệ của bạn trên hệ thống.</p>
          </div>

          <div className="flex items-center gap-6 pb-8 border-b border-slate-100">
            <Avatar className="size-28 ring-4 ring-slate-50 shadow-sm">
              <AvatarImage src="https://lh3.googleusercontent.com/aida-public/AB6AXuD06D9LAfN9_kgCqwqmM2M_jrRopYohscu3QjLcT8aDD5osXOBEPVDA-17FeegNEQQvwV6iKzKIr2OzVmv9Jo01gOHN5NdFy3luiM5ZVD8QVa6Zi0lDVyziB5D4YW3ldcqbYPiqpLBHsZMDwk6bqZEUXJy6tO89aPrFJrM0mheM3spGN-8jH2H019hJ8ST87MyhP_wMexWO5v-69uqv0MW67PEV5DkbBJv__ZWbJEcwwIoMs1uqE6mnr74yQeITxNNAen20uiluWQ" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div className="space-y-3">
              <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-colors">
                <Upload className="size-4" />
                Tải ảnh mới lên
              </button>
              <p className="text-[11px] text-slate-400 font-medium">Định dạng JPG, GIF hoặc PNG. Dung lượng tối đa 2MB.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-8">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Họ và tên</label>
              <input type="text" defaultValue="Admin Lê Đức Long" className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:bg-white focus:border-primary focus:ring-2 ring-primary/20 outline-none transition-all" />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Vai trò</label>
              <input type="text" defaultValue="Quản trị viên hệ thống" disabled className="w-full h-12 px-4 rounded-xl bg-slate-100 border border-slate-200 text-sm font-medium text-slate-500 cursor-not-allowed" />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Email liên hệ</label>
              <input type="email" defaultValue="admin@clinicserenity.vn" className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:bg-white focus:border-primary focus:ring-2 ring-primary/20 outline-none transition-all" />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Số điện thoại</label>
              <input type="tel" defaultValue="0912 345 678" className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:bg-white focus:border-primary focus:ring-2 ring-primary/20 outline-none transition-all" />
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-end gap-3">
            {saved && (
              <div className="flex items-center gap-1.5 text-emerald-600 mr-3 animate-in fade-in slide-in-from-right-4">
                <CheckCircle2 className="size-5" />
                <span className="text-sm font-bold">Đã lưu thay đổi</span>
              </div>
            )}
            <button 
              onClick={() => router.back()}
              className="px-6 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Hủy bỏ
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center justify-center min-w-[140px] h-[48px] bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {isSaving ? (
                <svg className="animate-spin size-5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
              ) : (
                <>
                  <Save className="size-5 mr-2" />
                  Lưu thay đổi
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </>
  )
}
