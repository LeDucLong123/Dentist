"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import {
  Plus,
  Users,
  UserCheck,
  UserX,
  Shield,
  Mail,
  Edit2,
  Lock,
  LockOpen,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  History,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Topbar } from "@/components/topbar"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type UserRole = "all" | "Bệnh nhân" | "Bác sĩ" | "Quản trị" | "Lễ tân"
type UserStatus = "active" | "locked"

export interface User {
  id: string
  name: string
  email: string
  role: string
  status: UserStatus
  avatar: string
  lastActive: string
  joinDate: string
}

export const initialUsers: User[] = [
  {
    id: "1",
    name: "BS. Julian Pierce",
    email: "julian.p@clinicalserenity.com",
    role: "Bác sĩ",
    status: "active",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBaEJO3iKuJ7JnTkIuTLS_KwpMjJR9h9JMsrffZhPRvn3TCc2uV2IF8v4YhGVA8Q4F3sSMNpBUI5R-MQRDhzjCHN_KZM0taeXYtFVa-P7B6SER39KefixVwoknJI4fiAp19DWdlUdjiRpKkR3TaybFxI4SjJ9Z-Hb9U_5SBNhscQRiANZrZ_MlXkTyf82Xsd8Dmb7Nzp5DOyG3ScooKuWSerTJQOnrlqu6S67VZLziuqymxzHMRyTbYzvhI9kC3lh02ztT19kO_jg",
    lastActive: "Hôm nay, 08:30",
    joinDate: "12 Th04, 2023",
  },
  {
    id: "2",
    name: "Sarah Jenkins",
    email: "s.jenkins@patientcare.com",
    role: "Bệnh nhân",
    status: "active",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDl2bFxsnEOd34EuaJLeMENE0HKiytDVSG5vPy2QzY81jJjGgxRvZp5fnIRNoa0wlpRuIsUnOzD-mOBEJtH9U6EpwsbIs4hYtm1O5nDQRLrYvWDag_KA0scP2zoDYKkJcD1q_iTU573PRv5DlaKksKsYzy7Se-1cbJpii0UNV5gusU5gcIQGMP7U7jwwTw6AquH1exYKqqG6TJuyX3Q2kEMCnGWhQJ3xNWV-H0hkl0_MmsCe9OOsSBGzn47y8_X5Khq78TfQRjFTw",
    lastActive: "Hôm qua, 15:45",
    joinDate: "03 Th01, 2024",
  },
  {
    id: "3",
    name: "BS. Emily Thorne",
    email: "thorne.e@clinicalserenity.com",
    role: "Bác sĩ",
    status: "locked",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCrd_XCEhAEeH1J4mAKYw2BIY6GV5hp6lS_jnyh6srrffDyJrzjwrPugni1myKBdwX8O_GEmJ59fDAUGUYoJ1wrt67dqjpdbad_XimpAn5TZfD1IkfotcOB-3LVOsNxVLvC-90cv-Er70WKqOEsGZpUXv1CbXDvA9vSJ25Zjk7tP4N07QtQDM_l_Tww7PdjSv12kH7Sm4e91oPAWhWr1VnSJXdtB0UWAjyUcvpBXWc4xShXB9RmmC2Hli_WaqfprmsSbcSIAxPS8Q",
    lastActive: "3 ngày trước",
    joinDate: "07 Th06, 2022",
  },
  {
    id: "4",
    name: "Admin Nguyễn Minh",
    email: "admin.nguyen@clinicalserenity.com",
    role: "Quản trị",
    status: "active",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuD06D9LAfN9_kgCqwqmM2M_jrRopYohscu3QjLcT8aDD5osXOBEPVDA-17FeegNEQQvwV6iKzKIr2OzVmv9Jo01gOHN5NdFy3luiM5ZVD8QVa6Zi0lDVyziB5D4YW3ldcqbYPiqpLBHsZMDwk6bqZEUXJy6tO89aPrFJrM0mheM3spGN-8jH2H019hJ8ST87MyhP_wMexWO5v-69uqv0MW67PEV5DkbBJv__ZWbJEcwwIoMs1uqE6mnr74yQeITxNNAen20uiluWQ",
    lastActive: "Hôm nay, 10:00",
    joinDate: "01 Th01, 2022",
  },
  {
    id: "5",
    name: "Trần Thị Lan",
    email: "lan.tran@patientcare.com",
    role: "Bệnh nhân",
    status: "active",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuD94biCO2eBIxf9b34rDIxcsyTkb_aEALWSGZAwgmiGR6NovDN6ZLLlGFLN0hgbeo8S7_1no5T7SbJAE3qjA9ya3HOjXiHCVhgO3NYtjoKsvSljiGUDqEAzeoOqYBiaeImwPFXohjej-VJHe3JR2MUdWrg3gvFmxLpbVRCTrj5CJyDzdqUCpuaQBtj9HhAwoAiQh7H0_Lbd4rUqqT49oP9_ZXPxjCQkJYtQBwXuBJkhYBsAwwpOHxAaFqIlMZPRgYUCscjOy0Owbg",
    lastActive: "2 ngày trước",
    joinDate: "15 Th03, 2024",
  },
  {
    id: "6",
    name: "BS. Phạm Quốc Dũng",
    email: "dung.pham@clinicalserenity.com",
    role: "Bác sĩ",
    status: "active",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAEHG091QDfw97DH4viyp-BfU79_JfMCRrbVMWTT0cAdeVaHBgGhJwWoBw_DJX52IRQGxoEZ1TK70hI7up4ZZIMW5K-WEFW11x0KDKaiDiv1Iv1L-DupGpPmZCQiadE4-JU5zEVs5XTR91417hK7kv_ZIaoNR7qj2YVJQeYdrus98jWUB8o1kOUfMFiOK1NscsHSg5sdjnLu9eyvdiyHnOLpomqa5lERlh-pmUehP4_mMUhGyla62VyxXNc-eXFKvFIdbptg9jswg",
    lastActive: "Hôm nay, 14:20",
    joinDate: "22 Th09, 2021",
  },
  {
    id: "7",
    name: "Lễ tân Thu Hà",
    email: "ha.le@clinicalserenity.com",
    role: "Lễ tân",
    status: "active",
    avatar: "",
    lastActive: "Hôm nay, 08:00",
    joinDate: "05 Th05, 2023",
  },
]

const ROLE_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  "Bác sĩ":    { bg: "bg-blue-50 border border-blue-200",    text: "text-blue-700",    dot: "bg-blue-400"    },
  "Bệnh nhân": { bg: "bg-emerald-50 border border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-400" },
  "Quản trị":  { bg: "bg-violet-50 border border-violet-200",  text: "text-violet-700",  dot: "bg-violet-400"  },
  "Lễ tân":    { bg: "bg-amber-50 border border-amber-200",    text: "text-amber-700",   dot: "bg-amber-400"   },
}

const AVATAR_GRADIENTS = [
  "from-violet-500 to-indigo-600",
  "from-blue-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-sky-500 to-blue-600",
]

function getInitials(name: string) {
  const parts = name.replace(/^(BS\.|Admin)\s*/i, "").trim().split(" ")
  return parts.slice(-2).map((p) => p[0]).join("").toUpperCase()
}

const SORT_OPTIONS = ["Tên (A-Z)", "Vai trò", "Hoạt động gần nhất"]
const ROLE_FILTERS: UserRole[] = ["all", "Bác sĩ", "Bệnh nhân", "Quản trị", "Lễ tân"]

export default function UserListPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<UserRole>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortKey, setSortKey] = useState("Tên (A-Z)")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPageInput, setItemsPerPageInput] = useState("3")
  const [lockDialog, setLockDialog] = useState<{ open: boolean; userId: string | null; currentStatus: UserStatus | null }>({
    open: false, userId: null, currentStatus: null,
  })

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users")
      if (!res.ok) throw new Error("Không thể tải danh sách người dùng.")
      const data = await res.json()
      setUsers(data)
    } catch (err: any) {
      toast.error(err.message || "Đã xảy ra lỗi khi tải danh sách.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter((u) => u.status === "active").length,
    locked: users.filter((u) => u.status === "locked").length,
    patients: users.filter((u) => u.role === "Bệnh nhân").length,
  }), [users])

  const filteredSortedUsers = useMemo(() => {
    let result = [...users]
    if (activeFilter !== "all") result = result.filter((u) => u.role === activeFilter)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    }
    result.sort((a, b) => {
      if (sortKey === "Tên (A-Z)") return a.name.localeCompare(b.name, "vi")
      if (sortKey === "Vai trò") return a.role.localeCompare(b.role, "vi")
      return 0
    })
    return result
  }, [users, activeFilter, searchQuery, sortKey])

  const itemsPerPage = Math.max(1, parseInt(itemsPerPageInput) || 3)
  const totalPages = Math.max(1, Math.ceil(filteredSortedUsers.length / itemsPerPage))
  const paginatedUsers = filteredSortedUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleToggleLock = async () => {
    if (!lockDialog.userId || !lockDialog.currentStatus) return
    const newStatus = lockDialog.currentStatus === "active" ? "locked" : "active"
    const actionText = lockDialog.currentStatus === "active" ? "khóa" : "mở khóa"

    try {
      const res = await fetch(`/api/users/${lockDialog.userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || `Không thể ${actionText} tài khoản.`)
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === lockDialog.userId ? { ...u, status: newStatus } : u))
      )
      toast.success(`Đã ${actionText} tài khoản thành công.`)
    } catch (err: any) {
      toast.error(err.message || "Đã xảy ra lỗi.")
    } finally {
      setLockDialog({ open: false, userId: null, currentStatus: null })
    }
  }

  return (
    <>
      <Topbar searchPlaceholder="Tìm kiếm người dùng..." />

      <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs font-medium text-on-surface-variant/50 mb-6">
          <span>Hệ thống</span>
          <ChevronRight className="size-3" />
          <span className="text-primary font-semibold">Người dùng</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 rounded-xl bg-primary/10">
                <Users className="size-5 text-primary" />
              </div>
              <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">Quản lý Người dùng</h1>
            </div>
            <p className="text-sm text-on-surface-variant ml-[44px]">
              Điều phối quyền truy cập cho nhân viên phòng khám và bệnh nhân.
            </p>
          </div>
          <Link href="/users/new">
            <Button className="bg-primary text-on-primary h-10 px-5 shadow-md shadow-primary/25 hover:shadow-primary/40 hover:brightness-105 transition-all font-semibold gap-2 shrink-0">
              <Plus className="size-4" />
              Thêm người dùng
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Tổng người dùng",  value: stats.total,   color: "text-blue-700",    bg: "bg-blue-50" },
            { label: "Đang hoạt động",    value: stats.active,  color: "text-emerald-700", bg: "bg-emerald-50" },
            { label: "Đã khóa",           value: stats.locked,  color: "text-red-600",     bg: "bg-red-50" },
            { label: "Bệnh nhân", value: stats.patients, color: "text-emerald-700", bg: "bg-emerald-50" },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl p-4 ${s.bg} border border-transparent`}>
              <p className="text-xs font-medium text-on-surface-variant/70 mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-surface-container-low/60 backdrop-blur rounded-2xl px-4 py-3 mb-4 border border-outline-variant/10">
          {/* Left: items per page + search */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-on-surface-variant">
              <Users className="size-4 text-primary/60" />
              <span className="font-medium">Hiển thị</span>
              <Input
                type="number"
                min={1}
                value={itemsPerPageInput}
                onChange={(e) => { setItemsPerPageInput(e.target.value); setCurrentPage(1) }}
                className="h-7 w-14 text-center bg-white border-outline-variant/30 text-sm font-semibold"
              />
              <span className="font-medium">dòng/trang</span>
            </div>

            {/* Role filter chips */}
            <div className="flex gap-1.5 flex-wrap">
              {ROLE_FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => { setActiveFilter(f); setCurrentPage(1) }}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-semibold transition-all",
                    activeFilter === f
                      ? "bg-primary text-on-primary shadow-sm"
                      : "bg-white border border-outline-variant/30 text-on-surface-variant hover:border-primary/30 hover:text-primary"
                  )}
                >
                  {f === "all" ? "Tất cả" : f}
                </button>
              ))}
            </div>
          </div>

          {/* Right: search + sort */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-outline" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
                placeholder="Tìm kiếm..."
                className="pl-8 pr-7 py-1.5 h-7 rounded-lg bg-white border border-outline-variant/30 text-xs outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 w-44"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-outline-variant hover:text-on-surface">
                  <X className="size-3" />
                </button>
              )}
            </div>
            <Select value={sortKey} onValueChange={(v) => { if (v) { setSortKey(v); setCurrentPage(1) } }}>
              <SelectTrigger className="h-7 w-[150px] text-xs bg-white border-outline-variant/30 font-semibold text-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* User Cards */}
        <div className="space-y-3">
          {loading ? (
            <div className="bg-white rounded-2xl border border-outline-variant/10 px-6 py-16 text-center">
              <div className="size-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3" />
              <p className="font-medium text-on-surface-variant">Đang tải danh sách người dùng...</p>
            </div>
          ) : paginatedUsers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-outline-variant/10 px-6 py-16 text-center">
              <Users className="size-10 mx-auto mb-3 opacity-20" />
              <p className="font-medium text-on-surface-variant">Không tìm thấy người dùng nào</p>
              <p className="text-sm opacity-60 mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          ) : paginatedUsers.map((user, index) => {
            const roleStyle = ROLE_STYLES[user.role] ?? ROLE_STYLES["Bệnh nhân"]
            const numericId = parseInt(user.id.slice(-6), 16)
            const gradientIndex = isNaN(numericId) ? index % AVATAR_GRADIENTS.length : numericId % AVATAR_GRADIENTS.length
            const gradient = AVATAR_GRADIENTS[gradientIndex]
            const initials = getInitials(user.name)
            return (
              <div
                key={user.id}
                className={cn(
                  "group relative bg-white rounded-2xl border transition-all duration-200",
                  user.status === "locked"
                    ? "border-red-100 bg-red-50/30 opacity-80"
                    : "border-outline-variant/10 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
                )}
              >
                <div className="flex items-center gap-5 p-4 pr-5">
                  {/* Avatar */}
                  <div className={`relative size-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 shadow-md`}>
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="size-14 rounded-2xl object-cover" />
                    ) : (
                      <span className="text-white font-bold text-lg tracking-wide">{initials}</span>
                    )}
                    {user.status === "locked" && (
                      <div className="absolute -bottom-1 -right-1 size-5 rounded-full bg-red-500 border-2 border-white flex items-center justify-center">
                        <Lock className="size-2.5 text-white" />
                      </div>
                    )}
                    {user.status === "active" && (
                      <div className="absolute -bottom-1 -right-1 size-3.5 rounded-full bg-emerald-400 border-2 border-white" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 grid grid-cols-1 lg:grid-cols-3 gap-y-2 gap-x-6">
                    {/* Name & role */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold", roleStyle.bg, roleStyle.text)}>
                          <span className={cn("size-1.5 rounded-full", roleStyle.dot)} />
                          {user.role}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-on-surface truncate">{user.name}</h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Mail className="size-3 text-primary/50 shrink-0" />
                        <span className="text-xs text-on-surface-variant truncate">{user.email}</span>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/50 hidden lg:block">Thông tin</p>
                      <div className="text-xs text-on-surface-variant">
                        <span className="font-medium">Hoạt động: </span>{user.lastActive}
                      </div>
                      <div className="text-xs text-on-surface-variant">
                        <span className="font-medium">Tham gia: </span>{user.joinDate}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center lg:justify-end">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold",
                        user.status === "active"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-red-50 text-red-600 border border-red-200"
                      )}>
                        <span className={cn("size-1.5 rounded-full", user.status === "active" ? "bg-emerald-400" : "bg-red-400")} />
                        {user.status === "active" ? "Đang hoạt động" : "Đã khóa"}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {(user.role === "Bệnh nhân" || user.role === "Bác sĩ") && (
                      <Link 
                        href={user.role === "Bệnh nhân" ? `/users/${user.id}/history` : `/doctors/${user.id}/history`}
                        title={user.role === "Bệnh nhân" ? "Xem lịch sử được khám" : "Xem lịch sử đi khám"}
                      >
                        <Button variant="ghost" size="icon-sm" className="text-violet-600 hover:text-violet-850 hover:bg-violet-50 rounded-xl">
                          <History className="size-4" />
                        </Button>
                      </Link>
                    )}
                    <Link href={`/users/${user.id}/edit`}>
                      <Button variant="ghost" size="icon-sm" className="text-primary/60 hover:text-primary hover:bg-primary/10 rounded-xl">
                        <Edit2 className="size-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setLockDialog({ open: true, userId: user.id, currentStatus: user.status })}
                      className={cn(
                        "rounded-xl",
                        user.status === "active"
                          ? "text-red-400/70 hover:text-red-600 hover:bg-red-50"
                          : "text-emerald-500/70 hover:text-emerald-600 hover:bg-emerald-50"
                      )}
                    >
                      {user.status === "active" ? <Lock className="size-4" /> : <LockOpen className="size-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-5 border-t border-outline-variant/10">
          <p className="text-sm text-on-surface-variant">
            Hiển thị <span className="font-semibold text-on-surface">{filteredSortedUsers.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredSortedUsers.length)}</span> trong số <span className="font-semibold text-on-surface">{filteredSortedUsers.length}</span> người dùng
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border-outline-variant/30 disabled:opacity-40"
            >
              <ChevronLeft className="size-4" />
            </Button>
            {Array.from({ length: totalPages }).map((_, idx) => {
              const page = idx + 1
              return (
                <Button
                  key={page}
                  size="icon-sm"
                  variant={currentPage === page ? "default" : "ghost"}
                  className={cn(
                    "rounded-lg text-xs font-semibold min-w-[30px]",
                    currentPage === page ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:bg-surface-container-low"
                  )}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              )
            })}
            <Button
              variant="outline"
              size="icon-sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border-outline-variant/30 disabled:opacity-40"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={lockDialog.open}
        onClose={() => setLockDialog({ open: false, userId: null, currentStatus: null })}
        onConfirm={handleToggleLock}
        title={lockDialog.currentStatus === "active" ? "Khóa tài khoản?" : "Mở khóa tài khoản?"}
        description={
          lockDialog.currentStatus === "active"
            ? "Người dùng sẽ không thể đăng nhập vào hệ thống cho đến khi được mở khóa."
            : "Người dùng sẽ có thể đăng nhập lại và sử dụng hệ thống bình thường."
        }
        confirmText={lockDialog.currentStatus === "active" ? "Khóa tài khoản" : "Mở khóa"}
        cancelText="Hủy"
        destructive={lockDialog.currentStatus === "active"}
      />
    </>
  )
}
