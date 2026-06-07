"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Tag, Plus, Search, Trash2, Loader2 } from "lucide-react"
import { SearchCombobox } from "@/components/search-combobox"
import { fmtCurrency } from "@/lib/date-utils"

interface ServiceItem {
  id: string
  name: string
  qty: number
  unit: string
  price: number
  type: "vip" | "thuong" | "khuyenmai"
}

interface ServicesTableProps {
  items: ServiceItem[]
  setItems: React.Dispatch<React.SetStateAction<ServiceItem[]>>
  discount: number
  setDiscount: (discount: number) => void
}

// Map priceType from DB to internal type key
const PRICE_TYPE_MAP: Record<string, string> = {
  "Thường": "thuong",
  "VIP": "vip",
  "Khuyến mãi": "khuyenmai",
}

const PRICE_TYPE_REVERSE: Record<string, string> = {
  "thuong": "Thường",
  "vip": "VIP",
  "khuyenmai": "Khuyến mãi",
}

interface DbService {
  id: string
  name: string
  category: string
  status: string
}

interface DbPricing {
  id: string
  serviceId: string
  serviceName: string
  priceType: string
  standardPrice: number
  validFrom: string
  validTo: string | null
  status: string
}

export function ServicesTable({
  items,
  setItems,
  discount,
  setDiscount
}: ServicesTableProps) {
  const [dbServices, setDbServices] = useState<DbService[]>([])
  const [dbPricing, setDbPricing] = useState<DbPricing[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch real services and pricing from database
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [svcRes, priceRes] = await Promise.all([
          fetch("/api/services"),
          fetch("/api/pricing"),
        ])
        if (svcRes.ok) {
          const services = await svcRes.json()
          setDbServices(services.filter((s: DbService) => s.status === "active"))
        }
        if (priceRes.ok) {
          const pricing = await priceRes.json()
          // Only use applied pricing entries
          setDbPricing(pricing.filter((p: DbPricing) => p.status === "applied"))
        }
      } catch (err) {
        console.error("Lỗi tải dịch vụ/bảng giá:", err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Build a price lookup: serviceId -> { thuong: price, vip: price, khuyenmai: price }
  const priceLookup = useMemo(() => {
    const lookup: Record<string, Record<string, number>> = {}
    
    for (const p of dbPricing) {
      const typeKey = PRICE_TYPE_MAP[p.priceType] || p.priceType.toLowerCase()
      if (!lookup[p.serviceId]) {
        lookup[p.serviceId] = {}
      }
      // If multiple pricing entries exist for same service+type, use the latest (highest pricingId)
      // Since dbPricing is already sorted by pricingId desc, the first one wins
      if (lookup[p.serviceId][typeKey] === undefined) {
        lookup[p.serviceId][typeKey] = p.standardPrice
      }
    }
    return lookup
  }, [dbPricing])

  // Map services to combobox items
  const serviceComboItems = useMemo(() => {
    return dbServices.map(s => ({
      id: s.id,
      name: s.name,
      sub: s.category,
    }))
  }, [dbServices])

  // Helper: get price for a service by type
  const getServicePrice = (serviceId: string, type: string): number => {
    return priceLookup[serviceId]?.[type] ?? 0
  }

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.qty, 0)
  const finalPrice = Math.max(0, totalPrice - discount)

  const addItem = () => {
    setItems(prev => [
      ...prev, 
      { id: Math.random().toString(), name: "", qty: 1, unit: "lần", price: 0, type: "thuong" }
    ])
  }

  const updateItem = (id: string, field: keyof ServiceItem, value: any) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, [field]: value } : it))
  }
  
  const updateItemFields = (id: string, updates: Partial<ServiceItem>) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, ...updates } : it))
  }

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(it => it.id !== id))
  }

  return (
    <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden flex flex-col">
      <div className="px-6 py-4 border-b border-outline-variant/10 bg-surface-container-low/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="size-4 text-primary" />
          <h2 className="font-bold text-sm text-on-surface">Dịch vụ & Chi phí</h2>
          {loading && <Loader2 className="size-3.5 text-primary/50 animate-spin" />}
        </div>
        <Button 
          type="button"
          onClick={addItem} 
          variant="ghost" 
          size="sm" 
          className="h-8 text-xs font-semibold text-primary hover:bg-primary/10 hover:text-primary rounded-lg border border-primary/20 bg-primary/5"
        >
          <Plus className="size-3.5 mr-1" />
          Thêm dịch vụ
        </Button>
      </div>
      
      <div className="p-6 overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="text-left border-b border-outline-variant/10">
              <th className="text-[10px] font-bold text-on-surface-variant/50 uppercase pb-3 w-full">Dịch vụ / Vật tư</th>
              <th className="text-[10px] font-bold text-on-surface-variant/50 uppercase pb-3 whitespace-nowrap pl-4 w-24 text-center">SL</th>
              <th className="text-[10px] font-bold text-on-surface-variant/50 uppercase pb-3 text-right whitespace-nowrap pl-4 w-40">Đơn giá</th>
              <th className="text-[10px] font-bold text-on-surface-variant/50 uppercase pb-3 text-right whitespace-nowrap pl-4 w-40">Thành tiền</th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-xs text-on-surface-variant/40 italic bg-slate-50/50">
                  Chưa có dịch vụ nào được thêm. Nhấn "Thêm dịch vụ" để bắt đầu.
                </td>
              </tr>
            ) : items.map((item) => {
              // Find the matching DB service for this item
              const matchedSvc = dbServices.find(s => s.name === item.name)
              const svcId = matchedSvc?.id

              return (
                <tr key={item.id} className="group">
                  <td className="py-2.5 pr-4">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <SearchCombobox
                          items={serviceComboItems}
                          value={item.name ? { id: svcId || item.id.toString(), name: item.name } : null}
                          onSelect={(selected) => {
                            if (selected) {
                              const svc = dbServices.find(s => s.id === selected.id)
                              if (svc) {
                                const t = item.type || "thuong"
                                const price = getServicePrice(svc.id, t)
                                updateItemFields(item.id, {
                                  name: svc.name,
                                  type: t,
                                  qty: 1,
                                  price,
                                })
                              }
                            } else {
                              updateItemFields(item.id, { name: "", price: 0, qty: 0 })
                            }
                          }}
                          placeholder="Chọn dịch vụ"
                          icon={Search}
                          containerClassName="h-9 text-xs rounded-lg"
                          iconClassName="left-3 size-3.5"
                          inputClassName="pl-9 pr-8"
                          renderItem={(s) => (
                            <div className="flex items-center justify-between w-full gap-2">
                              <span className="font-medium text-on-surface truncate">{s.name}</span>
                              {s.sub && (
                                <span className="text-[10px] text-on-surface-variant/50 shrink-0">{s.sub}</span>
                              )}
                            </div>
                          )}
                        />
                      </div>
                      {(() => {
                        const hasThuong = svcId ? getServicePrice(svcId, "thuong") > 0 : true
                        const hasVip = svcId ? getServicePrice(svcId, "vip") > 0 : true
                        const hasKhuyenmai = svcId ? getServicePrice(svcId, "khuyenmai") > 0 : true

                        return (
                          <Select 
                            value={item.type} 
                            onValueChange={v => {
                              if (!v) return
                              if (svcId) {
                                const price = getServicePrice(svcId, v)
                                updateItemFields(item.id, { type: v as any, price })
                              } else {
                                updateItem(item.id, "type", v)
                              }
                            }}
                          >
                            <SelectTrigger className="h-9 w-[110px] text-[10px] font-bold uppercase tracking-wider bg-slate-50 border-transparent focus:ring-primary/20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="thuong" disabled={!hasThuong}>Thường</SelectItem>
                              <SelectItem value="vip" disabled={!hasVip}>VIP</SelectItem>
                              <SelectItem value="khuyenmai" disabled={!hasKhuyenmai}>Khuyến mãi</SelectItem>
                            </SelectContent>
                          </Select>
                        )
                      })()}
                    </div>
                  </td>
                  <td className="py-2.5 pl-4">
                    <Input 
                      type="number" 
                      min="1" 
                      value={item.qty || ""} 
                      onChange={e => updateItem(item.id, "qty", parseInt(e.target.value) || 0)} 
                      className="w-14 h-9 text-xs font-mono text-center bg-slate-50 border-transparent focus-visible:ring-primary/20"
                    />
                  </td>
                  <td className="py-2.5 pl-4 text-right text-xs font-mono font-medium text-on-surface-variant whitespace-nowrap">
                    {item.price > 0 ? fmtCurrency(item.price) : "—"}
                  </td>
                  <td className="py-2.5 pl-4 text-right text-xs font-bold text-on-surface whitespace-nowrap">
                    {fmtCurrency(item.price * item.qty)}
                  </td>
                  <td className="py-2.5 pl-2 text-right">
                    <button 
                      type="button"
                      onClick={() => removeItem(item.id)} 
                      className="p-2 text-on-surface-variant/30 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="px-6 pb-6 pt-2 mt-auto">
        <div className="rounded-2xl bg-slate-50 p-5 space-y-3 w-full sm:w-[320px] ml-auto border border-outline-variant/10">
          <div className="flex justify-between items-center text-xs">
            <span className="text-on-surface-variant/60 font-medium">Tổng dịch vụ</span>
            <span className="font-bold">{fmtCurrency(totalPrice)}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-emerald-600 font-medium">Giảm giá</span>
            <Input 
              type="number" 
              min="0"
              step="50000"
              value={discount || ""} 
              onChange={e => setDiscount(parseInt(e.target.value) || 0)} 
              placeholder="0"
              className="h-8 w-28 text-xs font-mono text-right bg-white border-outline-variant/20 focus-visible:ring-primary/20 text-emerald-700 font-bold"
            />
          </div>
          <div className="flex justify-between items-center text-sm font-bold border-t border-outline-variant/10 pt-3 mt-3">
            <span className="text-on-surface uppercase tracking-wider text-[10px]">Tổng thanh toán</span>
            <span className="text-primary text-base">{fmtCurrency(finalPrice)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
